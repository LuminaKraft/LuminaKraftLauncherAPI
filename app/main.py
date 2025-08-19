from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from typing import Optional

from app.routers import modpacks, translations, curseforge
from app.config import settings

# Create FastAPI app
app = FastAPI(
    title="LuminaKraft Launcher API",
    description="Backend API for LuminaKraft Launcher - serves modpack data and launcher information",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
)

# Add middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)


# --- Custom CORS logic to match old Express.js behavior ---
allowed_origins = [o.strip() for o in (settings.ALLOWED_ORIGINS or "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",  # Allow all, but filter in custom middleware
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware to filter origins like Express
@app.middleware("http")
async def custom_cors_filter(request, call_next):
    origin = request.headers.get("origin")
    # Allow if no Origin header (non-browser clients), or if origin is in allowed_origins
    if not origin or origin in allowed_origins:
        response = await call_next(request)
        # Set Access-Control-Allow-Origin dynamically
        if origin:
            response.headers["Access-Control-Allow-Origin"] = origin
        else:
            response.headers["Access-Control-Allow-Origin"] = "*"
        # For preflight OPTIONS requests, set additional headers
        if request.method == "OPTIONS":
            response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = (
                "Content-Type,Authorization,x-lk-token,x-luminakraft-client,Cache-Control,Accept,If-None-Match,If-Modified-Since,X-Requested-With"
            )
            response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    else:
        from fastapi.responses import JSONResponse
        return JSONResponse({"detail": "CORS origin not allowed"}, status_code=400)

# Include routers
app.include_router(modpacks.router, prefix="/v1")
app.include_router(translations.router, prefix="/v1") 
app.include_router(curseforge.router, prefix="/v1/curseforge")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "timestamp": "2025-08-19T20:46:36.046Z",
        "version": "1.0.0"
    }

@app.get("/v1/info")
async def api_info():
    """API information endpoint"""
    return {
        "name": "luminakraft-launcher-api",
        "version": "1.0.0", 
        "description": "Backend API for LuminaKraft Launcher - serves modpack data and launcher information",
        "framework": "FastAPI",
        "endpoints": [
            "GET /health - Health check",
            "GET /v1/modpacks - Get all modpacks (lightweight with language support)",
            "GET /v1/modpacks/list - List modpacks with basic info only",
            "GET /v1/modpacks/{id} - Get specific modpack with full details",
            "GET /v1/modpacks/{id}/features/{lang} - Get modpack features in specific language",
            "GET /v1/translations - Available languages",
            "GET /v1/translations/{lang} - Get translations for language",
            "GET /v1/curseforge/test - Test CurseForge API connection",
            "GET /v1/curseforge/* - CurseForge API proxy endpoints",
            "GET /v1/info - API information"
        ]
    }

@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    """Custom 404 handler"""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not found",
            "message": "The requested endpoint does not exist",
            "availableEndpoints": [
                "/health",
                "/v1/modpacks",
                "/v1/modpacks/list", 
                "/v1/modpacks/{id}",
                "/v1/modpacks/{id}/features/{lang}",
                "/v1/translations",
                "/v1/translations/{lang}",
                "/v1/curseforge/test",
                "/v1/curseforge/mods/{modId}",
                "/v1/curseforge/mods/files",
                "/v1/info"
            ]
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )