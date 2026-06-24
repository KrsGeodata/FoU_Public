// ==========================================================================
// Road Exit Points (Avkjørsler) – Data Layer
//
// Fetches road exit/entry point data from the backend and renders them as
// Leaflet markers with popup information. Supports fetching all exits or
// filtering by plan ID. Also provides a nearest-exit distance utility.
//
// Note: coordinates may arrive as UTM (EPSG:25832) or WGS84 and are
// reprojected as needed using the CRS unproject method.
// ==========================================================================
import L from 'leaflet';

/**
 * Library for handling avkjørsler (driveways) data
 * Provides utilities to fetch and display driveway information on the map
 */

export interface Avkjorsel {
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [number, number],
    };
    properties: {
        id: number,
        objectid: number,
        database: string,
        objekttype: string,
        rpjuriskpunkt: string,
        rpjurpunkt: string,
        planid: number,
        vertniv: string,
        kommunenr: string,
        kommune: string,
        maalemetode: string,
        kvalitet: string | null,
        geometritype: string,
        forstedigitaliseringsdato: string | null;
        oppdateringsdato: string | null;
    };
}

/* 
Fetch all avkjørsler
*/

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log(API_BASE_URL, ": is the URL");


// Fetches all road exit area records from the backend API
export async function fetchAvkjorsler(): Promise<Avkjorsel[]>{
    try{
        const response = await fetch(`${API_BASE_URL}/exitarea/FetchAllAvkjorsler`);
        if(!response.ok){
            throw new Error(`Failed to fetch from avkjørsler: ${response.statusText}`);
        }

        const geoJson = await response.json();
        return geoJson.features || [];
    } catch(error){
        console.log(`An error occured ${error}`)
        return [];
    }
}


/**
 * Fetch avkjørsler for a specific planid
 */

// Fetches exit areas filtered by a specific plan ID via POST
export async function fetchAvkjorslerForPlan(planid: number): Promise<Avkjorsel[]>{
    try{
        const response = await fetch(`${API_BASE_URL}/exitarea/AvkjorslerByPlanid`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ planid })
        });

        if(!response.ok){
            throw new Error(`Failed to fetch avkjøsler: ${response.statusText}`);
        }

        const geoJson = await response.json();
        return geoJson.features || [];

    } catch(error){
        console.error(`An error occured when fetching for plan: ${error}` )
        return [];
    }
}

/**
 * Add avkjørsler to a Leaflet map layer as point markers
 */

// Renders exit area markers on the map with popups showing metadata.
// Handles coordinate reprojection from UTM to LatLng when necessary.
export function displayAvkjorsler(
    avkjorsler: Avkjorsel[],
    layer: L.FeatureGroup,
    crs: L.CRS
): any {
    //Clear existing layers
    layer.clearLayers();

    // Custom icon for avkjørsler
  const avkjorselIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <circle cx="12" cy="12" r="10" fill="#ff6b35" stroke="#fff" stroke-width="2"/>
        <path d="M8 12 L16 12 M12 8 L12 16" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });

  //Add each avkjorsel to the layer
  avkjorsler.forEach((avkjorsel) => {
    if(!avkjorsel.geometry || !avkjorsel.geometry.coordinates) return;

    const coords = avkjorsel.geometry.coordinates;
    const props = avkjorsel.properties;

    //Check if coordinates are in EPSG:2582 or WGS84
    // If coordinates are large numbers, they're likely in EPSG:25832

    let latLng: L.LatLng;
    if(coords[0] > 1000){
        //EPSG:25832 coordinates - need to unproject
        latLng = crs.unproject(L.point(coords[0], coords[1]));
    } else {
        //WGS84 coordinates  [lon, lat]
        latLng = L.latLng(coords[1], coords[0])
    }

    const marker = L.marker(latLng, {icon: avkjorselIcon});

    //Build popup content with only relevant fields
    const popupParts: string[] = [];

    //Always show type if available
    if(props.rpjuriskpunkt){
        popupParts.push(`<p style="margin: 4px 0;"><strong>Plan ID:</strong> ${props.planid}`)
    }

    // Only show Kommune if it's not Kristiansand (assumed default)
    if(props.planid && props.planid !== 0 ) {
        popupParts.push(`p style="margin: 4px 0;"><strong>Kommune:</strong> ${props.kommune}</p>`)
    }

    //Only show Målemetode if it's meaningful (not "Ukjent" or similar)
    if(props.maalemetode &&
        props.maalemetode !== 'Ukjent målemetode' &&
        props.maalemetode !== 'Ukjent' &&
        props.maalemetode.toLowerCase() !== 'unknown'
    ) {
        popupParts.push(`p style="margin: 4px 0;"><strong>Kommune:</strong> ${props.maalemetode}</p>`)
    }

    const popupContent = `
      <div style="font-size: 12px; min-width: 150px;">
        <h4 style="margin: 0 0 8px 0; color: #ff6b35;">Avkjørsel</h4>
        ${popupParts.join('')}
      </div>
    `;
    marker.bindPopup(popupContent);
    marker.addTo(layer);
  });
  return layer;
}

  /**
 * Calculate distance from a point to the nearest avkjørsel
 */

  // Finds the nearest exit area to a given point and returns it with distance
export function findNearestAvkjorsel(
    point: L.LatLng,
    avkjorsler: Avkjorsel[]
  ): {
    avkjorsel: Avkjorsel; distance: number} | null {

    if(!avkjorsler.length) return null;

    let nearest: Avkjorsel | null = null
    let minDistance = Infinity;

    avkjorsler.forEach((avkjorsel) => {
        if(!avkjorsel.geometry) return;

        //Simple distance calculation - you might want to use proper library like @turf/turf
        const geoJson = L.geoJSON(avkjorsel.geometry);
        const bounds = geoJson.getBounds();
        const center = bounds.getCenter();
        const distance = point.distanceTo(center);

        if(distance < minDistance) {
            minDistance = distance;
            nearest = avkjorsel;
        }

    });

    return nearest ? {avkjorsel: nearest, distance: minDistance } : null;

  }