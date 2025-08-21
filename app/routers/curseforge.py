from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
import httpx

from app.services.auth import rate_limited_user, UserInfo
from app.config import settings

class GetModFilesRequest(BaseModel):
    fileIds: List[int]

class GetModsRequest(BaseModel):
    modIds: List[int]
    filterPcOnly: Optional[bool] = True

router = APIRouter()

@router.get("/test")
async def test_curseforge_connection(
    user: UserInfo = Depends(rate_limited_user)
):
    """Test CurseForge API connection"""
    if not settings.CURSEFORGE_API_KEY:
        return {
            "status": "error",
            "message": "CurseForge API key not configured"
        }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.CURSEFORGE_API_URL}/games",
                headers={
                    "x-api-key": settings.CURSEFORGE_API_KEY,
                    "Accept": "application/json"
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                return {
                    "status": "ok",
                    "message": "CurseForge API connection successful",
                    "api_key_configured": True
                }
            else:
                return {
                    "status": "error", 
                    "message": f"CurseForge API returned status {response.status_code}",
                    "api_key_configured": True
                }
                
    except httpx.RequestError as e:
        return {
            "status": "error",
            "message": f"Failed to connect to CurseForge API: {str(e)}",
            "api_key_configured": True
        }

@router.get("/mods/{mod_id}")
async def get_mod(
    mod_id: int,
    user: UserInfo = Depends(rate_limited_user)
):
    """Get mod information from CurseForge"""
    if not settings.CURSEFORGE_API_KEY:
        raise HTTPException(status_code=503, detail="CurseForge API not configured")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.CURSEFORGE_API_URL}/mods/{mod_id}",
                headers={
                    "x-api-key": settings.CURSEFORGE_API_KEY,
                    "Accept": "application/json"
                },
                timeout=10.0
            )
            
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Mod not found")
            elif response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="CurseForge API error")
            
            return response.json()
            
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Failed to connect to CurseForge API")


@router.post("/mods")
async def get_mods(
    request: GetModsRequest,
    user: UserInfo = Depends(rate_limited_user)
):
    """Get multiple mods from CurseForge"""
    if not settings.CURSEFORGE_API_KEY:
        raise HTTPException(status_code=503, detail="CurseForge API not configured")
    
    try:
        if not request.modIds:
            raise HTTPException(status_code=400, detail="No mod IDs provided")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.CURSEFORGE_API_URL}/mods",
                headers={
                    "x-api-key": settings.CURSEFORGE_API_KEY,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                json={
                    "modIds": request.modIds,
                    "filterPcOnly": request.filterPcOnly
                },
                timeout=10.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="CurseForge API error")
            
            return response.json()
            
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Failed to connect to CurseForge API")

@router.post("/mods/files")
async def get_mod_files(
    request: GetModFilesRequest,
    user: UserInfo = Depends(rate_limited_user)
):
    """Get mod files from CurseForge for multiple file IDs"""
    if not settings.CURSEFORGE_API_KEY:
        raise HTTPException(status_code=503, detail="CurseForge API not configured")
    
    try:
        if not request.fileIds:
            raise HTTPException(status_code=400, detail="No file IDs provided")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.CURSEFORGE_API_URL}/mods/files",
                headers={
                    "x-api-key": settings.CURSEFORGE_API_KEY,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                json={"fileIds": request.fileIds},
                timeout=10.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="CurseForge API error")
            
            return response.json()
            
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Failed to connect to CurseForge API")