// ==========================================================================
// Geospatial Data Fetching
//
// Functions for retrieving property and address information:
//   - GetPropertyInformation: queries the Geonorge address API (via backend
//     proxy) to resolve addresses with lat/lon and matrikkel numbers
//   - fetchMatrikkelGeo: calls the PostGIS function to load property boundary
//     and allowed building area geometry, then renders them on the map
// ==========================================================================
import axios from "axios"
import L from "leaflet";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type AddressApiItem = {
    adressetekst?: string;
    kommunenavn?: string;
    kommunenummer?: string;
    gardsnummer?: string | number | null;
    bruksnummer?: string | number | null;
    postnummer?: string;
    representasjonspunkt?: {
        lat?: number | null;
        lon?: number | null;
    };
};

type GeoJsonValue = Record<string, unknown> | null;

export async function GetPropertyInformation(query: string){
    if(!query || query.length <= 0){
        return []
    }
    try {
        const response = await axios.get(`${API_BASE_URL}/PropertiesValues`, {
            params: {
                addressQuery: query
            }
        });

        if (!response) return []

        const result_data = (response.data.adresser ?? []) as AddressApiItem[];

        return result_data.map((item: AddressApiItem) => ({
            addressName: item.adressetekst ?? "",
            municipalityName: item.kommunenavn ?? "",
            municipalityNumber: item.kommunenummer ?? "",
            gnr: item.gardsnummer ?? null,
            bnr: item.bruksnummer ?? null,
            postnummer: item.postnummer ?? "",
            lat: item.representasjonspunkt?.lat ?? null,
            lon: item.representasjonspunkt?.lon ?? null,
            matrikkelNumber: (item.gardsnummer != null && item.bruksnummer != null)
                ? `${item.gardsnummer}/${item.bruksnummer}`
                : null,
        }));

        } catch{
            return [];
        }
}

export function buildArealplanerUrl(
    knr: string,
    gnr: string | number,
    bnr: string | number,
    kommunenavn: string
): string {
    const slug = kommunenavn.toLowerCase().replace(/\s+/g, '') + knr;
    return `https://arealplaner.no/${slug}/arealplaner/search?knr=${knr}&gnr=${gnr}&bnr=${bnr}`;
}

export type propertyDetailPayload = {
    propertyGeojson?: GeoJsonValue;
    allowedBuildingAreaGeojson?: GeoJsonValue;
    eiendomAreal?: number | null;
    bygningAreal?: number | null;
    hasRegulations?: boolean;
    hasBygning?: boolean;
    hasLandslide?: boolean;
    hasFlood?: boolean;
    teigId?: number;
}

export type propertyDetailCallback = (payload: propertyDetailPayload) => void;

export async function fetchMatrikkelGeo(
    matrikkelnummer: string,
    parentLayer: L.FeatureGroup,
    map: L.Map,
    setAnswerRef: { current: ((questionId: string, answer: string) => void) | undefined },
    rawDataDetail?: propertyDetailCallback
): Promise<{ eiendomAreal: number | null; bygningAreal: number | null; bygningGeojson: object | null } | null>{
    try{
        const response = await axios.get(`${API_BASE_URL}/PostGISfn`, {
            params: {
                matrikkelNr: matrikkelnummer
            }
        });

        const data = response.data?.[0];

        console.log(data, "Checking for polygon values"); //taking this 

        parentLayer.clearLayers();

        if(!data) return null;


        const hasRegulations = data?.has_regulation ?? false;
        const hasBygning = data?.has_bygning ?? false;
        const inLNF = data?.in_lnf ?? false;
        const hasLandslide = data?.has_landslide ?? false;
        const hasFlood = data?.has_flood ?? false;
        const eiendomAreal: number | null = data?.eiendom_areal_m2 ?? null;
        const bygningAreal: number | null = data?.bygning_areal_m2 ?? null;
        const bygningGeojson: object | null = data?.bygning_geojson ?? null;
        const propertyArea = data?.eiendom_geojson ?? null;
        const allowedBuildingArea = data?.allowed_building_area ?? null;
        const teigId = data?.teig_id ?? null;

        
         const payload: propertyDetailPayload = {
            propertyGeojson: propertyArea,
            allowedBuildingAreaGeojson: allowedBuildingArea,
            eiendomAreal,
            bygningAreal,
            hasRegulations,
            hasBygning,
            hasLandslide,
            hasFlood,
            teigId
        };
        rawDataDetail?.(payload); 

        console.log("has_regulations from API:", hasRegulations);
        console.log("has_bygning from API:", hasBygning);
        console.log("in_lnf from API:", inLNF);
        console.log("has landslide/jordskred: ",hasLandslide);
        console.log("has flood", hasFlood);
        console.log("Full data from API:", data);

        if(propertyArea){
            const propertyGeoJSON = L.geoJSON(propertyArea, {
                style: {color: '#FF7F7F', weight: 3, fillOpacity: 0.05}
            });
            parentLayer.addLayer(propertyGeoJSON);
            console.log(propertyArea);
        }

        if(allowedBuildingArea){
            const allowedGeoJSON = L.geoJSON(allowedBuildingArea, {
                style: {
                color: "green", 
                weight: 3, 
                fillOpacity: 0.2,
                className: "tour-allowed-building-area"
            }
            });
            parentLayer.addLayer(allowedGeoJSON);

            //Zoom to fit the allowed building area

            try {
                const bounds = allowedGeoJSON.getBounds();
                map.fitBounds(bounds);
            } catch(err){
                console.log("Error getting bounds:", err);
            }
            console.log(allowedBuildingArea.coordinates[0]);
        }


        setAnswerRef.current?.('regulations', hasRegulations   ?  'yes' : 'no');
        setAnswerRef.current?.('is-built',    hasBygning   ?  'yes' : 'no');
        setAnswerRef.current?.('lnf-area',    inLNF   ?  'yes' : 'no');
        setAnswerRef.current?.('flood-landslide', hasLandslide || hasFlood ? 'yes' : 'no' );
        return { eiendomAreal, bygningAreal, bygningGeojson };
    }
    
    catch(err){
        console.log(`An error occured ${err}`);
        return null;
    }
}