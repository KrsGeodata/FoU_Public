import * as turf from "@turf/turf";
import type {
  Feature,
  FeatureCollection,
  Geometry,
  Polygon,
  MultiPolygon,
  LineString,
  MultiLineString,
  GeoJsonProperties,
} from "geojson";


type Poly = Feature<Polygon | MultiPolygon, GeoJsonProperties>;
interface LocalEiendomsgrenseResponse extends FeatureCollection {
  features: Poly[];
}

function isPoly(f?: any): f is Poly {
  return !!f && f.type === "Feature" &&
    (f.geometry?.type === "Polygon" || f.geometry?.type === "MultiPolygon");
}

/** Fetch both the property boundary (teig) and the allowed building area from the local API */
export async function fetchPropertyBoundaryAndAllowedArea(
  matrikkelnummer: string,
  apiBase = "http://localhost:3001",
): Promise<{ propertyBoundary: GeoJSON.GeoJSON | null; allowedBuildingArea: GeoJSON.GeoJSON | null; raw: Response | null }> {
  const resp = await fetch(`${apiBase}/api/eiendomsgrense`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matrikkelnummer }),
  });

  if (!resp.ok) {
    return { propertyBoundary: null, allowedBuildingArea: null, raw: null };
  }

  const fc = (await resp.json()) as LocalEiendomsgrenseResponse;
  const features = (fc?.features || []).filter(isPoly);

  // try to pick by geometry_name first
  const byName = (name: string) =>
    features.find(f => (f.properties?.geometry_name as string | undefined)?.toLowerCase() === name);

  let propertyBoundary = byName("teig_geojson") || null;
  let allowedBuildingArea = byName("allowed_building_area") || null;

  console.log("fetchPropertyBoundaryAndAllowedArea: " + propertyBoundary?.type, allowedBuildingArea?.type);
  console.log(resp);

  return { propertyBoundary, allowedBuildingArea, raw: resp || null };
}

export interface PropertyData {
  propertyboundary_geojson: GeoJSON.GeoJSON;
  allowedbuildingarea_geojson: GeoJSON.GeoJSON;
  matrikkelnummer?: string;
  matrikkelnummertekst?: string;
}

export interface PropertyIdentifiers {
  gnr?: number;
  bnr?: number;
  fnr?: number;
  snr?: number;
}

export interface SpatialAnalysisResult {
  isWithinProperty: boolean;
  distanceToProperty: number | null;
  nearestPropertyId: string | null;
  isWithinAllowedArea: boolean | null;
  distanceToNeighborProperty?: number | null;
  neighborPropertyId?: string | null;
  distanceToRoad?: number | null;
  roadType?: string | null;
  buildingSize?: number | null;
}

/**
 * Formats a property number string from gnr/bnr/fnr/snr
 */
export const formatPropertyNumber = (
  gnr?: number,
  bnr?: number,
  fnr?: number,
  snr?: number,
): string => {
  if (gnr === undefined || bnr === undefined) return "";

  let propertyString = `${gnr}/${bnr}`;
  if (fnr !== undefined) propertyString += `/${fnr}`;
  if (snr !== undefined) propertyString += `/${snr}`;
  return propertyString;
};

/**
 * Analyzes spatial relationship between a drawn shape and property boundaries
 */
