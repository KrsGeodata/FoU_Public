// Shape of the distance data extracted from proximity line analysis.
// Each key corresponds to a feature type; the array holds distances (meters)
// from the user's drawn polygon to each nearby feature of that type.
export default interface DataFromDrawing {
    jernbane: number[] | null;
    veg: [number, number][] | null;
    eiendomsgrense: number[] | null;
    naboBebyggelse: number[] | null;
    eiendomBebyggelse: number[] | null;
    flom: number[] | null;
    jordskred: number[] | null;
    hoyvann: number[] | null;
    buildingSize: number | null;
};

