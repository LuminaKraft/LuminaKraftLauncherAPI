from fastapi import APIRouter, HTTPException, Depends

from app.models.modpack import Translations, AvailableLanguages
from app.services.auth import rate_limited_user, UserInfo
from app.services.data_loader import data_loader

router = APIRouter()

@router.get("/translations", response_model=AvailableLanguages)
async def get_available_languages():
    """Get available translation languages"""
    try:
        return data_loader.get_available_languages()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to read available languages")

@router.get("/translations/{lang}", response_model=Translations)
async def get_translations(
    lang: str,
    user: UserInfo = Depends(rate_limited_user)
):
    """Get translations for specific language"""
    try:
        # Check if language is supported
        available_languages = data_loader.get_available_languages()
        if lang not in available_languages.availableLanguages:
            raise HTTPException(
                status_code=404,
                detail=f"Language '{lang}' is not supported. Available languages: {', '.join(available_languages.availableLanguages)}"
            )
        
        # Load translations
        translations_data = data_loader.get_translations(lang)
        
        return Translations(**translations_data)
        
    except HTTPException:
        raise
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"Translation file for language '{lang}' does not exist"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to read translation data")