export function analyzeSpatialRelationship(
  drawnShape: Feature<Geometry, GeoJsonProperties>,
  propertyBoundaries: Feature<Polygon | MultiPolygon, GeoJsonProperties>[],
  allowedAreaBoundary: Feature<
    Polygon | MultiPolygon,
    GeoJsonProperties
  > | null,
): SpatialAnalysisResult {
  let isWithinProperty = false;
  let distanceToProperty: number | null = null;
  let nearestPropertyId: string | null = null;
  let isWithinAllowedArea: boolean | null = null;
  let distanceToNeighborProperty: number | null = null;
  const neighborPropertyId: string | null = null;
  let distanceToRoad: number | null = null;
  let roadType: string | null = null;
  let buildingSize: number | null = null;

  if (propertyBoundaries.length > 0) {
    const firstPropertyBoundary = propertyBoundaries[0];
    if (firstPropertyBoundary) {
      try {
        isWithinProperty = turf.booleanContains(
          firstPropertyBoundary,
          drawnShape as Feature<Polygon | MultiPolygon>,
        );

        if (!isWithinProperty) {
          const drawnCentroid = turf.centroid(drawnShape);

          try {
            const boundaryOutput = turf.polygonToLine(firstPropertyBoundary);
            const boundaryLine =
              boundaryOutput.type === "Feature"
                ? boundaryOutput
                : boundaryOutput.features[0];

            const nearestPointOnBoundary = turf.nearestPointOnLine(
              boundaryLine as Feature<
                LineString | MultiLineString,
                GeoJsonProperties
              >,
              drawnCentroid,
              { units: "meters" },
            );
            distanceToProperty =
              nearestPointOnBoundary.properties?.dist ?? null;
          } catch (error: unknown) {
            // Convert unknown error to string safely
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            console.warn(
              "Error calculating distance to property boundary:",
              errorMessage,
            );
          }
        }
        nearestPropertyId =
          (firstPropertyBoundary.properties?.matrikkelnummer as
            | string
            | undefined) ??
          (firstPropertyBoundary.properties?.id as string | undefined) ??
          null;
      } catch (error: unknown) {
        // Convert unknown error to string safely
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("Error during property spatial analysis:", errorMessage);
      }
    }
  }

  if (allowedAreaBoundary) {
    try {
      isWithinAllowedArea = turf.booleanContains(
        allowedAreaBoundary,
        drawnShape as Feature<Polygon | MultiPolygon>,
      );

      if (!isWithinAllowedArea) {
        if (
          drawnShape.geometry.type === "Polygon" ||
          drawnShape.geometry.type === "MultiPolygon"
        ) {
          buildingSize = turf.area(drawnShape);
        }

        if (distanceToProperty !== null && distanceToProperty < 5) {
          distanceToNeighborProperty = Math.max(0.5, distanceToProperty - 0.5);
        }

        if (distanceToProperty !== null && distanceToProperty < 15) {
          distanceToRoad = distanceToProperty + 2;
          roadType = "Municipal Road";
        }
      }
    } catch (error: unknown) {
      console.error(
        "Error during allowed area analysis:",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  return {
    isWithinProperty,
    distanceToProperty,
    nearestPropertyId,
    isWithinAllowedArea,
    distanceToNeighborProperty,
    neighborPropertyId,
    distanceToRoad,
    roadType,
    buildingSize,
  };
}

/** Search for property by property number — now via local API result */
export const searchProperty = async (
  propertyNumber: string
): Promise<PropertyData[] | null> => {
  if (!propertyNumber?.trim()) return null;

  // Reuse the local API fetcher you added earlier
  const { propertyBoundary, allowedBuildingArea } = await fetchPropertyBoundaryAndAllowedArea(
    propertyNumber,
    "http://localhost:3001",
  );

  if (!propertyBoundary || !allowedBuildingArea) return null;

  // Adapt the API result to your existing PropertyData shape
  const data: PropertyData = {
    propertyboundary_geojson: propertyBoundary as GeoJSON.FeatureCollection,
    allowedbuildingarea_geojson: allowedBuildingArea as GeoJSON.FeatureCollection,
    matrikkelnummertekst: propertyNumber,
    // If you also want to fill matrikkelnummer, you can mirror the same value:
    // matrikkelnummer: propertyNumber,
  };
  console.log("searchProperty: " + data.propertyboundary_geojson.type, data.allowedbuildingarea_geojson.type);
  console.log(data);
  return [data];
};


export interface ValidatedPropertyFeatureResult {
  feature?: GeoJSON.Feature;
  error?: string;
}
