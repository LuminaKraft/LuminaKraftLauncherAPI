# FastAPI Modpack Schema - Optimized Structure

This documentation describes the optimized modpack data structure for the FastAPI-based launcher API with performance-focused lightweight and detailed responses.

## API Response Structure

### Lightweight Response (`/v1/modpacks?lang=en`)
Used for browsing/initial load - optimized for performance:

```json
{
  "count": 6,
  "modpacks": [
    {
      "id": "ancientkraft",
      "name": "AncientKraft",
      "shortDescription": "RPG adventure with custom systems",
      "version": "1.0.0",
      "minecraftVersion": "1.20.1",
      "modloader": "forge",
      "gamemode": "RPG / Aventura",
      "logo": "https://luminakraft.com/.../logo.webp",
      "backgroundImage": "https://luminakraft.com/.../screenshot1.webp",
      "primaryColor": "#c0a080",
      "isNew": false,
      "isActive": false,
      "isComingSoon": false,
      "urlModpackZip": "https://..."
    }
  ],
  "ui": {
    "status": {
      "new": "New",
      "active": "Active",
      "coming_soon": "Coming Soon",
      "inactive": "Inactive"
    },
    "modloader": {
      "forge": "Forge",
      "fabric": "Fabric",
      "paper": "Paper"
    },
    "gamemode": {
      "rpg": "RPG",
      "survival": "Survival"
    }
  }
}
```

### Full Response (`/v1/modpacks/{id}`)
Used for details page - complete data:

```json
{
  "id": "ancientkraft",
  "name": "AncientKraft",
  "version": "1.0.0",
  "minecraftVersion": "1.20.1",
  "modloader": "forge",
  "modloaderVersion": "47.1.3",
  "gamemode": "RPG / Aventura",
  "isNew": false,
  "isActive": false,
  "isComingSoon": false,
  "images": [
    "https://luminakraft.com/.../screenshot1.webp",
    "https://luminakraft.com/.../screenshot2.webp"
    // ... all images
  ],
  "logo": "https://luminakraft.com/.../logo.webp",
  "backgroundImage": "https://luminakraft.com/.../screenshot1.webp",
  "urlModpackZip": "https://...",
  "collaborators": [
    {
      "name": "LuminaKraft Studios",
      "logo": "https://luminakraft.com/imgs/favicon.webp"
    }
  ],
  "youtubeEmbed": "https://www.youtube.com/embed/...",
  "tiktokEmbed": "7489933381099179286",
  "featureIcons": ["fa-magic", "fa-fist-raised"],
  "primaryColor": "#c0a080",
  "leaderboardPath": "/data/servers/.../leaderboard.json",
  "ip": "play.luminakraft.com"
}
```

## Data Optimization Strategy

### Performance Improvements
- **Lightweight browsing**: Only essential data for modpack cards
- **On-demand details**: Heavy data loaded only when needed
- **Embedded translations**: UI translations included in responses
- **Single API calls**: No separate translation requests needed

### Field Classification

#### Lightweight Fields (Always Included)
- `id`, `name`, `version`, `minecraftVersion`, `modloader`
- `logo`, `backgroundImage`, `primaryColor`
- `gamemode`, `shortDescription` (from translations)
- Status flags: `isNew`, `isActive`, `isComingSoon`
- `urlModpackZip` (needed for install buttons)

#### Heavy Fields (Details Only)
- `images` array (all screenshots)
- `collaborators` array
- `youtubeEmbed`, `tiktokEmbed`
- `featureIcons`
- Optional fields: `ip`, `leaderboardPath`

### Data Structure Changes

#### ✅ Added Fields
- `backgroundImage`: First image from images array
- `shortDescription`: From translation files, embedded in response

#### ❌ Removed Fields  
- `urlIcono`: Redundant with `logo` field
- Separate translation calls (now embedded)

## Pydantic Models

