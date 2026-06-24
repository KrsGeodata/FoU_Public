# ============================================================================
# WMS/WMTS Proxy Router
#
# Provides proxy endpoints for Web Map Service (WMS) and Web Map Tile
# Service (WMTS) requests. This avoids CORS issues when the frontend
# fetches map tiles directly from external services like Geonorge.
#
# Supports both WMS 1.1.1 (srs) and WMS 1.3.0 (crs) spatial reference
# parameters. Responses are cached via Cache-Control headers.
# ============================================================================

from fastapi import APIRouter, Depends, HTTPException, status, Query, Path;
from fastapi.responses import Response
import httpx


router = APIRouter(prefix="/coords", tags=["coords"])

@router.get("/wms/proxy")
async def wms_proxy(
    service: str = Query(default="WMS"),
    request: str = Query(default="GetMap"),
    layers: str = Query(...),
    baseurl: str = Query(default="https://wms.geonorge.no/skwms1/wms.norges_grunnkart"),
    styles: str = Query(default=""),
    format: str = Query(default="image/png"),
    transparent: str = Query(default="true"),
    version: str = Query(default="1.3.0"),
    width: int = Query(...),
    height: int = Query(...),
    bbox: str = Query(...),
    crs: str | None = Query(default=None),
    srs: str | None = Query(default=None),
):
    """
    Universal WMS Proxy (supports WMS 1.1.1 and 1.3.0)
    """

    # --- CRS / SRS normalization ---
    if version == "1.1.1":
        if not srs:
            raise HTTPException(status_code=422, detail="Missing 'srs' for WMS 1.1.1")
        spatial_key = "srs"
        spatial_value = srs
    else:
        if not crs:
            raise HTTPException(status_code=422, detail="Missing 'crs' for WMS 1.3.0")
        spatial_key = "crs"
        spatial_value = crs

    # --- Build WMS params ---
    params = {
        "service": service,
        "request": request,
        "layers": layers,
        "styles": styles,
        "format": format,
        "transparent": transparent,
        "version": version,
        "width": width,
        "height": height,
        "bbox": bbox,
        spatial_key: spatial_value,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(baseurl, params=params)

            print(
                f"Fetching from: {baseurl} | "
                f"layers={layers} | "
                f"version={version} | "
                f"status={response.status_code}"
            )

            if response.status_code != 200:
                print(f"Upstream error: {response.text[:300]}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail="WMS request failed"
                )

            return Response(
                content=response.content,
                media_type=format,
                headers={
                    "Cache-Control": "public, max-age=3600",
                    "Access-Control-Allow-Origin": "*",
                },
            )

    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=str(e))


# Proxies WMTS tile requests to external tile servers, returning individual
# map tiles for the specified layer, tile matrix, row and column
@router.get("/wmts/proxy")
async def wmts_proxy(
    layer: str = Query(...),
    tilematrixset: str = Query(...),
    tilematrix: str = Query(...),
    tilerow: int = Query(...),
    tilecol: int = Query(...),
    baseurl: str = Query(...),
    style: str = Query(default="default"),
    format: str = Query(default="image/png"),
):
    params = {
        "service": "WMTS",
        "request": "GetTile",
        "layer": layer,
        "style": style,
        "tilematrixset": tilematrixset,
        "tilematrix": tilematrix,
        "tilerow": tilerow,
        "tilecol": tilecol,
        "format": format,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(baseurl, params=params)

    if r.status_code != 200:
        raise HTTPException(status_code=r.status_code, detail="WMTS request failed")

    return Response(
        content=r.content,
        media_type=format,
        headers={
            "Cache-Control": "public, max-age=86400",
            "Access-Control-Allow-Origin": "*",
        },
    )

