import json
import os
from typing import List, Dict, Optional
from pathlib import Path

from app.models.modpack import Modpack, Translations, AvailableLanguages

class DataLoader:
    """Service for loading and caching JSON data files"""
    
    def __init__(self):
        self.data_dir = Path(__file__).parent.parent.parent / "data"
        self._modpacks_cache: Optional[List[Dict]] = None
        self._translations_cache: Dict[str, Dict] = {}
        
    def get_modpacks(self) -> List[Dict]:
        """Load modpacks data from JSON file"""
        if self._modpacks_cache is None:
            modpacks_file = self.data_dir / "modpacks.json"
            try:
                with open(modpacks_file, 'r', encoding='utf-8') as f:
                    self._modpacks_cache = json.load(f)
            except FileNotFoundError:
                raise FileNotFoundError(f"Modpacks data file not found: {modpacks_file}")
            except json.JSONDecodeError as e:
                raise ValueError(f"Invalid JSON in modpacks file: {e}")
        
        return self._modpacks_cache
    
    def get_modpack_by_id(self, modpack_id: str) -> Optional[Dict]:
        """Get a specific modpack by ID"""
        modpacks = self.get_modpacks()
        return next((mp for mp in modpacks if mp["id"] == modpack_id), None)
    
    def get_translations(self, language: str) -> Dict:
        """Load translations for a specific language"""
        if language not in self._translations_cache:
            translations_file = self.data_dir / "translations" / f"{language}.json"
            try:
                with open(translations_file, 'r', encoding='utf-8') as f:
                    self._translations_cache[language] = json.load(f)
            except FileNotFoundError:
                raise FileNotFoundError(f"Translation file not found: {translations_file}")
            except json.JSONDecodeError as e:
                raise ValueError(f"Invalid JSON in translation file: {e}")
        
        return self._translations_cache[language]
    
    def get_available_languages(self) -> AvailableLanguages:
        """Get list of available translation languages"""
        translations_dir = self.data_dir / "translations"
        try:
            language_files = [f.stem for f in translations_dir.glob("*.json")]
            return AvailableLanguages(
                availableLanguages=sorted(language_files),
                defaultLanguage="es"
            )
        except Exception as e:
            # Fallback to known languages
            return AvailableLanguages(
                availableLanguages=["es", "en"],
                defaultLanguage="es"
            )
    
    def get_modpack_features(self, modpack_id: str, language: str) -> Optional[List[Dict]]:
        """Get features for a specific modpack in a specific language"""
        try:
            translations = self.get_translations(language)
            features = translations.get("features", {}).get(modpack_id, [])
            return features
        except (FileNotFoundError, KeyError):
            return None
    
    def clear_cache(self):
        """Clear all cached data"""
        self._modpacks_cache = None
        self._translations_cache.clear()

# Global instance
data_loader = DataLoader()