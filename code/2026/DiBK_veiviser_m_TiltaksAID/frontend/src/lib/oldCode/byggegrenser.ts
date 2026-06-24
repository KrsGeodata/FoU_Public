// ==========================================================================
// Building Boundary Lines (Byggegrenser) – Legacy
//
// Functions for fetching and displaying regulatory building boundary lines
// from the backend. These lines define the legal setback from roads and
// other features. Renders boundaries as dashed GeoJSON polylines on the map
// with tooltip metadata.
// ==========================================================================
import L from 'leaflet';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetch byggegrenser (building boundaries) from API for given bounds
 * @param bounds - Leaflet LatLngBounds object
 * @returns GeoJSON FeatureCollection
 */
export async function fetchByggegrenser(bounds: L.LatLngBounds): Promise<any> {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  // Convert WGS84 (lat/lng) to EPSG:25832 (Norwegian coordinate system)
  // For now, we'll pass lat/lng and let the API handle conversion if needed
  // In production, you might want to use proj4 for accurate transformation
  const minX = sw.lng;
  const minY = sw.lat;
  const maxX = ne.lng;
  const maxY = ne.lat;

  const params = new URLSearchParams({
    minX: minX.toString(),
    minY: minY.toString(),
    maxX: maxX.toString(),
    maxY: maxY.toString(),
  });

  console.log('Fetching byggegrenser with params:', params.toString());

  const response = await fetch(`${API_BASE_URL}/byggegrenser?${params}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch byggegrenser');
  }

  return response.json();
}

/**
 * Display byggegrenser on the map
 * @param map - Leaflet map instance
 * @param layerGroup - Layer group to add byggegrenser to
 * @param geojson - GeoJSON data of byggegrenser
 */
export function displayByggegrenser(
  map: L.Map,
  layerGroup: L.FeatureGroup,
  geojson: any
): void {
  if (!geojson || !geojson.features || geojson.features.length === 0) {
    console.log('No byggegrenser to display');
    return;
  }

  console.log(`Displaying ${geojson.features.length} byggegrenser`);

  // Clear existing layers
  layerGroup.clearLayers();

  let successCount = 0;
  let errorCount = 0;

  // Add each feature to the layer group
  L.geoJSON(geojson, {
    style: {
      color: '#FF5722', // Deep orange/red color for building boundaries
      weight: 3,
      opacity: 0.8,
      dashArray: '8, 4', // Dashed line pattern
      lineCap: 'round',
      lineJoin: 'round',
    },
    onEachFeature: (feature, layer) => {
      try {
        // Add tooltip with information
        const props = feature.properties;
        const tooltipContent = `
          <div style="font-size: 12px;">
            <strong>Byggegrense</strong><br/>
            ${props.beskrivelse ? `${props.beskrivelse}<br/>` : ''}
            ${props.jurlinje ? `Juridisk linje: ${props.jurlinje}<br/>` : ''}
            ${props.objectid ? `ID: ${props.objectid}` : ''}
          </div>
        `;
        
        layer.bindTooltip(tooltipContent, {
          sticky: true,
          opacity: 0.9,
        });

        // Add to layer group
        layerGroup.addLayer(layer);
        successCount++;
      } catch (err) {
        errorCount++;
        console.error('Error adding byggegrense layer:', err, feature);
      }
    },
  });

  console.log(`Successfully added ${successCount} byggegrenser, ${errorCount} errors`);

  // Add layer group to map if not already added
  if (!map.hasLayer(layerGroup)) {
    layerGroup.addTo(map);
  }
}

/**
 * Clear all byggegrenser from the layer group
 * @param layerGroup - Layer group containing byggegrenser
 */
export function clearByggegrenser(layerGroup: L.FeatureGroup): void {
  layerGroup.clearLayers();
  console.log('Cleared all byggegrenser');
}

/**
 * Fetch all byggegrenser from API (without bounds filtering)
 * @returns GeoJSON FeatureCollection
 */
export async function fetchAllByggegrenser(): Promise<any> {
  console.log('Fetching ALL byggegrenser (no bounds filter)');

  // Use very large bounds to get everything
  // Norway's approximate bounds in WGS84
  const minX = 4.0;   // West
  const minY = 57.0;  // South
  const maxX = 32.0;  // East
  const maxY = 72.0;  // North

  const params = new URLSearchParams({
    minX: minX.toString(),
    minY: minY.toString(),
    maxX: maxX.toString(),
    maxY: maxY.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/byggegrenser?${params}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch byggegrenser');
  }

  return response.json();
}

/**
 * Fetch and display byggegrenser for current map view
 * @param map - Leaflet map instance
 * @param layerGroup - Layer group to add byggegrenser to
 */
export async function fetchAndShowByggegrenser(
  map: L.Map,
  layerGroup: L.FeatureGroup
): Promise<void> {
  try {
    const bounds = map.getBounds();
    const geojson = await fetchByggegrenser(bounds);
    displayByggegrenser(map, layerGroup, geojson);
  } catch (error) {
    console.error('Error fetching/displaying byggegrenser:', error);
    throw error;
  }
}

/**
 * Fetch and display all byggegrenser on the map (no bounds filtering)
 * @param map - Leaflet map instance
 * @param layerGroup - Layer group to add byggegrenser to
 */
export async function fetchAndShowAllByggegrenser(
  map: L.Map,
  layerGroup: L.FeatureGroup
): Promise<void> {
  try {
    const geojson = await fetchAllByggegrenser();
    displayByggegrenser(map, layerGroup, geojson);
  } catch (error) {
    console.error('Error fetching/displaying all byggegrenser:', error);
    throw error;
  }
}


