// Leaflet Drawing Event Handlers
//
// Manages the polygon drawing lifecycle on the map:
//   - createDrawControl: configures the Leaflet Draw toolbar (polygon only)
//   - handleDrawCreated: on polygon creation, sends geometry to the backend
//     PostGIS function, renders proximity lines on the map, and updates
//     constraint information state
//   - handleDrawDeleted: cleans up layers and resets constraint state
//   - sourceArray: module-level accumulator for distance values per feature
//     type, consumed by the drawing-to-summary pipeline

import L from 'leaflet';
//import { fetchAndShowProximity, parseProximityInfo } from '../../lib/proximityLines';
import type { LineObject } from './proximityLines/proximityLinesInterface';
import type { DrawEvents } from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import parseProximityFromLines from './proximityLines/proximityLineConfig';
import axios from 'axios';
import * as turf from '@turf/turf';
import { SimpleMapScreenshoter } from 'leaflet-simple-map-screenshoter';


//export interface TeigInfo {
//roadDistance: string | null;
//proximityFeatures: any[];
//vegFeatures: any[];
//teigFeatures: any[];
//bygningFeatures: any[];
//}

//export interface DrawCreatedCallbacks {
  //matrikkelNr?: string 
//addBuilding: (building: any) => string;
//calculateBRABYA: (propertyArea?: number) => void;
//setTeigInfo: (info: TeigInfo) => void;
//setShowInfoPanel: (show: boolean) => void;
//setShowBRAPanel: (show: boolean) => void;
//}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let drawnPolygonArea: number = 0;

export function getDrawnPolygonArea(): number {
  return drawnPolygonArea;
}

const vegArray: [number, number][] = [];

export function getVegArray(): [number, number][] {
  return vegArray;
}

export type ProximityDetailPayload = {
  rawData: LineObject[];
}

export type ProximityDetailCallback = (payload: ProximityDetailPayload) => void;
//Proximitydetailcallback is a function type: "This function takes one argument of type ProximityDetailPayload and returns void"

const sourceArray: Record<string, number[]> = {
  "jernbane": [],
  "eiendomsgrense": [],
  "naboBebyggelse": [],
  "eiendomBebyggelse": [],
  "jordskred": [],
  "flom": [],
  "hoyvann": []
};
 //This is used to store the distances for each source type, which is then set in the questionArray state in Map.tsx. 
// This is done because the handleDrawCreated function is async and we need to wait for the response before setting the state, 
// if we set the state directly in the function, it will not update the state correctly because of the async nature of the function.
//  By using a regular variable, we can ensure that we have the correct values before setting the state.

export interface drawDeletedCallbacks {
  setContraintsInfo: (info: site_constraints_props) => void;
  setInfoPanelVisibility: (show: boolean) => void;
}

/**
 * Create Leaflet Draw control with polygon drawing enabled
 * @param drawnItems - Feature group for drawn items
 * @returns Leaflet Draw control instance
 */
export function createDrawControl(drawnItems: L.FeatureGroup): any {
  // @ts-expected-error - L.drawLocal is from leaflet-draw library
  L.drawLocal.draw.toolbar.buttons.polygon = 'Tegn byggeområde';
  // @ts-expected-error
  L.drawLocal.draw.toolbar.actions.title = 'Avbryt';
  // @ts-expected-error
  L.drawLocal.draw.toolbar.actions.text = 'Avbryt';
  // @ts-expected-error
  L.drawLocal.draw.toolbar.finish.title = 'Fullfør';
  // @ts-expected-error
  L.drawLocal.draw.toolbar.finish.text = 'Fullfør';
  // @ts-expected-error
  L.drawLocal.draw.toolbar.undo.title = 'Slett siste punkt';
  // @ts-expected-error
  L.drawLocal.draw.toolbar.undo.text = 'Slett siste punkt';
  // @ts-expected-error
  L.drawLocal.edit.toolbar.actions.save.title = 'Lagre';
  // @ts-expected-error
  L.drawLocal.edit.toolbar.actions.save.text = 'Lagre';
  // @ts-expected-error
  L.drawLocal.edit.toolbar.actions.cancel.title = 'Avbryt';
  // @ts-expected-error
  L.drawLocal.edit.toolbar.actions.cancel.text = 'Avbryt';
  // @ts-expected-error
  L.drawLocal.edit.toolbar.actions.clearAll.title = 'Slett alle markeringer';
  // @ts-expected-error
  L.drawLocal.edit.toolbar.actions.clearAll.text = 'Slett alle';
  // @ts-expected-error
  L.drawLocal.edit.toolbar.buttons.edit = 'Rediger markeringer';
  // @ts-expected-error
  L.drawLocal.edit.toolbar.buttons.editDisabled = 'Ingen markeringer å redigere';
  // @ts-expected-error
  L.drawLocal.edit.toolbar.buttons.remove = 'Slett markeringer';
  // @ts-expected-error
  L.drawLocal.edit.toolbar.buttons.removeDisabled = 'Ingen markeringer å slette';

  // @ts-expected-error- L.Control.Draw is from leaflet-draw library
  return new L.Control.Draw({
    position: 'bottomleft',
    edit: { featureGroup: drawnItems },
    draw: {
      polygon: {},
      polyline: false,
      rectangle: false,
      circle: false,
      marker: false,
      circlemarker: false,
    },
  });
}

