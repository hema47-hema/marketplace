from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .user import UserOut

class ReviewCreate(BaseModel):
    project_id: int
    reviewee_id: int
    rating: float = Field(..., ge=1.0, le=5.0)
    tags: Optional[str] = ""
    comment: str

class ReviewOut(BaseModel):
    id: int
    project_id: int
    reviewer_id: int
    reviewee_id: int
    rating: float
    tags: str
    comment: str
    created_at: datetime
    reviewer: Optional[UserOut] = None

    class Config:
        from_attributes = True
