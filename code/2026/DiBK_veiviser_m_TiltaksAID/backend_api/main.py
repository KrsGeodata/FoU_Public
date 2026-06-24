# ============================================================================
# Backend API Entry Point
#
# FastAPI application serving as the backend for the DIBK building permit
# guidance tool. Provides endpoints for:
#   - Supabase database queries (property data, PostGIS spatial functions)
#   - Proxy to Geonorge address search API
#   - Road exit area (avkjørsel) data via the exitarea router
#
# The API bridges the frontend map application with spatial databases and
# external Norwegian geospatial services.
# ============================================================================

# Importing neccesary modules and packages
from fastapi import FastAPI, Depends, HTTPException, status, Query, Path, Request;
from fastapi.responses import Response
from starlette.responses import RedirectResponse
from roads import exitarea
import httpx
from fastapi.middleware.cors import CORSMiddleware;
from supabase import create_client, Client;
from dotenv import load_dotenv;
from pydantic_settings import BaseSettings, SettingsConfigDict;
from typing import List, Dict, Any;
from pydantic import BaseModel
from fastapi import Query, HTTPException
from fastapi.responses import Response
from survey.JSONbuilder import build_survey_json
import os;
import json;

app = FastAPI(
    docs_url="/docs",
    openapi_url="/openapi.json",
    title="DIBK Building Permit API"
)
app.include_router(exitarea.router)

# Load the .env file
load_dotenv()

# Loading supabase configuration
supabaseUrl = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabaseKey = os.getenv("NEXT_PUBLIC_SUPABASE_KEY")

# Creates a database client instance
supabase: Client = create_client(supabaseUrl, supabaseKey)

# Debug prints to verify that the URL and key are loaded correctly
print(supabaseUrl, "is the url, can be read in the terminal")
print(supabaseKey, "is the key, can be read in the terminal")

# Configures CORS so frontend apps can access the API
origins = [
    "http://localhost:5173",
    "https://localhost:5173",
    "http://127.0.0.1:5173",
    "https://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://127.0.0.1:5174",
    "http://localhost:5174",
    "https://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://51.120.9.87:3000",
    "http://51.120.9.87",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#if not supabaseKey or not supabaseUrl:
    #raise ValueError("Supabase key and URl must be loaded in the env")

# Request body models for endpoints that accept POST data
class PlanidRequest(BaseModel):
    planid: str
class AddressMatrikkelRequest(BaseModel):
    addressSearch: str

    
@app.get("/")
async def root():
    return {"Message": "is a reload test"}


# Retrieves all rows from the "byggesoknader" (building applications) table
@app.get("/GetTables", response_model=List[Dict[str, Any]])
async def tableValues():
    try: 
        response = supabase.table("byggesoknader").select("*").execute()
        data = response.data
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
# Calls a PostGIS remote procedure to look up property geometry by matrikkel number
@app.get("/PostGISfn", response_model=List[Dict[str,Any]])
async def get_postgress(matrikkelNr: str):
    try: 
        matrikkelNr = str(matrikkelNr)
        response = supabase.rpc("pi_allowed_building_area5", {"matrikkelnummer": matrikkelNr}).execute()
        print("Response:", response)
        if response is not None:
            data = response.data
            return data
    except Exception as e:
        print("ERROR in /PostGISfn:", type(e).__name__, str(e))
        raise HTTPException(status_code=500, detail=str(e))



# Calls a PostGIS function to compute shortest distance lines from a drawn geometry
# to nearby features (roads, buildings, property boundaries, landslide zones, etc.)
@app.get("/PostGISfnShortestLines", response_model=List[Dict[str,Any]])
async def get_shortestLines(geomInput: str, matrikkelNr: str = None):
    try: 
        # Parse the stringified JSON back to a dict/object
        geom_dict = json.loads(geomInput)
        matrikkelNr = matrikkelNr if matrikkelNr else None
        response = supabase.rpc("pi_get_nearby_features", {"geom_input": geom_dict, "matrikkelnummer": matrikkelNr}).execute()
        data = response.data
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# Proxies address search requests to the Geonorge address API (ws.geonorge.no)
# and returns matching addresses with coordinates and matrikkel info
@app.get("/PropertiesValues")
async def getPropertyValue(addressQuery: str):
    
    external_api = f"https://ws.geonorge.no/adresser/v1/sok?sok={addressQuery}"
    
    print(external_api)
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try: 
            response = await client.get(external_api)
            response.raise_for_status()
            return response.json()
            
        except  httpx.HTTPStatusError as exc:
            # Handle specific HTTP errors (e.g., 404 Not Found, 500 Server Error)
            raise HTTPException(status_code=exc.response.status_code, detail=f"Error from API: {exc.response.status_code}")
        except httpx.HTTPStatusError as exc:
            raise HTTPException(status_code=500, detail=f"An error eccoured while trying to fetch data: {exc}")
              
class RejectionObject(BaseModel):
    questionTitle: str
    questionDescription: str
    reason: str

@app.get("/survey-config")
async def get_survey_config():
    try:
        response = supabase.table("question_sections") \
            .select("*, questions(*, question_options(*, question_warnings(*)), question_show_when(*, question_show_when_condition(*)))") \
            .order("section_order") \
            .execute()

        # Build a map of question id (int) → question_name (str)
        id_to_name = {
            q["id"]: q["question_name"]
            for section in response.data
            for q in section.get("questions", [])
        }

        return build_survey_json(response.data, id_to_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/convertToSummaryArray") 
async def convertToSummaryArray(summaryArray: str):
    try:
        # Parse the stringified JSON back to a list of tuples
        ArrayOfProximityLines = json.loads(summaryArray)
        rejectionArray = []
        
        for item in ArrayOfProximityLines:
            type_name = item[0]  # Get the string (jernbane, veg, etc)
            is_true = item[1]    # Get the boolean
            
            if not is_true:
                continue
            
            rejection_config = {
                "jernbane": {
                    "questionTitle": "Jernbane",
                    "questionDescription": "Du er nærmere enn 30 meter fra jernbane",
                    "reason": "Du er for nærme"
                },
                "veg": {
                    "questionTitle": "Veg",
                    "questionDescription": "Du er nærmere enn 50 meter fra veg",
                    "reason": "Du er for nærme"
                },
                "bygning": {
                    "questionTitle": "Bygning",
                    "questionDescription": "Du er nærmere enn 2 meter fra Bygning",
                    "reason": "Du er for nærme"
                },
                "jordskred": {
                    "questionTitle": "jordskred",
                    "questionDescription": "Du er nærmere enn 2 meter fra Jordskred",
                    "reason": "Du er for nærme"
                }
            }
            
            if type_name in rejection_config:
                rejection = RejectionObject(**rejection_config[type_name])
                rejectionArray.append(rejection.__dict__)
        
        return rejectionArray



    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