export interface site_constraints_props {
  roadDistance: string | null;
  allProximityInfo: number[];
  roadInfo: { source: string; distance_m: number }[];
  eiendomsgrenseInfo: number[];
  nabobebyggelseInfo: number[];
  eiendomBebyggelseInfo: number[];
  jordskredInfo: number[];
  hoyvannInfo: number[]
  drawnPolygonArea?: number;   
}

export interface drawCreatedCallbacks {
  setContraintsInfo: (info: site_constraints_props) => void;
  setInfoPanelVisibility: (show: boolean) => void;
  matrikkelNr?: string;
}

/**
 * Handle draw:created event
 * @param event - Leaflet draw event
 * @param isDemolitionMode - Whether demolition mode is active
 * @param demolitionHandler - Handler function for demolition polygons
 * @param drawnItems - Feature group for drawn items
 * @param map - Leaflet map instance
 * @param proximityLayer - Feature group for proximity lines
 * @param currentPropertyArea - Current property area in m²
 * @param callbacks - Callback functions for state updates
 */
export async function handleDrawCreated(
  event: DrawEvents.Created | DrawEvents.Edited,
  drawnItems: L.FeatureGroup,
  proximityLayers: Record<string, L.LayerGroup>,
  callbacks: drawCreatedCallbacks,
  proximityDetail?: ProximityDetailCallback
): Promise<void> {
  vegArray.length = 0;
  sourceArray["jernbane"] = [];
  sourceArray["eiendomsgrense"] = [];
  sourceArray["naboBebyggelse"] = [];
  sourceArray["eiendomBebyggelse"] = [];
  sourceArray["jordskred"] = [];
  sourceArray["flom"] = [];
  sourceArray["hoyvann"] = [];
  

  let layer: L.Layer | null = null; 
  //Remember, drawcreated use layer, and drawedited use layers (s)

// draw:created
if ('layer' in event && event.layer) {
  layer = event.layer;
  drawnItems.addLayer(layer!);  // layer! means we are telling typescript that the value is not null
}

// draw:edited (Save after edit)
if (!layer && 'layers' in event && event.layers) {
  // Get the first (and typically only) edited polygon
  const editedLayers: L.Layer[] = [];
  event.layers.eachLayer((l: L.Layer) => {
    editedLayers.push(l);
  });
  if(editedLayers.length > 0){
    layer = editedLayers[0]; //Take the edited polygon (all vertices included)
  }
}

if (!layer) {
  console.warn("No layer found in draw event");
  return;
}


  const geoLayer = layer as L.Layer & {toGeoJSON?: () => any}
  if(typeof geoLayer.toGeoJSON !== 'function'){
    console.warn("Layer has no toGeoJSON()");
    return;
  }


  try {
    // Reset sourceArray so old draws don't bleed into the new one
    for (const key of Object.keys(sourceArray)) {
      sourceArray[key] = [];
    }

    // Clear old proximity lines before drawing new ones
    Object.values(proximityLayers).forEach(lg => lg.clearLayers());

    const geojson = geoLayer.toGeoJSON();
    drawnPolygonArea = turf.area(geojson); // area in m²
    console.log("Building size:", drawnPolygonArea, "m²");
    const matrikkelNr = callbacks.matrikkelNr;
    const response = await axios.get(`${API_BASE_URL}/PostGISfnShortestLines`, {
      params: {
        geomInput: JSON.stringify(geojson.geometry),
        matrikkelNr: matrikkelNr 
      }
    });
    console.log("Backend response:", response.data); //DEBUG
    // Collect all line objects first, then process once
    const rawData = response.data as LineObject[];
    const allLineObjects: LineObject[] = [];
    const highlighted: { current: L.Polyline | null } = { current: null };

    function addPolyline(coordinates: LatLngTuple[], color: string, label: string, targetLayer: L.LayerGroup): L.Polyline {
      const polyline = L.polyline(coordinates, { color, className: "proximity-line" });
      (polyline as any)._originalColor = color;
      polyline.on('click', function () {
        if (highlighted.current && highlighted.current !== polyline) {
          highlighted.current.setStyle({ color: (highlighted.current as any)._originalColor, weight: 3, opacity: 1 });
        }
        polyline.setStyle({weight: 6, opacity: 1 });
        polyline.openTooltip();
        highlighted.current = polyline;
      });
      polyline.bindTooltip(label);
      targetLayer.addLayer(polyline);
      return polyline;
    }

    const roadSources = ["Ukategorisert veg", "kommunal veg", "privat veg", "skogsveg", "fylkesveg", "riksveg", "europaveg"];
    const localRoads = ['Ukategorisert veg', 'kommunal veg', 'privat veg', 'skogsveg'];

    for (const obj of response.data as LineObject[]) {
      const { line, source, distance_m, paakrevd_avstand } = obj;
      if (distance_m.toFixed(1) === "0.0") continue;

      const coords = line.coordinates.map(([lng, lat]) => [lat, lng]) as LatLngTuple[];
      const label = `${source} (${distance_m.toFixed(1)}m)`;

      if (roadSources.includes(source)) {
        const limit = localRoads.includes(source) ? 15 : 50;
        if (distance_m > limit) continue;
        addPolyline(coords, '#004EA8', label, proximityLayers.roads);
        vegArray.push([distance_m, paakrevd_avstand]);
      } else if (source === "eiendomsgrense") {
        addPolyline(coords, '#004EA8', label, proximityLayers.propertyBorder);
        sourceArray["eiendomsgrense"].push(distance_m);
      } else if (source === "naboBebyggelse") {
        addPolyline(coords, '#004EA8', label, proximityLayers.neighbourBuilding);
        sourceArray["naboBebyggelse"].push(distance_m);
      } else if (source === "eiendomBebyggelse") {
        addPolyline(coords, '#004EA8', label, proximityLayers.propertyBuilding);
        sourceArray["eiendomBebyggelse"].push(distance_m);
      } else if (source === "jernbane") {
        addPolyline(coords, 'black', label, proximityLayers.trainTracks);
        sourceArray["jernbane"].push(distance_m);
      } else if (source === "jordskred") {
        addPolyline(coords, 'yellow', label, proximityLayers.jordskred);
        sourceArray["jordskred"].push(distance_m);
      } else if (source === "flom") {
        addPolyline(coords, 'purple', label, proximityLayers.flom);
        sourceArray["flom"].push(distance_m);
      } else if (source === "hoyvann") {
        addPolyline(coords, '#69B3E7', label, proximityLayers.hoyvann);
        sourceArray["hoyvann"].push(distance_m);
      } else {
        continue;
      }

      allLineObjects.push(obj);
    }

    //console.log(allLineObjects, "Values from the allLineObject");

    //const filteredObjects = allLineObjects.filter(obj => obj.distance_m > 0) //filtering out zeroes 

    //const info = parseProximityFromLines(filteredObjects); //Using the zero filter to parse proximityLines
    const info = parseProximityFromLines(allLineObjects);
    info.drawnPolygonArea = drawnPolygonArea;
    callbacks.setContraintsInfo(info);
    callbacks.setInfoPanelVisibility(true);
    
    proximityDetail?.({rawData}); //Sendign the raw proximity data to the callback

    console.log("Data heading for the PDF generator:", {rawData});
    console.log(info ?? "No value from proximityFromLines")


    return;
  }
  catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log("Error:", err.response?.status, err.response?.data);
    }
    else {
      console.log(err);
    }
    return;
  }
}



