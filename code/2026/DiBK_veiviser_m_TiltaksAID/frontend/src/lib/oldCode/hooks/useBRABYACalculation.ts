/* import { useState, useCallback } from 'react';
import type { BuildingCalculationResult } from '../lib/braByaCalculation';

export interface BuildingData {
  id: string;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  buildingType: string;
  floors?: number;
  layer?: L.Layer; // Reference to Leaflet layer
}

export interface BRABYAState {
  buildings: BuildingData[];
  results: Array<BuildingCalculationResult & { id: string }>;
  totals: {
    totalBRA: number;
    totalBYA: number;
    averageFloors: number;
    buildingCount: number;
    byType: Record<string, { count: number; bra: number; bya: number }>;
  } | null;
  utilizationRate: {
    rate: number;
    percentage: string;
    propertyArea: number;
  } | null;
  isCalculating: boolean;
  error: string | null;
}

const initialState: BRABYAState = {
  buildings: [],
  results: [],
  totals: null,
  utilizationRate: null,
  isCalculating: false,
  error: null
};

export function useBRABYACalculation() {
  const [state, setState] = useState<BRABYAState>(initialState);

  // Add a building
  const addBuilding = useCallback((building: Omit<BuildingData, 'id'>) => {
    const id = `building-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setState(prev => {
      const newState = {
        ...prev,
        buildings: [...prev.buildings, { ...building, id }],
        error: null
      };
      return newState;
    });
    return id;
  }, []);

  // Update a building
  const updateBuilding = useCallback((id: string, updates: Partial<Omit<BuildingData, 'id'>>) => {
    setState(prev => ({
      ...prev,
      buildings: prev.buildings.map(building =>
        building.id === id ? { ...building, ...updates } : building
      ),
      error: null
    }));
  }, []);

  // Remove a building
  const removeBuilding = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      buildings: prev.buildings.filter(building => building.id !== id),
      results: prev.results.filter(result => result.id !== id),
      error: null
    }));
  }, []);

  // Clear all buildings
  const clearBuildings = useCallback(() => {
    setState(initialState);
  }, []);

  // Calculate BRA/BYA for all buildings
  const calculateBRABYA = useCallback(async (propertyArea?: number) => {
    // Use a function to get the current state to avoid stale closure
    setState(prevState => {
      const currentBuildings = prevState.buildings;
      
      if (currentBuildings.length === 0) {
        return { ...prevState, error: 'No buildings to calculate' };
      }

      // Start the async calculation
      (async () => {
        setState(prev => ({ ...prev, isCalculating: true, error: null }));

        try {
          const requestBody = {
            buildings: currentBuildings.map(building => ({
              geometry: building.geometry,
              buildingType: building.buildingType,
              floors: building.floors,
              id: building.id
            })),
            propertyArea
          };

          const response = await fetch('http://51.120.9.87/api/bruksareal', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `HTTP ${response.status}`);
          }

          const data = await response.json();

          setState(prev => ({
            ...prev,
            results: data.buildings,
            totals: data.totals,
            utilizationRate: data.utilizationRate,
            isCalculating: false,
            error: null
          }));

        } catch (error) {
          console.error('BRA calculation failed:', error);
          setState(prev => ({
            ...prev,
            isCalculating: false,
            error: error instanceof Error ? error.message : 'Calculation failed'
          }));
        }
      })();

      return prevState;
    });
  }, []); // No dependencies since we're using setState callback

  // Get building result by ID
  const getBuildingResult = useCallback((id: string) => {
    return state.results.find(result => result.id === id);
  }, [state.results]);

  // Get building by ID
  const getBuilding = useCallback((id: string) => {
    return state.buildings.find(building => building.id === id);
  }, [state.buildings]);

  return {
    // State
    buildings: state.buildings,
    results: state.results,
    totals: state.totals,
    utilizationRate: state.utilizationRate,
    isCalculating: state.isCalculating,
    error: state.error,
    
    // Actions
    addBuilding,
    updateBuilding,
    removeBuilding,
    clearBuildings,
    calculateBRABYA,
    
    // Helpers
    getBuildingResult,
    getBuilding,
    
    // Computed values
    hasBuildings: state.buildings.length > 0,
    hasResults: state.results.length > 0
  };
} */