# 🚀 LuminaKraft Launcher API

**FastAPI backend for the LuminaKraft Minecraft Launcher**

High-performance REST server providing modpack data, translations, and launcher information with automatic documentation and type validation.

🌐 **API Base URL**: `https://api.luminakraft.com`  
📡 **Status**: ✅ Operational  
📋 **Version**: 1.0.0  
🌍 **Languages**: Spanish, English  
⚡ **Framework**: FastAPI (Python)  
📦 **Package Manager**: uv

---

## 🎯 Overview

Modern FastAPI-based REST API serving:
- **Modpack data** with optimized lightweight and detailed responses
- **Multi-language support** with embedded translations
- **Type-safe validation** with Pydantic models
- **Automatic API documentation** at `/docs` (development)
- **Rate limiting and authentication** for security

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- uv package manager

### Development Setup
```bash
git clone https://github.com/kristiangarcia/luminakraft-launcher-api.git
cd luminakraft-launcher-api

# Create virtual environment and install dependencies
uv venv
source .venv/bin/activate
uv pip install -r pyproject.toml

# Run development server
python -m uvicorn app.main:app --host 0.0.0.0 --port 9374 --reload
```

### Docker Setup
```bash
# Build and run
docker build -t luminakraft-api .
docker run -p 9374:9374 -e ENVIRONMENT=development luminakraft-api

# Or use docker-compose
docker-compose up
```

## 🔗 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/v1/info` | API information |
| `GET` | `/v1/modpacks?lang=en` | **[MAIN]** Lightweight modpacks with translations |
| `GET` | `/v1/modpacks/list?lang=en` | Basic modpack info for dropdowns |
| `GET` | `/v1/modpacks/{id}` | Full modpack details |
| `GET` | `/v1/modpacks/{id}/features/{lang}` | Modpack features |
| `GET` | `/v1/translations` | Available languages |
| `GET` | `/v1/translations/{lang}` | Full translations |

### 🎯 Optimized Data Flow

**For browsing (client initial load):**
```bash
GET /v1/modpacks?lang=en
# Returns: Lightweight data + UI translations in single call
```

**For details (when user clicks modpack):**
```bash
GET /v1/modpacks/ancientkraft
# Returns: Full data with all images, collaborators, etc.
```

## 🔐 Authentication

All `/v1/*` endpoints require authentication:

**Microsoft Users:**
```bash
Authorization: Bearer <minecraft_access_token>
```

**Offline Users:**
```bash
x-lk-token: <launcher_generated_token>
```

Rate limiting: 180 requests/minute per user.

## 💾 Data Structure

### Lightweight Response (browsing)
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
      "logo": "https://luminakraft.com/.../logo.webp",
      "backgroundImage": "https://luminakraft.com/.../screenshot1.webp",
      "primaryColor": "#c0a080",
      "isNew": false,
      "isActive": false,
      "isComingSoon": false
    }
  ],
  "ui": {
    "status": {
      "new": "New",
      "active": "Active", 
      "coming_soon": "Coming Soon"
    },
    "modloader": {
      "forge": "Forge",
      "paper": "Paper"
    }
  }
}
```

### Full Response (details)
```json
{
  "id": "ancientkraft",
  "name": "AncientKraft",
  "version": "1.0.0",
  "images": [
    "screenshot1.webp",
    "screenshot2.webp"
    // ... all 11 images
  ],
  "collaborators": [
    {
      "name": "LuminaKraft Studios",
      "logo": "https://..."
    }
  ],
  "featureIcons": ["fa-magic", "fa-fist-raised"],
  "youtubeEmbed": "https://youtube.com/...",
  // ... all fields
}
```

## 🌍 Multi-language Support

The API automatically includes UI translations in modpack responses:

```bash
# Spanish (default)
GET /v1/modpacks?lang=es
# Returns: Spanish translations embedded

