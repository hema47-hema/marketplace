from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .user import UserOut
from .milestone import MilestoneOut
from .proposal import ProposalOut

class ProjectBase(BaseModel):
    title: str
    description: str
    category: str = "Web Development"
    budget: float
    required_skills: str = ""  # Comma-separated
    deadline_days: int = 14

class ProjectCreate(ProjectBase):
    initial_milestones: Optional[List[dict]] = None

class ProjectOut(ProjectBase):
    id: int
    client_id: int
    status: str
    hired_freelancer_id: Optional[int] = None
    created_at: datetime
    client: Optional[UserOut] = None
    hired_freelancer: Optional[UserOut] = None
    proposals_count: Optional[int] = 0

    class Config:
        from_attributes = True

class ProjectWithDetailsOut(ProjectOut):
    proposals: List[ProposalOut] = []
    milestones: List[MilestoneOut] = []
