// ==========================================================================
// BRA/BYA Area Calculations (Legacy)
//
// Utility functions for computing building area metrics used in Norwegian
// building regulations:
//   - BRA (bruksareal): gross internal floor area across all floors
//   - BYA (bebygd areal): footprint area (ground coverage)
//   - TU (utnyttelsesgrad): utilization rate = totalBRA / propertyArea
//
// Uses turf.js for geodesic polygon area computation. Building type
// configurations provide floor-count multipliers to estimate BRA from BYA.
// ==========================================================================
import * as turf from '@turf/turf';
// Remember, we are using/making "regular" TS file beacause we are not exporting or returning any UI/JSX, only pure fuctions and variables
export interface BuildingCalculationResult {
  bra: number;           // Bruksareal (total usable floor area)
  bya: number;           // Bebygd areal (building footprint area)
  estimatedFloors: number;
  buildingType: string;
  footprintArea: number;
  braPerFloor: number;
  calculations: {
    method: string;
    confidence: 'high' | 'medium' | 'low';
    note: string;
  };
}

export interface BuildingTypeConfig {
  multiplier: number;
  confidence: 'high' | 'medium' | 'low';
  description: string;
}


// Lookup table mapping building types to floor-count multipliers and confidence levels
const buildingTypeConfigs: Record<string, BuildingTypeConfig> = {
  'enebolig': {
    multiplier: 2.0,
    confidence: 'medium',
    description: 'Default building type - typical 2 floors'
  },
  // Other types might be used in the feature, so lets keep this for now just in case
  'tomannsbolig': {
    multiplier: 2.0,
    confidence: 'medium', 
    description: 'Tomannsbolig - typisk 2 etasjer'
  },
  'rekkehus': {
    multiplier: 2.5,
    confidence: 'medium',
    description: 'Rekkehus - typisk 2-3 etasjer'
  },
  'leilighet': {
    multiplier: 3.0,
    confidence: 'low',
    description: 'Leilighetsbygg - typisk 3+ etasjer' 
  },
  'hytte': {
    multiplier: 1.5,
    confidence: 'medium',
    description: 'Hytte/fritidsbolig - typisk 1-2 etasjer'
  },
  'garasje': {
    multiplier: 1.0,
    confidence: 'high',
    description: 'Garasje - typisk 1 etasje'
  },
  'anneks': {
    multiplier: 1.0,
    confidence: 'high',
    description: 'Anneks/uthus - typisk 1 etasje'
  },
  'default': {
    multiplier: 1.5,
    confidence: 'low',
    description: 'Ukjent boligtype - antatt 1-2 etasjer'
  }
};

/**
 * Calculate polygon area in square meters using Turf.js
 */
// Computes geodesic area of a GeoJSON polygon using turf.js
export function calculatePolygonArea(geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): number {
  try {
    // Create a feature from the geometry for turf.area
    const feature = {
      type: 'Feature' as const,
      geometry,
      properties: {}
    };
    const area = turf.area(feature);
    return Math.round(area * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error calculating polygon area:', error);
    return 0;
  }
}

/**
 * Calculate BRA and BYA based on building type
 */
// Estimates BRA and BYA using building type multiplier defaults
export function calculateBRABYA(
  buildingGeometry: GeoJSON.Polygon | GeoJSON.MultiPolygon,
  buildingType: string = 'default'
): BuildingCalculationResult {
  // Get building type configuration
  const config = buildingTypeConfigs[buildingType] || buildingTypeConfigs['default'];
  
  // Calculate footprint area (BYA)
  const footprintArea = calculatePolygonArea(buildingGeometry);
  const bya = footprintArea;
  
  // Calculate BRA using multiplier
  const bra = footprintArea * config.multiplier;
  const braPerFloor = footprintArea;
  
  return {
    bra: Math.round(bra * 100) / 100,
    bya: Math.round(bya * 100) / 100,
    estimatedFloors: config.multiplier,
    buildingType,
    footprintArea,
    braPerFloor,
    calculations: {
      method: `Building type multiplier (${config.multiplier}x)`,
      confidence: config.confidence,
      note: config.description
    }
  };
}

/**
 * Calculate BRA with user-specified number of floors
 */
// Computes BRA using an explicit floor count instead of type-based multiplier
export function calculateBRAWithFloors(
  buildingGeometry: GeoJSON.Polygon | GeoJSON.MultiPolygon,
  floors: number,
  buildingType: string = 'default'
): BuildingCalculationResult {
  const footprintArea = calculatePolygonArea(buildingGeometry);
  const bya = footprintArea;
  const bra = footprintArea * floors;
  
  return {
    bra: Math.round(bra * 100) / 100,
    bya: Math.round(bya * 100) / 100,
    estimatedFloors: floors,
    buildingType,
    footprintArea,
    braPerFloor: footprintArea,
    calculations: {
      method: `User-specified floors (${floors}x)`,
      confidence: 'high',
      note: `Manual input: ${floors} etasjer`
    }
  };
}

/**
 * Calculate utilization rate (utnyttingsgrad)
 */
// Calculates the utilization rate (TU) = totalBRA / propertyArea
export function calculateUtilizationRate(
  totalBRA: number,
  propertyArea: number
): { utilizationRate: number; percentage: string } {
  if (propertyArea === 0) {
    return { utilizationRate: 0, percentage: '0%' };
  }
  
  const rate = totalBRA / propertyArea;
  const percentage = `${Math.round(rate * 10000) / 100}%`;
  
  return {
    utilizationRate: Math.round(rate * 1000) / 1000,
    percentage
  };
}

/**
 * Format area for display
 */
// Formats an area value as a Norwegian locale string with m² suffix
export function formatArea(area: number): string {
  return `${area.toLocaleString('nb-NO', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} m²`;
}

/**
 * Calculate total BRA/BYA for multiple buildings
 */
// Aggregates BRA/BYA totals across multiple buildings, grouped by type
export function calculateTotalAreaStats(buildings: BuildingCalculationResult[]): {
  totalBRA: number;
  totalBYA: number;
  averageFloors: number;
  buildingCount: number;
  byType: Record<string, { count: number; bra: number; bya: number }>;
} {
  const totalBRA = buildings.reduce((sum, building) => sum + building.bra, 0);
  const totalBYA = buildings.reduce((sum, building) => sum + building.bya, 0);
  const averageFloors = buildings.length > 0 
    ? buildings.reduce((sum, building) => sum + building.estimatedFloors, 0) / buildings.length
    : 0;
  
  // Group by building type
  const byType: Record<string, { count: number; bra: number; bya: number }> = {};
  buildings.forEach(building => {
    if (!byType[building.buildingType]) {
      byType[building.buildingType] = { count: 0, bra: 0, bya: 0 };
    }
    byType[building.buildingType].count += 1;
    byType[building.buildingType].bra += building.bra;
    byType[building.buildingType].bya += building.bya;
  });
  
  return {
    totalBRA: Math.round(totalBRA * 100) / 100,
    totalBYA: Math.round(totalBYA * 100) / 100,
    averageFloors: Math.round(averageFloors * 10) / 10,
    buildingCount: buildings.length,
    byType
  };
}