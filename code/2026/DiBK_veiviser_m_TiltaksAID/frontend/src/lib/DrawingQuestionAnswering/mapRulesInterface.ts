// Defines the minimum distance thresholds (in meters) for each feature type.
// If a drawn polygon is closer than these distances, the user is warned or
// redirected to the summary page indicating they need a building permit.
export default interface MapRules {
    jernbaneRegler: number;
    bygningRegler: number;
    flomRegler: number;
    jordskredRegler: number;
    naboByggning1: number;
    naboByggning2: number;
    naboGrense: number;
    hoyvannRegel: number;
    buildingSize: number;

}