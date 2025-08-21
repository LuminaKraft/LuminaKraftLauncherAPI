
# Ensure forward references are resolved after all classes are defined
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any


class Collaborator(BaseModel):
    name: str
    logo: Optional[HttpUrl] = None

class Modpack(BaseModel):
    id: str
    name: str
    shortDescription: str
    description: str
    version: str
    minecraftVersion: str
    modloader: str
    modloaderVersion: str
    gamemode: str
    isNew: bool = False
    isActive: bool = False
    isComingSoon: bool = False
    images: List[HttpUrl]
    logo: HttpUrl
    backgroundImage: HttpUrl
    urlModpackZip: Optional[HttpUrl] = None
    collaborators: List[Collaborator] = []
    youtubeEmbed: Optional[str] = None
    tiktokEmbed: Optional[str] = None
    featureIcons: List[str] = []
    primaryColor: str
    leaderboardPath: Optional[str] = None
    ip: Optional[str] = None
    features: List['Feature'] = []

class ModpackLightweight(BaseModel):
    """Lightweight modpack model for list endpoints"""
    id: str
    name: str
    shortDescription: str  # From translations
    version: str
    minecraftVersion: str
    modloader: str
    modloaderVersion: str
    gamemode: str
    logo: HttpUrl
    backgroundImage: HttpUrl
    primaryColor: str
    isNew: bool = False
    isActive: bool = False
    isComingSoon: bool = False
    urlModpackZip: Optional[HttpUrl] = None
    ip: Optional[str] = None

class ModpackList(BaseModel):
    """Very basic modpack info for dropdowns"""
    id: str
    name: str
    version: str
    minecraftVersion: str
    modloader: str
    modloaderVersion: str

class UITranslations(BaseModel):
    """UI translations needed for modpack display"""
    status: Dict[str, str]
    modloader: Dict[str, str]
    gamemode: Dict[str, str]

class ModpacksResponse(BaseModel):
    """Response model for modpacks endpoint"""
    count: int
    modpacks: List[ModpackLightweight]
    ui: UITranslations

class ModpacksListResponse(BaseModel):
    """Response model for modpacks/list endpoint"""
    count: int
    modpacks: List[ModpackList]

class Feature(BaseModel):
    title: str
    description: Optional[str] = None

class ModpackFeatures(BaseModel):
    modpackId: str
    language: str
    features: List['Feature']

class ModpackTranslations(BaseModel):
    name: str
    description: str
    shortDescription: str

class Translations(BaseModel):
    modpacks: Dict[str, ModpackTranslations]
    features: Dict[str, List['Feature']]
    ui: UITranslations


class AvailableLanguages(BaseModel):
    availableLanguages: List[str]
    defaultLanguage: str

# Ensure forward references are resolved after all classes are defined
Modpack.update_forward_refs()
ModpackFeatures.update_forward_refs()
Translations.update_forward_refs()