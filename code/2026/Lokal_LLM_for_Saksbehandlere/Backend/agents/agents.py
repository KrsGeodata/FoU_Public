"""
agents.py
-------------
Instantiates a Pydantic AI agent utilized in the FastAPI app's /chat endpoint with specified configurations.
"""
# -*- coding: utf-8 -*-
import os
from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.models import ModelSettings
from dotenv import load_dotenv
from pydantic_ai.toolsets.fastmcp import FastMCPToolset
from fastmcp_server import mcp

load_dotenv() # needed for model definition in agent

os.environ["OPENAI_BASE_URL"] = os.getenv("LLM_BASE_URL")

model_name = os.getenv("LLM_MODEL")

# Example response model for an agent
class SimpleAgentResponse(BaseModel):
    answer: str = Field(description="The agent's response")


agent = Agent(
    model=model_name,
    toolsets=[FastMCPToolset(mcp)],
    #output_type=SimpleAgentResponse,
    model_settings=ModelSettings(max_tokens=512, temperature=0.6, timeout=60.0, frequency_penalty=0.5),
   
    system_prompt="""
Du er en faglig assistent for saksbehandlere i norske kommuner som arbeider med plan- og byggesaker.

Du hjelper med sporsmål knyttet til:
- Plan- og bygningsloven og tilhorende forskrifter
- Tolkning av reguleringsplaner og kommuneplaner
- Dispensasjonssøknader

Retningslinjer:
- Svar enten pa norsk eller engelsk
- Vaer konkret og faglig presis
- Hvis du er usikker, si det tydelig fremfor aa gjette
- Hvis en bruker refererer til en opplastet fil, bruk fil-ID-en eller filforhåndsvisningen som allerede er gitt i samtalekonteksten. Be aldri brukeren om aa skrive inn en UUID manuelt.
- Svar konsist og kort
- Ikke formater svarene dine, skriv de som ren tekst (e.g ikke **bold** osv)
"""
)
