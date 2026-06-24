// ==========================================================================
// Application Configuration
//
// Central configuration for map services, coordinate reference system,
// API paths, and building placement rule thresholds. All WMS/WMTS URLs
// and layer options are defined here for consistency across the app.
// ==========================================================================

import L from "leaflet";
import "proj4leaflet";
import type MapRules from "./DrawingQuestionAnswering/mapRulesInterface";
// Remember, we are using/making "regular" TS file beacause we are not exporting or returning any UI/JSX, only pure fuctions and variables

export const WMS_URL  = "https://wms.geonorge.no/skwms1/wms.norges_grunnkart?";
export const WMS_OPTIONS = { layers: "norges_grunnkart", format: "image/png", transparent: true, version: "1.3.0", maxZoom: 22, crossOrigin: true };

 // HD kart - gråtone versjon (ofte skarpere)
export const WMS_URL_HD = "http://51.120.9.87/api/wms/proxy?";
export const WMS_OPTIONS_HD = {
  layers: "topo", 
  format: "image/png",
  transparent: true,
  version: "1.1.1",
  srs: "EPSG:3857",
  baseurl: "https://wms.geonorge.no/skwms1/wms.nib?",
  maxZoom: 22,
  crossOrigin: true
}; 



// FKB WMS service configuration
export const FKB_WMS_URL = "https://wms.geonorge.no/skwms1/wms.fkb?";
export const FKB_WMS_OPTIONS = { 
  layers: "bygning", // Using the proper layer name "bygning" (buildings)
  format: "image/png", 
  transparent: true, 
  version: "1.3.0",
  maxZoom: 22,
  crossOrigin: true
};


// Norwegian UTM Zone 32 coordinate reference system used by all map layers.
// Resolution array defines zoom levels down to sub-meter precision.
export const crs = new (L as any).Proj.CRS(
  "EPSG:25832",
  "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
  {
    origin: [-127998, 9045980],
    resolutions: [
      8192, 4096, 2048, 1024, 512, 256, 128,
      64, 32, 16, 8, 4, 2, 1, 0.5, 0.25, 0.125, 0.0625,
      0.03125, 0.015625, 0.0078125, 0.00390625, 0.001953125, 0.0009765625, 0.00048828125, 0.000244140625
    ],
    bounds: L.bounds([-127998, 6377920], [1145510, 9045980])
  }
);

//export const COLOUR = { veg: "#2f7bff", teig: "#ff7f0e", bygning: "#2ca02c" };

//export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY || "";
//export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

// Backend API endpoint paths (currently unused – direct URLs are used instead)
export const API = {
  proximity: "/api/situasjonsplan",
  property : "/api/eiendomsgrense",
  bruksareal: "/api/bruksareal",
  avkjorsler: "/api/avkjorsler"
};


// Distance thresholds (in meters) that determine whether a drawn building
// placement violates proximity rules for railways, roads, buildings, etc.
export const rulesConfig: MapRules = {
  jernbaneRegler: 30,
  bygningRegler: 1,
  flomRegler: 20,
  jordskredRegler: 20,
  naboByggning1: 2,
  naboByggning2: 8,
  naboGrense: 1,
  buildingSize: 50,
  hoyvannRegel: 100
}