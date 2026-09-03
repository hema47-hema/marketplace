from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.project import Project
from ..schemas.ai import AIMatchResponse, AIMatchFreelancerOut
from ..schemas.project import ProjectOut
from ..schemas.user import UserOut
from ..services.ai_matcher import rank_freelancers_for_project, compute_ai_match
from ..auth_utils import get_current_user

router = APIRouter(prefix="/api/ai", tags=["AI Recommendation Engine"])

@router.get("/recommendations/{project_id}", response_model=AIMatchResponse)
def get_ai_recommendations_for_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    """
    Computes AI matching scores and ranks top qualified freelancers for a project brief.
    Evaluates required skills, synonym mappings, budget-rate compatibility, and past reviews.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Fetch verified freelancers
    freelancers = db.query(User).filter(
        User.role == "freelancer",
        User.is_verified == True
    ).all()

    ranked_matches = rank_freelancers_for_project(project, freelancers)

    return AIMatchResponse(
        project_id=project.id,
        project_title=project.title,
        total_candidates_analyzed=len(freelancers),
        matches=ranked_matches
    )

@router.get("/recommended-projects")
def get_recommended_projects_for_freelancer(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Ranks open projects matching the currently logged-in freelancer's profile skills.
    """
    projects = db.query(Project).filter(Project.status == "open").all()
    results = []

    for p in projects:
        if p.client_id == current_user.id:
            continue
        match_res = compute_ai_match(p, current_user)
        p_out = ProjectOut.model_validate(p)
        p_out.client = UserOut.model_validate(p.client) if p.client else None
        p_out.proposals_count = len(p.proposals)
        results.append({
            "project": p_out,
            "match_score": match_res.match_score,
            "breakdown": match_res.breakdown
        })

    # Sort descending by match score
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results
