from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "freelancer"  # 'client' or 'freelancer'

class UserCreate(UserBase):
    password: str
    title: Optional[str] = ""
    bio: Optional[str] = ""
    skills: Optional[str] = ""
    hourly_rate: Optional[float] = 45.0

class UserVerifyOTP(BaseModel):
    email: EmailStr
    code: str

class UserResendOTP(BaseModel):
    email: EmailStr

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    is_verified: bool
    avatar_url: Optional[str] = None
    title: Optional[str] = ""
    bio: Optional[str] = ""
    skills: Optional[str] = ""
    hourly_rate: float
    balance: float
    escrow_balance: float
    rating: float
    reviews_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    hourly_rate: Optional[float] = None
    avatar_url: Optional[str] = None