# English  
GET /v1/modpacks?lang=en
# Returns: English translations embedded
```

## 🎮 Available Modpacks

### 1. **AncientKraft Rechapter** 🏰
- **Status**: 🔜 Coming Soon
- **Type**: RPG / Adventure
- **Version**: 1.20.1 (Forge)

### 2. **One Piece World S2** 🏴‍☠️
- **Status**: 🔜 Coming Soon
- **Type**: RPG
- **Version**: 1.20.1 (Forge)

### 3. **LuminaKraft World** 🌍
- **Status**: 💤 Inactive
- **Type**: Survival
- **Version**: 1.21.1 (Paper)
- **IP**: `play.luminakraft.com`

### 4. **One Piece World** ⚓
- **Status**: 💤 Inactive
- **Type**: RPG
- **Version**: 1.20.1 (Forge)

### 5. **AncientKraft** 🗡️
- **Status**: 💤 Inactive
- **Type**: RPG / Adventure
- **Version**: 1.20.1 (Forge)

### 6. **PT: The Full Course** 🍽️
- **Status**: 💤 Inactive
- **Type**: Survival
- **Version**: 1.20.1 (Vanilla)
- **IP**: `pt.luminakraft.com`

## 🛠️ Development

### Project Structure
```
LuminaKraftLauncherAPI/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Settings management
│   ├── models/              # Pydantic models
│   │   ├── modpack.py       # Data models
│   │   └── response.py      # Response models
│   ├── routers/             # API endpoints
│   │   ├── modpacks.py      # Modpack endpoints
│   │   ├── translations.py  # Translation endpoints
│   │   └── curseforge.py    # CurseForge proxy
│   └── services/            # Business logic
│       ├── data_loader.py   # JSON data loading
│       └── auth.py          # Authentication
├── data/
│   ├── modpacks.json        # Modpack data
│   └── translations/        # Translation files
├── pyproject.toml           # Dependencies (uv)
├── Dockerfile               # Container image
└── docker-compose.yml      # Local development
```

### Environment Variables
```bash
# Server
PORT=9374
ENVIRONMENT=development

# API Keys  
CURSEFORGE_API_KEY=your_key_here

# CORS (production)
ALLOWED_ORIGINS=app://-,tauri://localhost

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=180
```

### Scripts
```bash
# Development
uv run dev

# Production
uv run start

# Docker
docker-compose up

# Tests (when implemented)
pytest
```

## 📈 Performance Features

- **Lightweight responses**: 75% smaller for browsing
- **Single API calls**: Embedded translations eliminate extra requests
- **Async FastAPI**: High concurrency with async/await
- **Smart caching**: In-memory caching with TTL
- **Type validation**: Pydantic ensures data integrity
- **Automatic docs**: OpenAPI/Swagger generated documentation

## 🔍 Monitoring

### Health Check
```bash
curl https://api.luminakraft.com/health
```

### API Documentation
- Development: `http://localhost:9374/docs`
- Production: Documentation disabled for security

### Debug Examples
```bash
# Test lightweight endpoint
curl -H "x-lk-token: test-token-long-enough" \
  "https://api.luminakraft.com/v1/modpacks?lang=en"

# Test individual modpack
curl -H "x-lk-token: test-token-long-enough" \
  "https://api.luminakraft.com/v1/modpacks/ancientkraft"

# Test translations
curl "https://api.luminakraft.com/v1/translations"
```

## 🚀 Deployment

### Production Checklist
- [ ] Set `ENVIRONMENT=production`
- [ ] Configure `ALLOWED_ORIGINS`
- [ ] Set `CURSEFORGE_API_KEY`
- [ ] Use proper authentication tokens
- [ ] Enable container health checks
- [ ] Monitor logs and metrics

### Docker Production
```bash
docker run -d \
  --name luminakraft-api \
  -p 9374:9374 \
  -e ENVIRONMENT=production \
  -e CURSEFORGE_API_KEY=your_key \
  -e ALLOWED_ORIGINS=https://yourdomain.com \
  luminakraft-api:latest
```

## 📝 Migration Notes

This version represents a complete migration from Express.js to FastAPI:

### What Changed
- ✅ **Framework**: Express.js → FastAPI
- ✅ **Language**: JavaScript → Python 
- ✅ **Package Manager**: npm → uv
- ✅ **Data Optimization**: Separated lightweight/full responses
- ✅ **Translations**: Now embedded in modpack responses
- ✅ **Type Safety**: Full Pydantic validation
- ✅ **Performance**: Async processing, better caching

### Breaking Changes
- Removed `/v1/launcher_data.json` → Use `/v1/modpacks?lang=`
- Removed `urlIcono` field → Use `logo`
- Added `backgroundImage` field (first image from array)

## 📞 Support

- **Repository**: [LuminaKraftLauncherAPI](https://github.com/kristiangarcia/luminakraft-launcher-api)
- **Issues**: GitHub Issues
- **API Status**: `GET /health`
- **Documentation**: `GET /docs` (development)

---

**Built with ❤️ using FastAPI and modern Python tooling**