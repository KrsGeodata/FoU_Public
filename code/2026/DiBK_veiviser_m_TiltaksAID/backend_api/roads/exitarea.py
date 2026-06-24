# ============================================================================
# Exit Area (Avkjørsel) Router
#
# Manages road exit/entry points ("avkjørsler") stored in Supabase.
# Provides endpoints to fetch all exit areas or filter by plan ID.
# Returns data as GeoJSON FeatureCollections for map rendering.
# ============================================================================

from fastapi import APIRouter, HTTPException;
from supabase import create_client, Client;
from pydantic import BaseModel;
from dotenv import load_dotenv;
from typing import List, Dict, Any;
from pydantic_settings import BaseSettings, SettingsConfigDict;
import os;

load_dotenv()

supabaseUrl = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabaseKey = os.getenv("NEXT_PUBLIC_SUPABASE_KEY")

# Creates a database client instance
supabase: Client = create_client(supabaseUrl, supabaseKey)

router = APIRouter(prefix="/exitarea", tags=["exitarea"])

class PlanidRequest(BaseModel):
    planid: int

# Fetches all exit area records and returns them as a GeoJSON FeatureCollection
@router.get("/FetchAllAvkjorsler")
async def getAllAvkjorsler():
    try: 
        response = supabase.table("avkjorsler").select("*").limit(1000).execute()
        transformData = transformToGeoJSON(response.data if isinstance( response.data, list) else [])
        return transformData
    except HTTPException:
        raise
    except Exception as err:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Error when trying to fetch all avkjørsler",
                "details": str(err)
            })


 # POST /api/avkjorsler Search for avkjørsler by planid
 #Request body: - planid: Plan ID to filter by
 
# Fetches exit areas filtered by a specific plan ID
@router.post("/AvkjorslerByPlanid")
async def postById(body: PlanidRequest):
    try: 
        planid = body.planid
        
        if not planid:
            raise HTTPException(
                status_code=400,
                detail="planid must be provided"
            )
        
        response = supabase.table("avkjorsler").select("*").eq("planid", planid).limit(10000).execute()
        data = response.data
        geoJson = transformToGeoJSON(data if isinstance(data, list) else [])
        
        if geoJson:
            return geoJson
        
        return data
    except HTTPException:
        raise
    except Exception as err:
        raise HTTPException(
            status_code=500, 
            detail={
                "error": "Error searching avkjørsler",
                "details": str(err)
            })
        
        
# Converts a list of database rows into a GeoJSON FeatureCollection,
# extracting geometry and mapping all relevant properties for each feature
def transformToGeoJSON(data: Any):
    return {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'geometry': item.get('geometry') or item.get('geom') or item.get('geom_wgs84'),
                'properties': {
                    'id': item.get('id'),
                    'objectid': item.get('objectid'),
                    'database': item.get('database'),
                    'objekttype': item.get('objekttype'),
                    'rpjuriskpunkt': item.get('rpjuriskpunkt'),
                    'rpjurpunkt': item.get('rpjurpunkt'),
                    'planid': item.get('planid'),
                    'vertniv': item.get('vertniv'),
                    'kommunenr': item.get('kommunenr'),
                    'kommune': item.get('kommune'),
                    'maalemetode': item.get('maalemetode'),
                    'kvalitet': item.get('kvalitet'),
                    'geometritype': item.get('geometritype'),
                    'forstedigitaliseringsdato': item.get('forstedigitaliseringsdato'),
                    'oppdateringsdato': item.get('oppdateringsdato')
                }
            }
            for item in data
        ]
    }