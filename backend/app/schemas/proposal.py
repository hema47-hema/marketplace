from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .user import UserOut

class ProposalBase(BaseModel):
    cover_letter: str
    bid_amount: float
    estimated_days: int = 7

class ProposalCreate(ProposalBase):
    project_id: int

class ProposalOut(ProposalBase):
    id: int
    project_id: int
    freelancer_id: int
    status: str
    created_at: datetime
    freelancer: Optional[UserOut] = None

    class Config:
        from_attributes = True