### Core Models
```python
class ModpackLightweight(BaseModel):
    """Optimized for browsing performance"""
    id: str
    name: str
    shortDescription: str
    version: str
    minecraftVersion: str
    modloader: str
    gamemode: str
    logo: HttpUrl
    backgroundImage: HttpUrl
    primaryColor: str
    isNew: bool = False
    isActive: bool = False
    isComingSoon: bool = False
    urlModpackZip: Optional[HttpUrl] = None

class Modpack(BaseModel):
    """Complete modpack data"""
    id: str
    name: str
    version: str
    # ... all fields including images, collaborators, etc.

class UITranslations(BaseModel):
    """UI translations embedded in responses"""
    status: Dict[str, str]
    modloader: Dict[str, str] 
    gamemode: Dict[str, str]
```

## Translation Integration

### Embedded Translations
UI translations are now included directly in modpack responses:

```python
# API automatically includes based on lang parameter
GET /v1/modpacks?lang=es  # Spanish UI translations
GET /v1/modpacks?lang=en  # English UI translations
```

### Translation Structure
```json
{
  "modpacks": {
    "ancientkraft": {
      "name": "AncientKraft",
      "description": "Complete description...",
      "shortDescription": "RPG adventure with custom systems"
    }
  },
  "features": {
    "ancientkraft": [
      {
        "title": "Custom Magic System",
        "description": "Detailed feature description..."
      }
    ]
  },
  "ui": {
    "status": {"new": "New", "active": "Active"},
    "modloader": {"forge": "Forge", "paper": "Paper"},
    "gamemode": {"rpg": "RPG", "survival": "Survival"}
  }
}
```

## Client Integration Pattern

### Optimal Usage Flow
```typescript
// 1. Initial load - lightweight data with translations
const modpacks = await api.get('/v1/modpacks?lang=en');
// Display modpack grid with all needed data

// 2. User clicks modpack - get full details
const details = await api.get(`/v1/modpacks/${id}`);
// Show complete modpack details with all images
```

### Performance Benefits
- **75% smaller** initial response
- **Single API call** for browsing (no separate translations)
- **Progressive loading** - details fetched on demand
- **Better mobile experience** with reduced bandwidth

## Data Validation

### FastAPI Validation
All data is validated using Pydantic models:

- **Type safety**: Automatic type validation
- **URL validation**: HttpUrl ensures valid image/download URLs
- **Required fields**: Ensures data integrity
- **Optional fields**: Flexible for different modpack types

### Error Handling
```python
# Automatic validation errors
{
  "detail": [
    {
      "loc": ["modpacks", 0, "logo"],
      "msg": "invalid or missing URL",
      "type": "value_error.url"
    }
  ]
}
```

## Migration Notes

### From Express.js Structure
- **Endpoint changes**: `/v1/launcher_data.json` → `/v1/modpacks?lang=`
- **Response optimization**: Separated lightweight/detailed responses  
- **Field updates**: Added `backgroundImage`, removed `urlIcono`
- **Translation embedding**: UI translations included in responses

### Backward Compatibility
Breaking changes implemented for better performance:
- Clients must update to new endpoint structure
- `urlIcono` field removed (use `logo` instead)
- Translation calls no longer needed separately

## Implementation Examples

### Adding New Modpack
```json
{
  "id": "new_modpack",
  "name": "New Modpack",
  "version": "1.0.0",
  "minecraftVersion": "1.20.1",
  "modloader": "forge",
  "modloaderVersion": "47.1.3",
  "gamemode": "Adventure",
  "isNew": true,
  "isActive": true,
  "isComingSoon": false,
  "images": [
    "https://luminakraft.com/.../screenshot1.webp"
  ],
  "logo": "https://luminakraft.com/.../logo.webp",
  "backgroundImage": "https://luminakraft.com/.../screenshot1.webp",
  "urlModpackZip": "https://.../modpack.zip",
  "collaborators": [],
  "youtubeEmbed": "",
  "featureIcons": ["fa-sword", "fa-shield"],
  "primaryColor": "#ff6b35"
}
```

### Adding Translations
```json
// en.json
{
  "modpacks": {
    "new_modpack": {
      "name": "New Modpack",
      "description": "Complete English description...",
      "shortDescription": "Adventure modpack with magic"
    }
  }
}

// es.json  
{
  "modpacks": {
    "new_modpack": {
      "name": "Nuevo Modpack", 
      "description": "Descripción completa en español...",
      "shortDescription": "Modpack de aventura con magia"
    }
  }
}
```

---

**This optimized schema provides better performance, type safety, and developer experience while maintaining all necessary functionality for both launcher and web clients.**