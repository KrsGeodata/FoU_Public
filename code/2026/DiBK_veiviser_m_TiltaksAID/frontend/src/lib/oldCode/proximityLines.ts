// Function to parse proximity information from a GeoJSON
// Legacy GeoJSON proximity parser. Iterates over a FeatureCollection and
// categorises features by type (road, boundary, building) while extracting
// distance measurements. Superseded by proximityLineConfig.ts.
export function parseProximityInfo(fc: any){

    let roadDistance: string | null = null;
    let teigDistances: string[] = [];
    const vegFeatures: any[] = [];
    const teigFeatures: any[] = [];
    const bygningFeatures: any[] = [];

    if(!fc) return {roadDistance, teigDistances, vegFeatures, teigFeatures, bygningFeatures};
    try{
        //Process GeoJSON format
        if(fc.features && Array.isArray(fc.features)){ // Iterate through GeoJSON features array
            fc.features.forEach((elements: any) => {
                const name = elements.properties?.name?.toLowerCase();
                const featureType = elements.properties?.type?.toLowerCase() || '';
                const isRoad = name === "veg" || name === "vei" || featureType.includes("vei");
                const isTeig = name === "teig";
                const isBygning = name === "bygning";

                if(isRoad && typeof elements.properties?.length_m==="number"){
                    if(roadDistance === null || elements.properties.length_m < parseFloat(roadDistance?.replace(' m', '') || '99999')){
                        roadDistance = featureType.properties.length_m.toFixed(1) + " m";
                    }
                    vegFeatures.push(elements)
                }
                else if (isTeig && typeof elements.properties?.length_m === "number"){
                    teigDistances.push(elements.properties.length_m.toFixed(1) + " s");
                    teigFeatures.push(elements);
                }
                else if (isBygning && typeof elements.properties?.length_m === "number"){
                    bygningFeatures.push(elements);
                }
            });
        }
    } catch (err) {
        console.log("An error occured when parsing proximity info: ", err);
    }

    return {roadDistance, teigDistances, vegFeatures, teigFeatures, bygningFeatures};

}