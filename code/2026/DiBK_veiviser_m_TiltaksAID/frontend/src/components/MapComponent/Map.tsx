
// Interactive Map Component
//
// Central map view built on Leaflet with Norwegian CRS (EPSG:25832).
// Responsibilities:
//   - Renders the base WMS map layer (standard or HD)
//   - Supports polygon drawing via leaflet-draw for site placement
//   - Sends drawn geometry to the backend for proximity analysis
//   - Displays proximity lines (distance to roads, buildings, boundaries)
//   - Toggles optional WMS overlays (matrikkel, FKB, landslide zones, exits)
//   - Integrates address search to pan/zoom and load property boundaries
//   - Navigates to the summary page when drawing triggers rule violations
import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'

//Components
import SearchBar from '../SearchBar/SearchBar';
import InfoPanel, { questionLayerMap } from './InfoPanel';
import BYATool from './BYATool';
import * as turf from '@turf/turf';
import { createDrawControl, handleDrawCreated, handleDrawDeleted, handleResetForEdit } from '../../lib/map/drawingHandlers';

//Toggle components
import HamburgerMenu from './HamburgerMenu';
import { captureMapDraw } from '../../lib/map/drawingHandlers';
import { fetchAvkjorsler, displayAvkjorsler } from "../../lib/oldCode/avkjorsler";
import { fetchMatrikkelGeo, GetPropertyInformation, buildArealplanerUrl, type propertyDetailCallback } from '../../lib/map/getPlaces';
import ToggleAvkjorsel from './ToggleComponent/AvskjorselComponent/Avkjorsel';
import ToggleMatrikkel from './ToggleComponent/ToggleMatrikkel/ToggleMatrikkel';
import ToggleFKB from './ToggleComponent/ToggleFKB/ToggleFKB';
import ToggleHdMap from './ToggleComponent/ToggleMaps/ToggleHdMap';
import ToggleJordskred from './ToggleComponent/ToggleJordskred/ToogleJordskred';
import { 
  toggleMatrikkelLayer as toggleMatrikkelLayerLib,
  handleFKBLayerVisibility as handleFKBLayerVisibilityLib,
  handleJordFlomLayerVisibility as handleJordFlomVisibilityLib //Can remove later, to test for jordskred proximity line drawn on the map
} from "../../lib/map/mapLayers";
import type SearchProperties from '../SearchBar/SearchPropertiesInterface';
import type { ProximityDetailCallback, site_constraints_props } from '../../lib/map/drawingHandlers';

//leaflet and plugins
import 'leaflet-draw';
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-defaulticon-compatibility'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import L from "leaflet"
import type { DrawEvents } from 'leaflet';

//config for layers
import {crs, WMS_URL, WMS_OPTIONS, WMS_OPTIONS_HD, WMS_URL_HD, rulesConfig} from "../../lib/config" //For the layer

import { /* convertToReceiptState, */ handleDrawingData} from '../../lib/DrawingQuestionAnswering/checkViolations';
import {checkViolations} from '../../lib/DrawingQuestionAnswering/checkViolations';

//css
import './Map.css';
import { useNavigate } from 'react-router-dom';

type MapProps = { //using the props here and calling it in the Map function parameter, instead of writting it in the parameter
  onLoadingChange?: (isLoading: boolean) => void;
  setAnswer?: (id: string, value: string) => void;
  goToQuestion?: (index: number) => void;
  onDrawingDone?: () => void;
  currentQuestionId?: string | undefined;
  onMapScreenshot?: (dataUrl: string | null) => void;
  initialAddress?: string;
  mapVisible?: boolean;
  onArealplanerUrl?: (url: string | null) => void;
  section2StartIndex?: number;
  onOpenTutorial?: () => void;
  proximityInformation?: ProximityDetailCallback;
  rawDataInformation?: propertyDetailCallback;
}