export function getSourceArray(): { [key: string]: number[] } {
  return sourceArray;
};

/**
 * Handle draw:deleted event
 * @param event - Leaflet draw event
 * @param proximityLayer - Feature group for proximity lines
 * @param callbacks - Callback functions for state updates
 */
export function handleDrawDeleted(
  event: DrawEvents.Deleted,
  proximityLayers: Record<string, L.LayerGroup>,
  callbacks: drawDeletedCallbacks
): void {
  Object.values(proximityLayers).forEach(lg => lg.clearLayers());

  if (!event) return

  // Reset teigInfo state
  callbacks.setContraintsInfo({
    roadDistance: null,
    allProximityInfo: [],
    roadInfo: [],
    eiendomsgrenseInfo: [],
    nabobebyggelseInfo: [],
    eiendomBebyggelseInfo: [],
    jordskredInfo: [],
    hoyvannInfo: []
  });
  callbacks.setInfoPanelVisibility(false);
}

export function handleResetForEdit(
  event: DrawEvents.Deleted,
  callbacks: drawDeletedCallbacks
): void {

  if (!event) return

  // Reset teigInfo state
  callbacks.setContraintsInfo({
    roadDistance: null,
    allProximityInfo: [],
    roadInfo: [],
    eiendomsgrenseInfo: [],
    nabobebyggelseInfo: [],
    eiendomBebyggelseInfo: [],
    jordskredInfo: [],
    hoyvannInfo: []
  });
  callbacks.setInfoPanelVisibility(false);
}

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

