from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MilestoneBase(BaseModel):
    title: str
    description: Optional[str] = ""
    amount: float
    due_days: Optional[int] = 5

class MilestoneCreate(MilestoneBase):
    project_id: int

class MilestoneSubmit(BaseModel):
    submission_notes: str
    submission_url: Optional[str] = None

class MilestoneOut(MilestoneBase):
    id: int
    project_id: int
    status: str
    submission_notes: Optional[str] = None
    submission_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