function Map({onLoadingChange, setAnswer, goToQuestion, onDrawingDone, currentQuestionId, onMapScreenshot, initialAddress, mapVisible, onArealplanerUrl, section2StartIndex = 6, onOpenTutorial, proximityInformation, rawDataInformation}: MapProps ) {
  const leafletMapRef = useRef<L.Map | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const drawnItemsRef = useRef<L.FeatureGroup>(L.featureGroup());
  const matrikkelPolygonsRef = useRef<L.FeatureGroup>(L.featureGroup());
  const proximityLayersRef = useRef<Record<string, L.LayerGroup>>({
    roads:             L.layerGroup(),
    propertyBorder:    L.layerGroup(),
    neighbourBuilding: L.layerGroup(),
    propertyBuilding:  L.layerGroup(),
    trainTracks:       L.layerGroup(),
    jordskred:         L.layerGroup(),
    flom:              L.layerGroup(),
    hoyvann:           L.layerGroup(),
  });
  const matrikkelLayerRef = useRef<L.TileLayer.WMS | null>(null);
  const fkbLayerRef = useRef<L.TileLayer.WMS | null>(null);
  const jordskredFlomLayerRef = useRef<L.TileLayer.WMS | null>(null);
  const avkjorslerLayerRef = useRef<L.FeatureGroup>(L.featureGroup());
  const baseLayerRef = useRef<L.Layer | null>(null);
  // --- Live distance labels while drawing ---
  const liveLabelsRef = useRef<L.LayerGroup>(L.layerGroup());
  // --- Ruler tool ---
  const rulerLayerRef = useRef<L.LayerGroup>(L.layerGroup());

  // --- State: UI toggle flags and derived constraint data ---
  const [isAllMatrikkel, setMatrikkelVisible] = useState(true);
  const [isHdMap, setHdMapVisible] = useState(false);
  const [fkbVisible, setFkbVisible] = useState(true);
  const [jordksredVisibile, setJordSkredVisible] = useState(false); //Can remove later, to test for jordskred proximity line drawn on the map
  const [avkjorselVisible, setAvkjorselVisible] = useState(false);
  const [isAvkjorselError, setAvkjorselError] = useState("");
  const [searchProps, setSearchProps] = useState<SearchProperties>({});
  const navigate = useNavigate();
  const [constraintsInformation, setContraintsInfo] = useState<site_constraints_props>({
    roadDistance: null,
    allProximityInfo: [],
    roadInfo: [],
    eiendomsgrenseInfo: [],
    nabobebyggelseInfo: [],
    eiendomBebyggelseInfo: [],
    jordskredInfo: [],
    hoyvannInfo: []
  })
  const [showInfoPanel, setInfoPanelVisibility] = useState(false);
  const [hasPolygon, setHasPolygon] = useState(false);
  const [toolbarContainer, setToolbarContainer] = useState<HTMLElement | null>(null);
  const [rulerActive, setRulerActive] = useState(false);
  const [rulerVisible, setRulerVisible] = useState(true);
  const rulerActiveRef = useRef(false);
  const rulerCancelRef = useRef<() => void>(() => {});
  const DefaultQuestionIndexSection2 = section2StartIndex;

  const byaModeRef = useRef(false);
  const byaFeatureGroupRef = useRef(new L.FeatureGroup());
  const byaLayerMap = useRef<Record<string, L.Layer>>({});
  const [byaPolygons, setByaPolygons] = useState<{ id: string; area: number }[]>([]);
  const [eiendomAreal, setEiendomAreal] = useState<number | null>(null);
  const [bygningArealDB, setBygningArealDB] = useState<number | null>(null);
  const bygningLayerRef = useRef<L.GeoJSON | null>(null);
  const [bygningGeojsonDB, setBygningGeojsonDB] = useState<object | null>(null);

  // Keep a stable ref so the Leaflet event handler (set up once on mount) always
  // calls the latest setAnswer without needing to re-initialize the map.
  const setAnswerRef = useRef(setAnswer);
  useEffect(() => { setAnswerRef.current = setAnswer; });

  const matrikkelNrRef = useRef(searchProps.matrikkelNr);
  useEffect(() => { matrikkelNrRef.current = searchProps.matrikkelNr; }, [searchProps.matrikkelNr]);
  const [showAngles, setShowAngles] = useState(true);
  const showAnglesRef = useRef(true);

  useEffect(() => {
    rulerActiveRef.current = rulerActive;
    showAnglesRef.current = showAngles;
  }, [rulerActive, showAngles]);

  useEffect(() => {
    byaModeRef.current = currentQuestionId === 'bya-type';
  }, [currentQuestionId]);

  useEffect(() => {
    if (currentQuestionId !== 'bya-type') {
      byaFeatureGroupRef.current.clearLayers();
      byaLayerMap.current = {};
      setByaPolygons([]);
    }
  }, [currentQuestionId]);

  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;
    if (bygningLayerRef.current) {
      map.removeLayer(bygningLayerRef.current);
      bygningLayerRef.current = null;
    }
    if (currentQuestionId === 'bya-type' && bygningGeojsonDB) {
      const layer = L.geoJSON(bygningGeojsonDB as any, {
        style: { color: '#FF5722', weight: 2, fillColor: '#FF5722', fillOpacity: 0.3 }
      });
      layer.addTo(map);
      bygningLayerRef.current = layer;
    }
  }, [currentQuestionId, bygningGeojsonDB]);

  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;
    if (rulerVisible) { if (!map.hasLayer(rulerLayerRef.current)) map.addLayer(rulerLayerRef.current); }
    else              { if ( map.hasLayer(rulerLayerRef.current)) map.removeLayer(rulerLayerRef.current); setRulerActive(false); }
  }, [rulerVisible]);

  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;
    if (rulerActive) { map.doubleClickZoom.disable(); }
    else             { map.doubleClickZoom.enable(); rulerCancelRef.current(); }
    map.getContainer().style.cursor = rulerActive ? 'crosshair' : '';
  }, [rulerActive]);

  useEffect(() => {
    const container = mapRef.current;
    if (!container) return;
    container.classList.toggle('has-polygon', hasPolygon);
  }, [hasPolygon]);


  function handleByaRemove(id: string) {
    const layer = byaLayerMap.current[id];
    if (layer) byaFeatureGroupRef.current.removeLayer(layer);
    delete byaLayerMap.current[id];
    setByaPolygons(prev => prev.filter(p => p.id !== id));
  }

  // Auto-answers survey questions based on proximity distances from a drawing.
  const autoAnswerFromDrawing = useCallback(() => {
    if (!setAnswerRef.current) return;

    const data = handleDrawingData();
    const violations = checkViolations(data);
    if (!violations) return;

    const violated = new Set(
      violations.filter(([, isViolated]) => isViolated).map(([key]: [string, boolean]) => key)
    );
    console.log("violations:", violations);
    console.log("violated:", [...violated]);
    const minBygning = data.naboBebyggelse && data.naboBebyggelse.length > 0
      ? Math.min(...data.naboBebyggelse) : Infinity;

      setAnswerRef.current('distance-to-road',         violated.has('veg')                            ? 'yes' : 'no');
      setAnswerRef.current('distance-from-neighbour',  minBygning < rulesConfig.naboByggning2         ? 'yes' : 'no');
      setAnswerRef.current('distance-from-neighbour2', minBygning < rulesConfig.naboByggning1         ? 'yes' : 'no');
      setAnswerRef.current('train-tracks',             violated.has('jernbane')                       ? 'yes' : 'no');
      //setAnswerRef.current('flood-landslide',          violated.has('jordskred')                      ? 'yes' : 'no');
      setAnswerRef.current('building-size',            (data.buildingSize ?? 0) > rulesConfig.buildingSize ? 'yes' : 'no');
      setAnswerRef.current('placement-buildings',      violated.has('eiendomBebyggelse')              ? 'no' : 'yes');
      setAnswerRef.current('placement-neighbours',     violated.has('eiendomsgrense')                 ? 'no' : 'yes');
      setAnswerRef.current('distance-to-sea',          violated.has('hoyvann')                        ? 'yes' : 'no');

  }, []);

  // Function to reset answeres
  const resetAnswers = useCallback(() => {
    if (!setAnswerRef.current) return;
    setAnswerRef.current('distance-to-road', '');
    setAnswerRef.current('distance-from-neighbour', '');
    setAnswerRef.current('distance-from-neighbour2', '');
    setAnswerRef.current('train-tracks', '');
    setAnswerRef.current('building-size', '');
    setAnswerRef.current('placement-buildings', '');
    setAnswerRef.current('placement-neighbours', '');
    setAnswerRef.current('distance-to-sea', '');

  }, []); 

  
  //initialize map
  useEffect(() => {
    if (!mapRef.current) return;
    if (leafletMapRef.current) return; //guard one-time map setup, so we dont initialize twice, checks if map is already drawn

    const map = L.map(mapRef.current,{  
      center:[58.1447, 7.99828],
      zoom: 14,
      minZoom: 1,
      maxZoom: 22,
      zoomControl: false,
      maxBounds: [
        crs.unproject(L.point([-127998, 6377920])),
        crs.unproject(L.point([1145510, 9045980]))
      ]
    });

    leafletMapRef.current = map;
      
    baseLayerRef.current = L.tileLayer.wms(WMS_URL, WMS_OPTIONS);
    baseLayerRef.current.addTo(map);

    map.addLayer(drawnItemsRef.current);

    // Add matrikkel polygons layer
    map.addLayer(matrikkelPolygonsRef.current);

    // Add all proximity layer groups to the map (visibility controlled by question)
    Object.values(proximityLayersRef.current).forEach(lg => map.addLayer(lg));

    L.control.zoom({ position: 'bottomright', zoomInTitle: 'Zoom inn', zoomOutTitle: 'Zoom ut' }).addTo(map);

    // Ruler + angle toolbar as a proper Leaflet control (bottomleft, stacks with draw toolbar)
    const toolbarDiv = L.DomUtil.create('div');
    L.DomEvent.disableClickPropagation(toolbarDiv);
    const toolbarControl = new (L.Control.extend({
      onAdd: () => toolbarDiv,
    }))({ position: 'bottomleft' });
    toolbarControl.addTo(map);
    setToolbarContainer(toolbarDiv);

    const drawControl = createDrawControl(drawnItemsRef.current);
    map.addControl(drawControl);
    byaFeatureGroupRef.current.addTo(map);

    map.on(L.Draw.Event.CREATED, async (event) => {
      const e = event as DrawEvents.Created;

      if (byaModeRef.current) {
        const layer = e.layer as L.Polygon;
        byaFeatureGroupRef.current.addLayer(layer);
        const area = turf.area(layer.toGeoJSON());
        const id = crypto.randomUUID();
        byaLayerMap.current[id] = layer;
        setByaPolygons(prev => [...prev, { id, area }]);
        onLoadingChange?.(false);
        return;
      }

      onLoadingChange?.(true);
      try {
        try {
          await handleDrawCreated(
            e,
            drawnItemsRef.current,
            proximityLayersRef.current,
            {
              setContraintsInfo,
              setInfoPanelVisibility,
              matrikkelNr: matrikkelNrRef.current
            },
            proximityInformation
          );
          autoAnswerFromDrawing();
          onDrawingDone?.();
          setHasPolygon(true);
          goToQuestion?.(DefaultQuestionIndexSection2);

        } catch (error) {
          console.error("Error in handleDrawCreated:", error);
        } finally{
          onLoadingChange?.(false);
        }
        
        const screenshot = await captureMapDraw(map, 1);
        if(screenshot) {
          onMapScreenshot?.(screenshot)
        }
      }catch (error) {
        onLoadingChange?.(false);
        console.error("Error handling drawn shape:", error);
      }});

    // -------------------------------- Add live label layer -------------------------------------------
    liveLabelsRef.current.addTo(map);
    rulerLayerRef.current.addTo(map);

    let currentVertices: L.LatLng[] = [];
    let isDrawing = false;
    let drawCompleted = false;
    let isEditing = false;

    map.on('draw:drawstart', () => { isDrawing = true; drawCompleted = false; });
    map.on('draw:drawstop',  () => {
      isDrawing = false;
      if (!drawCompleted) {
        currentVertices = [];
        liveLabelsRef.current.clearLayers();
      }
      drawCompleted = false;
    });
    map.on('draw:editstart', () => { isEditing = true; });
    map.on('draw:editstop',  () => { isEditing = false; });

    const mLabel = (a: L.LatLng, b: L.LatLng) =>
      (a.distanceTo(b) < 1000)
        ? `${a.distanceTo(b).toFixed(1)} m`
        : `${(a.distanceTo(b) / 1000).toFixed(2)} km`;

    const makeLabelIcon = (text: string, preview = false) => L.divIcon({
      className: '',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      html: `<div style="display:inline-block;background:white;border:1px solid #002854;padding:2px 8px;font-size:12px;${preview ? 'opacity:0.85;' : 'font-weight:500;'}color:#002854;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.15);transform:translate(-50%,-50%)">${text}</div>`,
    });

    const angleBetween = (a: L.LatLng, b: L.LatLng, c: L.LatLng): number => {
      const pA = map.latLngToLayerPoint(a);
      const pB = map.latLngToLayerPoint(b);
      const pC = map.latLngToLayerPoint(c);
      const v1x = pA.x - pB.x, v1y = pA.y - pB.y;
      const v2x = pC.x - pB.x, v2y = pC.y - pB.y;
      const mag = Math.sqrt((v1x*v1x + v1y*v1y) * (v2x*v2x + v2y*v2y));
      if (mag === 0) return 0;
      return Math.acos(Math.max(-1, Math.min(1, (v1x*v2x + v1y*v2y) / mag))) * (180 / Math.PI);
    };

    const bisectorPoint = (a: L.LatLng, b: L.LatLng, c: L.LatLng, offsetPx: number): L.LatLng => {
      const pA = map.latLngToLayerPoint(a);
      const pB = map.latLngToLayerPoint(b);
      const pC = map.latLngToLayerPoint(c);
      const toA = { x: pA.x - pB.x, y: pA.y - pB.y };
      const toC = { x: pC.x - pB.x, y: pC.y - pB.y };
      const mA = Math.sqrt(toA.x*toA.x + toA.y*toA.y);
      const mC = Math.sqrt(toC.x*toC.x + toC.y*toC.y);
      if (mA === 0 || mC === 0) return b;
      const bx = toA.x/mA + toC.x/mC;
      const by = toA.y/mA + toC.y/mC;
      const mb = Math.sqrt(bx*bx + by*by);
      if (mb === 0) return b;
      return map.layerPointToLatLng(L.point(pB.x + bx/mb * offsetPx, pB.y + by/mb * offsetPx));
    };

    const makeAngleIcon = (deg: number, preview = false) => L.divIcon({
      className: '',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      html: `<div style="display:inline-block;background:#002854;padding:1px 5px;font-size:11px;color:white;white-space:nowrap;border-radius:3px;${preview ? 'opacity:0.7;' : ''}transform:translate(-50%,-50%)">${deg.toFixed(0)}°</div>`,
    });

    const redrawLiveLabels = (vertices: L.LatLng[], mousePos?: L.LatLng) => {
      liveLabelsRef.current.clearLayers();

      for (let i = 0; i < vertices.length - 1; i++) {
        const a = vertices[i], b = vertices[i + 1];
        const mid = L.latLng((a.lat + b.lat) / 2, (a.lng + b.lng) / 2);
        L.marker(mid, { icon: makeLabelIcon(mLabel(a, b)), interactive: false })
          .addTo(liveLabelsRef.current);
      }

      if (showAnglesRef.current) {
        // Committed vertex angles
        for (let i = 1; i < vertices.length - 1; i++) {
          const pos = bisectorPoint(vertices[i - 1], vertices[i], vertices[i + 1], 22);
          L.marker(pos, { icon: makeAngleIcon(angleBetween(vertices[i - 1], vertices[i], vertices[i + 1])), interactive: false })
            .addTo(liveLabelsRef.current);
        }

        // Live angle at the last committed vertex as mouse moves
        if (mousePos && vertices.length >= 2) {
          const prev = vertices[vertices.length - 2];
          const last = vertices[vertices.length - 1];
          const pos = bisectorPoint(prev, last, mousePos, 22);
          L.marker(pos, { icon: makeAngleIcon(angleBetween(prev, last, mousePos), true), interactive: false })
            .addTo(liveLabelsRef.current);
        }
      }

      if (mousePos && vertices.length > 0) {
        const last = vertices[vertices.length - 1];
        const mid = L.latLng((last.lat + mousePos.lat) / 2, (last.lng + mousePos.lng) / 2);
        L.marker(mid, { icon: makeLabelIcon(mLabel(last, mousePos), true), interactive: false })
          .addTo(liveLabelsRef.current);
      }
    };

    // Fires when a vertex is placed
    map.on('draw:drawvertex', (e: any) => {
      const layers = e.layers;
      currentVertices = [];
      layers.eachLayer((layer: any) => {
        if (layer.getLatLng) currentVertices.push(layer.getLatLng());
      });
      redrawLiveLabels(currentVertices);
    });

    // Fires on mouse move during drawing
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      if (isDrawing &&currentVertices.length > 0) { // Only show preview line if a polygon hasn't been drawn yet
        redrawLiveLabels(currentVertices, e.latlng);
      }

      // Handle preview line during edits as well
      if (isEditing) {
        const vertices: L.LatLng[] = [];
        drawnItemsRef.current.eachLayer((layer: any) => {
          if (layer.getLatLngs) {
            const latlngs = layer.getLatLngs().flat(2);
            latlngs.forEach((ll: L.LatLng) => vertices.push(ll));
            vertices.push(latlngs[0]);
          }
        });
        if (vertices.length > 0) {
          currentVertices = vertices;
          redrawLiveLabels(currentVertices);
        }
      }
    });

    // ---- Ruler tool ----
    let rulerPoints: L.LatLng[] = [];
    let rulerActiveLine: L.Polyline | null = null;
    let rulerFirstDot: L.Marker | null = null;
    let rulerPreview: L.Polyline | null = null;
    let rulerPreviewLabel: L.Marker | null = null;

    const clearRulerPreview = () => {
      if (rulerPreview)      { rulerLayerRef.current.removeLayer(rulerPreview);      rulerPreview = null; }
      if (rulerPreviewLabel) { rulerLayerRef.current.removeLayer(rulerPreviewLabel); rulerPreviewLabel = null; }
    };

    const rulerAddPoint = (latlng: L.LatLng) => {
      rulerPoints.push(latlng);

      if (rulerActiveLine) rulerLayerRef.current.removeLayer(rulerActiveLine);
      rulerActiveLine = L.polyline(rulerPoints, { color: '#D53C0A', weight: 2.5, dashArray: '6 4', interactive: false });
      rulerLayerRef.current.addLayer(rulerActiveLine);

      rulerFirstDot = L.marker(latlng, {
        icon: L.divIcon({
          className: '', iconSize: [0, 0], iconAnchor: [0, 0],
          html: `<div style="width:8px;height:8px;background:#D53C0A;border:2px solid white;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
        }), interactive: false,
      });
      rulerFirstDot.addTo(rulerLayerRef.current);

      if (rulerPoints.length >= 2) {
        const a = rulerPoints[rulerPoints.length - 2];
        const b = rulerPoints[rulerPoints.length - 1];
        const mid = L.latLng((a.lat + b.lat) / 2, (a.lng + b.lng) / 2);
        L.marker(mid, { icon: makeLabelIcon(mLabel(a, b)), interactive: false }).addTo(rulerLayerRef.current);
        clearRulerPreview();
        rulerPoints = [];
        rulerActiveLine = null;
        rulerFirstDot = null;
      }
    };

    const rulerFinishLine = () => {
      clearRulerPreview();
      if (rulerActiveLine) { rulerLayerRef.current.removeLayer(rulerActiveLine); rulerActiveLine = null; }
      if (rulerFirstDot)   { rulerLayerRef.current.removeLayer(rulerFirstDot);   rulerFirstDot = null; }
      rulerPoints = [];
    };
    rulerCancelRef.current = rulerFinishLine;

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (!rulerActiveRef.current || isDrawing) return;
      rulerAddPoint(e.latlng);
    });

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      if (!rulerActiveRef.current || rulerPoints.length === 0) return;
      const latlng = e.latlng;

      clearRulerPreview();

      const last = rulerPoints[rulerPoints.length - 1];
      rulerPreview = L.polyline([last, latlng], {
        color: '#D53C0A', weight: 2, dashArray: '4 4', opacity: 0.55, interactive: false,
      });
      rulerLayerRef.current.addLayer(rulerPreview);

      const previewMid = L.latLng((last.lat + latlng.lat) / 2, (last.lng + latlng.lng) / 2);
      rulerPreviewLabel = L.marker(previewMid, { icon: makeLabelIcon(mLabel(last, latlng), true), interactive: false });
      rulerLayerRef.current.addLayer(rulerPreviewLabel);
    });

    map.on('dblclick', (e: L.LeafletMouseEvent) => {
      if (!rulerActiveRef.current) return;
      L.DomEvent.stopPropagation(e);
      rulerFinishLine();
    });

    map.on('draw:deletestop', () => {
      currentVertices = [];
      liveLabelsRef.current.clearLayers();
    });

    map.on('draw:created', () => {
      drawCompleted = true;
      if (currentVertices.length > 2) {
        currentVertices.push(currentVertices[0]);
      }
      liveLabelsRef.current.clearLayers();
      redrawLiveLabels(currentVertices);
    });

    // During edits, recalculate vertices and redraw labels on each vertex move
    map.on('draw:editvertex', () => {
      const handler = (map as any)._toolbars?.edit?._modes?.edit?.handler;
      if (!handler) return;

      const vertices: L.LatLng[] = [];
      handler._featureGroup?.eachLayer((layer: any) => {
        if (layer.getLatLngs) {
          const latlngs = layer.getLatLngs().flat(2);
          latlngs.forEach((ll: L.LatLng) => vertices.push(ll));
          vertices.push(latlngs[0]); // close the loop
        }
      });
      currentVertices = vertices;
      redrawLiveLabels(currentVertices);
    });

    // Clear live labels when edit mode ends, to avoid stale preview line
    map.on('draw:editstop', () => {
      liveLabelsRef.current.clearLayers();
      currentVertices = [];
    });


    // -------------------------------- Edit handling: reset state on edit start, then re-run proximity analysis on edit end -------------------------------------------
    map.on(L.Draw.Event.EDITED, async(event) => {
      const e = event as DrawEvents.Edited;
      const eDel = event as DrawEvents.Deleted
      onLoadingChange?.(true);
      try{
        await handleResetForEdit(
          eDel,
          {
            setContraintsInfo,
            setInfoPanelVisibility
          }
        )

        await handleDrawCreated(
        e,
        drawnItemsRef.current,
        proximityLayersRef.current,
        {
          setContraintsInfo,
          setInfoPanelVisibility,
          matrikkelNr: matrikkelNrRef.current
        }
        )
      
        autoAnswerFromDrawing();
      } finally {
        goToQuestion?.(DefaultQuestionIndexSection2);
        onLoadingChange?.(false)
      }
      const screenshot = await captureMapDraw(map, 1);
      if (screenshot) {
        onMapScreenshot?.(screenshot);
      }

    // After edit, snapshot the final vertices and redraw labels permanently
    const vertices: L.LatLng[] = [];
    drawnItemsRef.current.eachLayer((layer: any) => {
      if (layer.getLatLngs) {
        const latlngs = layer.getLatLngs().flat(2);
        latlngs.forEach((ll: L.LatLng) => vertices.push(ll));
        vertices.push(latlngs[0]);
      }
    });
    currentVertices = vertices;
    liveLabelsRef.current.clearLayers();
    redrawLiveLabels(currentVertices); 
    })

    // -------------------------------- Handle deletions: clear proximity layers and info panel -------------------------------------------
    map.on("draw:deleted", async (event) => { //Leaflet triggers event and invokes the function, therefor an effect happens and the void method triggers
      const e = event as DrawEvents.Deleted;
      await handleDrawDeleted( //Callback and data we want to remove after deleting
        e,
        proximityLayersRef.current,
        {
          setContraintsInfo,
          setInfoPanelVisibility
        },
      )
      byaFeatureGroupRef.current.clearLayers();
      byaLayerMap.current = {};
      setByaPolygons([]);
      onMapScreenshot?.(null);
      setHasPolygon(drawnItemsRef.current.getLayers().length > 0);
      
      resetAnswers();
      goToQuestion?.(DefaultQuestionIndexSection2);
    });

    

    // --------------------------------- Recalculate map size when container is resized -------------------------------------------
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapRef.current);

    return () => {
      resizeObserver.disconnect();
      toolbarControl.remove();
      map.remove();
      leafletMapRef.current = null;
    };
  }, [navigate, onLoadingChange, onMapScreenshot]);

  // Show only the layers relevant to the current question; show all if no match
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;
    const layers = proximityLayersRef.current;
    const toShow = currentQuestionId ? (questionLayerMap[currentQuestionId] ?? []) : [];
    Object.entries(layers).forEach(([key, lg]) => {
      if (toShow.includes(key)) {
        if (!map.hasLayer(lg)) map.addLayer(lg);
      } else {
        if (map.hasLayer(lg)) map.removeLayer(lg);
      }
    });
  }, [currentQuestionId]);

  //Toggle HD map layer
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (baseLayerRef.current) {
      map.removeLayer(baseLayerRef.current);
    }

    if (isHdMap) {
      baseLayerRef.current = L.tileLayer.wms(WMS_URL_HD, WMS_OPTIONS_HD);
    } else {
      baseLayerRef.current = L.tileLayer.wms(WMS_URL, WMS_OPTIONS);
    }

    baseLayerRef.current.addTo(map);
  }, [isHdMap]);

  //Toggle matrikkel layer
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;
    
    matrikkelLayerRef.current = toggleMatrikkelLayerLib(isAllMatrikkel, map, matrikkelLayerRef.current);

  }, [isAllMatrikkel]); 

  useEffect(() => {
    if (!initialAddress || !mapVisible) return;

    (async () => {
      const results = (await GetPropertyInformation(initialAddress)) ?? [];
      if (results.length === 0) return;
      const r = results[0];

      setSearchProps({
        address: r.addressName ?? "",
        lat: r.lat != null ? r.lat.toString() : undefined,
        lon: r.lon != null ? r.lon.toString() : undefined,
        matrikkelNr: r.matrikkelNumber ?? undefined,
      });

      if (r.municipalityNumber && r.gnr != null && r.bnr != null) {
        onArealplanerUrl?.(buildArealplanerUrl(r.municipalityNumber, r.gnr, r.bnr, r.municipalityName));
      }
    })();
  }, [initialAddress, mapVisible]);

  //Zoom effect
  useEffect(() => {
    const map = leafletMapRef.current;

    if (!map) return;

    // Only run when lat/lon are present and changed
    if (searchProps.lat == null || searchProps.lon == null) return;

    const latConvert = Number(searchProps.lat);
    const lonConvert = Number(searchProps.lon);

    if (!Number.isFinite(latConvert) || !Number.isFinite(lonConvert)) return;

    map.invalidateSize();
    map.setView([latConvert, lonConvert], 19);

  }, [searchProps.lat, searchProps.lon]);

  //Toggle FKB layer
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

      //Create fkblayer WMS layer, but not adding it yet
      fkbLayerRef.current = handleFKBLayerVisibilityLib(fkbVisible, map, fkbLayerRef.current);

  }, [fkbVisible]);

    //Toggle FKB layer
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;
      //Create fkblayer WMS layer, but not adding it yet
      jordskredFlomLayerRef.current = handleJordFlomVisibilityLib(jordksredVisibile, map, jordskredFlomLayerRef.current);

  }, [jordksredVisibile]);

  //Toggle avkjørsler layer
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if(avkjorselVisible){
      (async () => {
        const allAvkjorsler = await fetchAvkjorsler();
        if(!allAvkjorsler || allAvkjorsler.length === 0){
          setAvkjorselError("Datahenting mislykket, prøv igjen");
          return;
        }
        setAvkjorselError("");
        avkjorslerLayerRef.current = displayAvkjorsler(allAvkjorsler, avkjorslerLayerRef.current, crs);
        map.addLayer(avkjorslerLayerRef.current);
      })(); //IIFE to allow async/await in useEffect
       
    } else {
      map.removeLayer(avkjorslerLayerRef.current);
      setAvkjorselError(""); //Clearing any error message 
    }
  }, [avkjorselVisible]);


  // Fetching geometry for the matrikkelNr and zoom to it
  useEffect(() => {
    
    const map = leafletMapRef.current;
    const matrikkelSearch = searchProps.matrikkelNr
    if (!map || !matrikkelSearch) return;

    onLoadingChange?.(true)
    const run = async () => {
      setBygningGeojsonDB(null);
      setBygningArealDB(null);
      setEiendomAreal(null);
      try
      {
        const matrikkelResult = await fetchMatrikkelGeo(matrikkelSearch,
        matrikkelPolygonsRef.current,
        map, 
        setAnswerRef,
        rawDataInformation
       );
        if (matrikkelResult) {
          setEiendomAreal(matrikkelResult.eiendomAreal);
          setBygningArealDB(matrikkelResult.bygningAreal);
          setBygningGeojsonDB(matrikkelResult.bygningGeojson);
        }
      }
      catch (error) 
      {
        console.error("Error fetching matrikkel geometry:", error);
      }
      finally
      {
        onLoadingChange?.(false);
      }
    }
      void run();
  }, [searchProps.matrikkelNr, onLoadingChange, rawDataInformation]);

  const handleSearchBarDelete = useCallback(async () => {
    const map = leafletMapRef.current;
    if (!map) return;

    await handleDrawDeleted(
      {} as DrawEvents.Deleted,
      proximityLayersRef.current,
      {
        setContraintsInfo,
        setInfoPanelVisibility
      }
    );

    drawnItemsRef.current.clearLayers();

    onMapScreenshot?.(null);
    setHasPolygon(false);

    resetAnswers();
    goToQuestion?.(DefaultQuestionIndexSection2);

  }, [resetAnswers, goToQuestion, onMapScreenshot]);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-401 tour-search"> 

        <SearchBar
          onAddressSelect={(result) => {
            handleSearchBarDelete();
            setSearchProps({
              address: result.addressName,
              lat: result.lat?.toString(),
              lon: result.lon?.toString(),
              matrikkelNr: result?.matrikkelNumber ?? undefined,
            });
            if (result.municipalityNumber && result.gnr != null && result.bnr != null) {
              onArealplanerUrl?.(buildArealplanerUrl(result.municipalityNumber, result.gnr, result.bnr, result.municipalityName));
            }
          }}
          //onLoadingChange={onLoadingChange}
        />
      </div>

      <div className="absolute top-4 left-4 z-401 tour-menu flex flex-col gap-2">
        <HamburgerMenu>
          <ToggleMatrikkel 
            isMatrikkel={isAllMatrikkel}
            onToggle={async (isMatrikkel) => {
              setMatrikkelVisible(isMatrikkel);
            }}
          />
          <ToggleFKB
            isFkb={fkbVisible}
            onToggle={async (isFkb) => {
              setFkbVisible(isFkb);
            }}
          />
          <ToggleHdMap
            isHdMap={isHdMap}
            onToggle={async (isHdMap) => {
              setHdMapVisible(isHdMap);
            }}
          />
          <ToggleJordskred
            isJordskred={jordksredVisibile}
            onToggle={async (isJordskred) => {
              setJordSkredVisible(isJordskred);
            }}
          />
          <ToggleAvkjorsel
            errorMessage={isAvkjorselError}
            isAvkjorsel={avkjorselVisible}
            onToggle={async (isAvkjorsel) => {
              setAvkjorselVisible(isAvkjorsel)
            }}
          />
        </HamburgerMenu>
        {onOpenTutorial && (
          <button
            onClick={onOpenTutorial}
            title="Åpne veiledning"
            className="leaflet-control leaflet-bar flex items-center justify-center w-[45px] h-[45px] !border-2 !border-primary bg-secondary text-primary text-lg font-bold cursor-pointer hover:opacity-90 focus-visible:outline-none"
          >
            ?
          </button>
        )}
      </div>
          {showInfoPanel && (
          <InfoPanel
          constraintsInformation={constraintsInformation}
          currentQuestionId={currentQuestionId}
        />
      )}
      <BYATool
        visible={currentQuestionId === 'bya-type'}
        polygons={byaPolygons}
        onRemove={handleByaRemove}
        eiendomAreal={eiendomAreal}
        bygningAreal={bygningArealDB}
        tilbyggAreal={constraintsInformation.drawnPolygonArea ?? null}
      />

      {/* Ruler + Angle tool bar – rendered into a Leaflet bottomleft control via portal */}
      {toolbarContainer && createPortal(
        <div className="flex items-start">
          <div className="map-tool-bar">
            <button
              onClick={() => setRulerActive(v => !v)}
              title="Linjal"
              className={`map-tool-btn map-tool-btn-ruler${rulerActive ? ' active' : ''}`}
            />
            <button
              onClick={() => setShowAngles(v => !v)}
              title="Vis/skjul vinkler under tegning"
              className={`map-tool-btn map-tool-btn-angle${showAngles ? ' active' : ''}`}
            />
            <span className="tour-angle-anchor absolute left-full top-1/2 translate-x-4.5 translate-y-2.5 h-0 w-0 pointer-events-none" />
          </div>
          {rulerActive && (
            <div className="map-tool-bar flex flex-row ml-1">
              <button
                onClick={() => setRulerVisible(v => !v)}
                title="Vis/skjul linjaler"
                className={`map-tool-btn ${rulerVisible ? 'map-tool-btn-eye' : 'map-tool-btn-eye-off'}`}
              />
              <button
                onClick={() => rulerLayerRef.current.clearLayers()}
                title="Slett alle linjaler"
                className="map-tool-btn map-tool-btn-trash"
              />
            </div>
          )}
        </div>,
        toolbarContainer
      )}

      <div className='w-full h-full' 
        style={{height: '100vh'}} 
        ref={mapRef} 
        id="map">  
      </div>

    </div>
  )
}

export default Map
