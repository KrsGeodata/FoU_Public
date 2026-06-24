// ==========================================================================
// Drawing-to-Summary Pipeline
//
// Bridges the map drawing interaction with the summary/receipt page.
// After the user draws a polygon, this module:
//   1. Gathers proximity distances from the sourceArray (handleDrawingData)
//   2. Checks each distance against regulatory thresholds (checkViolations)
//   3. Builds a SummaryState with rejection reasons (convertToReceiptState)
// ==========================================================================
import type DataFromDrawing from "./dataFromDrawingInterface";

import { getSourceArray, getDrawnPolygonArea, getVegArray } from "../map/drawingHandlers";

import type {SummaryState} from "../../components/SummaryComponent/SummaryTypes";

import {rulesConfig} from "../config";

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Collects distance arrays from the global sourceArray into a structured object
export function handleDrawingData(): DataFromDrawing {
    const sourceArray = getSourceArray();
    const drawingData: DataFromDrawing = {
        jernbane: sourceArray["jernbane"] || null,
        veg: getVegArray().length > 0 ? getVegArray() : null,
        eiendomsgrense: sourceArray["eiendomsgrense"] || null,
        naboBebyggelse: sourceArray["naboBebyggelse"] || null,
        eiendomBebyggelse: sourceArray["eiendomBebyggelse"] || null,
        flom: sourceArray["flom"] || null,
        jordskred: sourceArray["jordskred"] || null,
        hoyvann: sourceArray["hoyvann"] || null,
        buildingSize: getDrawnPolygonArea()
    };
    return drawingData;
}

// Checks if any measured distance violates the minimum thresholds.
// Returns an array of [featureType, violated] pairs, or false if all clear.
export function checkViolations(data: DataFromDrawing): [string, boolean][] {
    const regelMap: Record<string, number> = {
        jernbane: rulesConfig.jernbaneRegler,
        eiendomsgrense: rulesConfig.naboGrense,
        naboBebyggelse: rulesConfig.naboByggning1,
        eiendomBebyggelse: rulesConfig.bygningRegler,
        flom: rulesConfig.flomRegler,
        jordskred: rulesConfig.jordskredRegler,
        hoyvann: rulesConfig.hoyvannRegel,
    };

    const summaryArray: [string, boolean][] = [];
    for(const key in data) {
        if (key === 'buildingSize') continue;
        let isViolated = false;
        if (key === 'veg') {
            for (const [distance, required] of data.veg as [number, number][] || []) {
                if (distance <= required) { isViolated = true; break; }
            }
        } else {
            for(const distance of data[key as keyof DataFromDrawing] as number[] || []) {
                if(distance <= regelMap[key]) { isViolated = true; break; }
            }
        }
        summaryArray.push([key, isViolated]);
    }
    return summaryArray;
}

// Converts the violation array into a SummaryState object with human-readable
// rejection reasons for each violated feature type (railway, road, building, etc.)
// uses api call to backend to convert the array of violated features into a rejection array with questionTitle, questionDescription and reason for each violated feature type. Returns null if no violations or if an error occurs.
export async function convertToReceiptState(summaryArray: [string, boolean][] | false): Promise<SummaryState | null> {
    if (!summaryArray) return null;
    try {
        
        const response = await axios.get(`${API_BASE_URL}/convertToSummaryArray`, {
            params: {
                summaryArray: JSON.stringify(summaryArray)
            }
        });
        
        const rejectionArray = response.data;
        
        const summary: SummaryState = {
            endedEarly: rejectionArray.length > 0,
            rejectionInfo: rejectionArray,
            qaList: []
        };
        return summary;
    } catch (error) {
        console.error('Error converting to receipt state:', error);
        return null;
    }
}

