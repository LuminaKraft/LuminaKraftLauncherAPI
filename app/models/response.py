from pydantic import BaseModel
from typing import Optional, List

class ErrorResponse(BaseModel):
    error: str
    message: str

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str

class APIInfoResponse(BaseModel):
    name: str
    version: str
    description: str
    framework: str
    endpoints: List[str]

class NotFoundResponse(BaseModel):
    error: str
    message: str
    availableEndpoints: List[str]

class UnauthorizedResponse(BaseModel):
    error: str
    message: str

class RateLimitResponse(BaseModel):
    error: str
    message: str
    resetInSeconds: int