// Parses an array of proximity LineObjects returned by the PostGIS function
// and categorises distances by source type (road, boundary, building, landslide).
// Returns a structured site_constraints_props object used by the info panel.
import type { site_constraints_props } from "../drawingHandlers";
import type { LineObject } from "./proximityLinesInterface";



export default function parseProximityFromLines(lines: LineObject[]): site_constraints_props {
  let minRoad: number | null = null;
  const roadInfo: { source: string; distance_m: number }[] = [];
  const eiendomsgrenseInfo: number[] = [];
  const nabobebyggelseInfo: number[] = [];
  const eiendomBebyggelseInfo: number[] = [];
  const jordskredInfo: number[] = [];
  const hoyvannInfo: number[] = [];

  for(const{source, distance_m} of lines){ //Creating new variable for each iteration, but they're populated with data from lines array based on matching property names from LineObject
    if(typeof distance_m !== "number") continue; //If distance_m type of value is not number, skip it and continue else where

    const isRoad = source === 'Ukategorisert veg' || source === 'kommunal veg' || source === 'privat veg' || source === 'skogsveg' || source === 'fylkesveg' || source === 'europaveg' || source === 'riksveg';

    if(isRoad){
      roadInfo.push({ source, distance_m });
      if(minRoad === null || distance_m < minRoad) minRoad = distance_m;
    } else if(source === "eiendomsgrense"){
      eiendomsgrenseInfo.push(distance_m);
    } else if(source === "naboBebyggelse"){
      nabobebyggelseInfo.push(distance_m)
    } else if(source === "eiendomBebyggelse"){
      eiendomBebyggelseInfo.push(distance_m)
    } else if (source === "jordskred"){
      jordskredInfo.push(distance_m);
    } else if (source === "hoyvann"){
      hoyvannInfo.push(distance_m);
    }
    
  }

  return {
    roadDistance: minRoad === null ? null : `${minRoad.toFixed(1)} m`,
    allProximityInfo: [...roadInfo.map(r => r.distance_m), ...eiendomsgrenseInfo, ...nabobebyggelseInfo, ...eiendomBebyggelseInfo, ...jordskredInfo, ...hoyvannInfo],
    roadInfo,
    eiendomsgrenseInfo,
    nabobebyggelseInfo,
    eiendomBebyggelseInfo,
    jordskredInfo,
    hoyvannInfo
  };
}
