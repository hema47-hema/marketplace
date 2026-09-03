from pydantic import BaseModel
from typing import List, Optional
from .user import UserOut

class AIMatchScoreBreakdown(BaseModel):
    skill_score: float  # 0 to 100
    rate_score: float   # 0 to 100
    rating_score: float # 0 to 100
    semantic_score: float # 0 to 100
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    reason: str

class AIMatchFreelancerOut(BaseModel):
    freelancer: UserOut
    match_score: int  # Overall 0 to 100 %
    breakdown: AIMatchScoreBreakdown

class AIMatchResponse(BaseModel):
    project_id: int
    project_title: str
    total_candidates_analyzed: int
    matches: List[AIMatchFreelancerOut]
