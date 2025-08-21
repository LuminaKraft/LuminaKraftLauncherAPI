from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional

from app.models.modpack import (
    ModpacksResponse, ModpacksListResponse, Modpack, ModpackLightweight, 
    ModpackList, UITranslations, ModpackFeatures
)
from app.services.auth import rate_limited_user, UserInfo
from app.services.data_loader import data_loader

router = APIRouter()

@router.get("/modpacks", response_model=ModpacksResponse)
async def get_modpacks(
    lang: str = Query("en", description="Language code (es, en)"),
    user: UserInfo = Depends(rate_limited_user)
):
    """Get all modpacks with lightweight data and translations"""
    try:
        # Load modpacks and translations
        modpacks_data = data_loader.get_modpacks()
        translations = data_loader.get_translations(lang)
        
        # Build lightweight modpacks with translations
        lightweight_modpacks = []
        for modpack_data in modpacks_data:
            modpack_id = modpack_data["id"]
            modpack_translations = translations.get("modpacks", {}).get(modpack_id, {})
            
            lightweight_modpack = ModpackLightweight(
                id=modpack_data["id"],
                name=modpack_data["name"],
                shortDescription=modpack_translations.get("shortDescription", ""),
                version=modpack_data["version"],
                minecraftVersion=modpack_data["minecraftVersion"],
                modloader=modpack_data["modloader"],
                modloaderVersion=modpack_data["modloaderVersion"],
                gamemode=modpack_data["gamemode"],
                logo=modpack_data["logo"],
                backgroundImage=modpack_data["backgroundImage"],
                primaryColor=modpack_data["primaryColor"],
                isNew=modpack_data.get("isNew", False),
                isActive=modpack_data.get("isActive", False),
                isComingSoon=modpack_data.get("isComingSoon", False),
                urlModpackZip=modpack_data.get("urlModpackZip")
            )
            lightweight_modpacks.append(lightweight_modpack)
        
        # Build UI translations
        ui_translations = UITranslations(
            status=translations.get("ui", {}).get("status", {}),
            modloader=translations.get("ui", {}).get("modloader", {}),
            gamemode=translations.get("ui", {}).get("gamemode", {})
        )
        
        return ModpacksResponse(
            count=len(lightweight_modpacks),
            modpacks=lightweight_modpacks,
            ui=ui_translations
        )
        
    except FileNotFoundError as e:
        if "translation" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Language '{lang}' not supported")
        raise HTTPException(status_code=404, detail="Modpacks data not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load modpacks data")

@router.get("/modpacks/list", response_model=ModpacksListResponse)
async def get_modpacks_list(
    user: UserInfo = Depends(rate_limited_user)
):
    """Get modpacks with minimal info for dropdowns"""
    try:
        modpacks_data = data_loader.get_modpacks()
        
        modpack_list = [
            ModpackList(
                id=mp["id"],
                name=mp["name"],
                version=mp["version"],
                minecraftVersion=mp["minecraftVersion"],
                modloader=mp["modloader"],
                modloaderVersion=mp["modloaderVersion"]
            )
            for mp in modpacks_data
        ]
        
        return ModpacksListResponse(
            count=len(modpack_list),
            modpacks=modpack_list
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load modpacks list")

@router.get("/modpacks/{modpack_id}", response_model=Modpack)
async def get_modpack(
    modpack_id: str,
    lang: str = Query("en", description="Language code (es, en)"),
    user: UserInfo = Depends(rate_limited_user)
):
    """Get specific modpack with full details"""
    try:
        modpack_data = data_loader.get_modpack_by_id(modpack_id)
        if not modpack_data:
            raise HTTPException(
                status_code=404, 
                detail=f"Modpack with ID '{modpack_id}' does not exist"
            )
        # Get translations for this modpack
        translations = data_loader.get_translations(lang)
        modpack_translations = translations.get("modpacks", {}).get(modpack_id, {})
        modpack_data['description'] = modpack_translations.get('description', "")
        modpack_data['shortDescription'] = modpack_translations.get('shortDescription', "")
        # Add features from translations if available
        features = translations.get("features", {}).get(modpack_id, [])
        modpack_data['features'] = features
        return Modpack(**modpack_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load modpack data")