export async function captureMapDraw(map: L.Map, zoomOutSteps = 0):
Promise<string | null>
{
  if(!map) return null

  try {
    const steps = Number.isFinite(zoomOutSteps) ? Math.max(0, Math.floor(zoomOutSteps)) : 0;
    const originalCenter = map.getCenter();
    const originalZoom = map.getZoom();
    const captureZoom = Math.max(map.getMinZoom(), originalZoom - steps);

    if (captureZoom !== originalZoom) {
      map.setView(originalCenter, captureZoom, { animate: false });
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
    }

    const screenShoter = new SimpleMapScreenshoter({
      hidden: true,
      screenName: "DiBK skjermbilde",
      preventDownload: false
    });

    screenShoter.addTo(map);
    let result: Blob | null = null;
    try {
      // Let map tiles and transforms settle before capture.
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      await waitForVisibleTileLayers(map, 2500);

      const raw = await screenShoter.takeScreen("blob", {
        mimeType: "image/jpeg",
        domtoimageOptions: {
          cacheBust: true
        }
      });

      if (raw instanceof Blob) {
        result = raw;
      }
    } finally {
      screenShoter.remove();
      if (captureZoom !== originalZoom) {
        map.setView(originalCenter, originalZoom, { animate: false });
      }
    }

    if (!result) {
      return null;
    }

    if (result.size === 0 || !result.type.startsWith('image/')) {
      return null;
    }

    const dataUrl = await blobToDataUrl(result);

    if (!dataUrl || dataUrl === 'data:,') {
      console.warn('Map screenshot appears empty');
      return null;
    }

    console.log("Map screenshot captured", { chars: dataUrl.length });
    return dataUrl;

  } catch(e){
    console.error(`An error occured, error code: ${e}`);
    return null
  }

}

async function waitForVisibleTileLayers(map: L.Map, timeoutMs = 2000): Promise<void> {
  const tileLayers: L.TileLayer[] = [];

  map.eachLayer((layer) => {
    if (layer instanceof L.TileLayer && map.hasLayer(layer)) {
      tileLayers.push(layer);
    }
  });

  if (tileLayers.length === 0) return;

  await Promise.all(
    tileLayers.map(
      (layer) =>
        new Promise<void>((resolve) => {
          const anyLayer = layer as unknown as { _loading?: boolean };

          // Already loaded (or no active load in progress)
          if (!anyLayer._loading) {
            resolve();
            return;
          }

          let done = false;
          const finish = () => {
            if (done) return;
            done = true;
            layer.off("load", finish);
            layer.off("tileerror", finish);
            clearTimeout(timer);
            resolve();
          };

          const timer = setTimeout(finish, timeoutMs);
          layer.once("load", finish);
          layer.once("tileerror", finish);
        })
    )
  );
}
