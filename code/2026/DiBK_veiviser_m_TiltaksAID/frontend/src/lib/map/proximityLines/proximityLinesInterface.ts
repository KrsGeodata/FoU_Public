// Type definitions for GeoJSON line geometries returned by the PostGIS
// shortest-line function. Each LineObject represents a single proximity
// measurement from the drawn polygon to a nearby map feature.
interface LineString {
  type: "LineString";
  coordinates: [number, number][];
}

interface LineObject {
  line: LineString;
  source:  "Ukategorisert veg" | "fylkesveg" | "riksveg" | "kommunal veg" | "privat veg" | "skogsveg" | "europaveg" |
  "eiendomsgrense" | "naboBebyggelse"| "eiendomBebyggelse" |
  "jernbane" | "jordskred" | "flom" | "hoyvann";
  distance_m: number;
  paakrevd_avstand: number;
}

export type { LineString, LineObject };




