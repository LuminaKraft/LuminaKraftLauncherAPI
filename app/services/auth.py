import time
import re
from typing import Optional, Dict, Any
from fastapi import HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx

from app.config import settings

# Simple in-memory caches
token_cache: Dict[str, Dict[str, Any]] = {}
rate_limit_cache: Dict[str, Dict[str, Any]] = {}

security = HTTPBearer(auto_error=False)

class UserInfo:
    def __init__(self, user_id: str, username: str):
        self.user_id = user_id
        self.username = username

async def verify_microsoft_token(access_token: str) -> UserInfo:
    """Verify Microsoft/Minecraft access token and return user identity"""
    # Check cache first
    cached = token_cache.get(access_token)
    now = time.time()
    if cached and cached["expires_at"] > now:
        return UserInfo(cached["user_id"], cached["username"])
    
    # Verify by calling Minecraft profile API
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://api.minecraftservices.com/minecraft/profile",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json",
                },
                timeout=5.0
            )
            
            if response.status_code != 200 or not response.json().get("id"):
                raise HTTPException(status_code=401, detail="Invalid Microsoft token")
            
            data = response.json()
            user_id = data["id"]  # Minecraft UUID without dashes
            username = data.get("name", "MinecraftUser")
            
            # Cache for 5 minutes
            token_cache[access_token] = {
                "user_id": user_id,
                "username": username,
                "expires_at": now + 5 * 60
            }
            
            return UserInfo(user_id, username)
            
        except httpx.RequestError:
            raise HTTPException(status_code=401, detail="Failed to verify Microsoft token")

def verify_launcher_token(token: str) -> Optional[UserInfo]:
    """Validate launcher-generated client token (offline users)"""
    if not isinstance(token, str):
        return None
    
    trimmed = token.strip()
    # Base64url tokens from launcher should be at least 16 chars
    if len(trimmed) < 16:
        return None
    
    # Allow base64url characters: A-Z, a-z, 0-9, -, _
    if not re.match(r'^[A-Za-z0-9_\-]+$', trimmed):
        return None
    
    # Use token itself as stable user identifier for rate limiting
    return UserInfo(f"lk_{trimmed}", "OfflineUser")

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserInfo:
    """Authentication dependency that supports both Microsoft and launcher tokens"""
    
    # Try Microsoft Bearer token first
    if credentials and credentials.scheme.lower() == "bearer":
        try:
            return await verify_microsoft_token(credentials.credentials)
        except HTTPException:
            pass  # Fall through to launcher token
    
    # Try launcher token from headers
    launcher_token = request.headers.get("x-lk-token") or request.headers.get("x-luminakraft-token")
    if launcher_token:
        user = verify_launcher_token(launcher_token)
        if user:
            return user
    
    raise HTTPException(
        status_code=401,
        detail="Missing or invalid authentication token"
    )

def create_rate_limiter(window_ms: Optional[int] = None, max_requests: Optional[int] = None):
    """Create a rate limiting dependency"""
    window_ms = window_ms or settings.RATE_LIMIT_WINDOW_MS
    max_requests = max_requests or settings.RATE_LIMIT_MAX
    
    def rate_limit_dependency(request: Request, user: UserInfo = Depends(get_current_user)):
        now = time.time() * 1000  # Convert to milliseconds
        user_key = user.user_id
        
        # Get or create counter for this user
        if user_key not in rate_limit_cache:
            rate_limit_cache[user_key] = {"count": 0, "reset_time": now + window_ms}
        
        entry = rate_limit_cache[user_key]
        
        # Reset counter if window has expired
        if now > entry["reset_time"]:
            entry["count"] = 0
            entry["reset_time"] = now + window_ms
        
        # Check rate limit
        entry["count"] += 1
        if entry["count"] > max_requests:
            retry_after_sec = int((entry["reset_time"] - now) / 1000)
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again later.",
                headers={"Retry-After": str(retry_after_sec)}
            )
        
        return user
    
    return rate_limit_dependency

# Default rate limiter for protected endpoints
rate_limited_user = create_rate_limiter()