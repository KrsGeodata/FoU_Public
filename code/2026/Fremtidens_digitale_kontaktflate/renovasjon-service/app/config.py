import os
from dotenv import load_dotenv

load_dotenv()

# CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# Norkart proxy
NORKART_APP_KEY = os.getenv("NORKART_APP_KEY", "AE13DEEC-804F-4615-A74E-B4FAC11F0A30")
NORKART_PROXY = "https://norkartrenovasjon.azurewebsites.net/proxyserver.ashx"
NORKART_API_BASE = "https://komteksky.norkart.no/MinRenovasjon.Api/api"

# Kartverket
KARTVERKET_SOK_URL = "https://ws.geonorge.no/adresser/v1/sok"

# Oslo
OSLO_URL = "https://www.oslo.kommune.no/actions/snap-lib-waste-complaint/search-by-address"

# HTTP timeout (seconds) for all outbound calls
HTTP_TIMEOUT = float(os.getenv("HTTP_TIMEOUT", "10"))

# Error code → HTTP status mapping
ERROR_STATUS_MAP: dict[str, int] = {
    "address_not_found": 404,
    "unsupported_municipality": 422,
}
