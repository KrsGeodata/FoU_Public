// ==========================================================================
// WMS Layer Definitions and Toggle Logic
//
// Configures and manages optional WMS overlay layers on the Leaflet map:
//   - Matrikkel (cadastral boundaries)
//   - FKB (building footprints from the Norwegian mapping authority)
//   - Jordskred/Flom (landslide and flood hazard zones from NVE)
//
// Each layer type has a create function and a toggle/visibility handler
// that adds or removes the layer from the map on demand.
// ==========================================================================
import L from 'leaflet';

// WMS layer configuration
export const MATRIKKEL_WMS_URL = "https://wms.geonorge.no/skwms1/wms.matrikkelkart?"; 

//important to write the entire url, since vite foward port like that
export const MATRIKKEL_WMS_OPTIONS = {
    layers: "matrikkelkart",
    format: "image/png",
    transparent: true,
    version: "1.3.0",
  maxZoom: 22,
  crossOrigin: true
};

export const FKB_WMS_URL = "https://wms.geonorge.no/skwms1/wms.fkb?"; 
export const FKB_WMS_OPTIONS = {
    layers: "bygning",
    format: "image/png",
    transparent: true,
    version: "1.3.0",
  maxZoom: 22,
  crossOrigin: true
};

export const JORDFLOM_WMS_URL = "https://kart.nve.no/enterprise/services/JordFlomskredAktsomhet/MapServer/WMSServer";
export const JORDFLOM_WMS_OPTIONS = {
    layers: "Jord_flomskred_aktsomhetsomrader",
    version: "1.3.0",
    format: "image/png",
    transparent: true,
  maxZoom: 22,
  crossOrigin: true
}

export function createPolygonLayer(
    coordinates: L.LatLngTuple[][],
    options?: L.PolylineOptions
    ): L.Polygon {
        const defaults: L.PolylineOptions = {
            color: 'blue',
            fillColor: '#30f',
            fillOpacity: 0.3,
            weight: 2
        };
    return L.polygon(coordinates, { ...defaults, ...options});
}


/**
 * Create and initialize the Matrikkel WMS layer
 * @returns Matrikkel TileLayer.WMS instance
 */

export function createMatrikkelLayer(): L.TileLayer.WMS { //method expecting L.TileLayer.WMS subtype return
    return L.tileLayer.wms(MATRIKKEL_WMS_URL, MATRIKKEL_WMS_OPTIONS);
}

/**
 * Toggle matrikkel layer visibility
 * @param visible - Whether the layer should be visible
 * @param map - The Leaflet map instance
 * @param layer - The matrikkel layer instance
 */
export function toggleMatrikkelLayer(
    visible: boolean,
    map: L.Map,
    layer: L.TileLayer.WMS | null
    ): L.TileLayer.WMS | null {
        if(!map) return null;
        if(visible && !layer) {
            //Create matrikkel WMS layer, but not adding it yet
            layer = createMatrikkelLayer();
            layer.addTo(map);
            return layer;

        } else if(!visible && layer) {
            map.removeLayer(layer);
            return null;
        }
        return null;
    }

export function createAndAddJORDFLOMLayer(map: L.Map): void {
  
  const jordFlomLayer = L.tileLayer.wms(JORDFLOM_WMS_URL, {
    ...JORDFLOM_WMS_OPTIONS,
    opacity: 0.7,
  });

  jordFlomLayer.addTo(map);
}

/**
 * Create and add FKB WMS layer to map with event logging
 * @param map - The Leaflet map instance
 * @returns FKB TileLayer.WMS instance
 */
export function createAndAddFKBLayer(map: L.Map): L.TileLayer.WMS {
  
  const fkbLayer = L.tileLayer.wms(FKB_WMS_URL, {
    ...FKB_WMS_OPTIONS,
    opacity: 0.7,
  });
  
  fkbLayer.addTo(map);  
  return fkbLayer;
}
/**
 * Handle FKB layer visibility changes
 * Removes existing layer and creates new one if visible is true
 * @param visible - Whether the FKB layer should be visible
 * @param map - The Leaflet map instance
 * @param currentLayer - Current FKB layer instance (will be removed)
 * @returns New FKB layer instance if visible, null otherwise
 */
export function handleFKBLayerVisibility(
  visible: boolean,
  map: L.Map | null,
  currentLayer: L.TileLayer.WMS | null
): L.TileLayer.WMS | null {
  if (!map) return null;
  
  // First remove any existing FKB layer
  if (currentLayer && map.hasLayer(currentLayer)) {
    map.removeLayer(currentLayer);
    return null;
  }
  
  // If toggled on, create and add new FKB layer
  if (visible) {
    return createAndAddFKBLayer(map);
  }
  
  return null;
}

export function handleJordFlomLayerVisibility(
  visible: boolean,
  map: L.Map | null,
  currentLayer: L.TileLayer.WMS | null
): L.TileLayer.WMS | null {
  if (!map) return null;
  
  // First remove any existing FKB layer
  if (currentLayer && map.hasLayer(currentLayer)) {
    map.removeLayer(currentLayer);
    return null;
  }
  
  // If toggled on, create and add new FKB layer
  if (visible) {
    createAndAddJORDFLOMLayer(map);
  }
  
  return null;
}