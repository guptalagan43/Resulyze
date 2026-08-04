"""Pydantic schemas for user registration, login, and token responses."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Schema for user registration."""

    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=255)
    role: str = Field(default="candidate", pattern="^(recruiter|candidate|admin)$")


class UserLogin(BaseModel):
    """Schema for user login."""

    email: str
    password: str


class UserResponse(BaseModel):
    """Schema for returning user data."""

    id: str
    email: str
    full_name: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """JWT token pair returned on login/register."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshRequest(BaseModel):
    """Schema for token refresh."""

    refresh_token: str
