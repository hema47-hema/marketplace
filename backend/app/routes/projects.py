from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.user import User
from ..models.project import Project
from ..models.proposal import Proposal
from ..models.milestone import Milestone
from ..schemas.project import ProjectCreate, ProjectOut, ProjectWithDetailsOut
from ..schemas.user import UserOut
from ..schemas.proposal import ProposalOut
from ..schemas.milestone import MilestoneOut
from ..auth_utils import get_current_user, get_optional_user

router = APIRouter(prefix="/api/projects", tags=["Projects Marketplace"])

@router.get("", response_model=List[ProjectOut])
def list_projects(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    client_id: Optional[int] = None,
    freelancer_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """List marketplace projects with optional filtering."""
    query = db.query(Project)

    if status:
        query = query.filter(Project.status == status)
    if category and category != "All":
        query = query.filter(Project.category.ilike(f"%{category}%"))
    if client_id:
        query = query.filter(Project.client_id == client_id)
    if freelancer_id:
        query = query.filter(Project.hired_freelancer_id == freelancer_id)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((Project.title.ilike(s)) | (Project.description.ilike(s)) | (Project.required_skills.ilike(s)))

    projects = query.order_by(Project.created_at.desc()).all()

    result = []
    for p in projects:
        p_out = ProjectOut.model_validate(p)
        p_out.client = UserOut.model_validate(p.client) if p.client else None
        p_out.hired_freelancer = UserOut.model_validate(p.hired_freelancer) if p.hired_freelancer else None
        p_out.proposals_count = len(p.proposals)
        result.append(p_out)
    return result

@router.post("", response_model=ProjectWithDetailsOut, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates a new project posting. Creates default milestones if none provided."""
    project = Project(
        client_id=current_user.id,
        title=payload.title.strip(),
        description=payload.description.strip(),
        category=payload.category,
        budget=payload.budget,
        status="open",
        required_skills=payload.required_skills.strip(),
        deadline_days=payload.deadline_days
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # If initial milestones supplied, create them; otherwise create 2 balanced milestones
    if payload.initial_milestones and len(payload.initial_milestones) > 0:
        for m in payload.initial_milestones:
            milestone = Milestone(
                project_id=project.id,
                title=m.get("title", "Project Milestone"),
                description=m.get("description", ""),
                amount=float(m.get("amount", payload.budget / len(payload.initial_milestones))),
                due_days=int(m.get("due_days", 7)),
                status="pending"
            )
            db.add(milestone)
    else:
        # Default 2-milestone structure
        m1 = Milestone(
            project_id=project.id,
            title="Phase 1: Architecture, Design & Foundation",
            description="Initial prototype, database setup, and core user interface implementation.",
            amount=round(payload.budget * 0.4, 2),
            due_days=max(3, payload.deadline_days // 2),
            status="pending"
        )
        m2 = Milestone(
            project_id=project.id,
            title="Phase 2: Full Implementation, Integration & Delivery",
            description="Complete feature set, integration, comprehensive tests, and final deployment hand-off.",
            amount=round(payload.budget * 0.6, 2),
            due_days=payload.deadline_days,
            status="pending"
        )
        db.add(m1)
        db.add(m2)

    db.commit()
    db.refresh(project)

    p_out = ProjectWithDetailsOut.model_validate(project)
    p_out.client = UserOut.model_validate(current_user)
    p_out.milestones = [MilestoneOut.model_validate(m) for m in project.milestones]
    p_out.proposals = []
    p_out.proposals_count = 0
    return p_out

@router.get("/{project_id}", response_model=ProjectWithDetailsOut)
def get_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    """Retrieves full project details including proposals and milestones."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    p_out = ProjectWithDetailsOut.model_validate(project)
    p_out.client = UserOut.model_validate(project.client) if project.client else None
    p_out.hired_freelancer = UserOut.model_validate(project.hired_freelancer) if project.hired_freelancer else None
    
    # Format proposals with freelancer details
    proposals_list = []
    for prop in project.proposals:
        prop_out = ProposalOut.model_validate(prop)
        prop_out.freelancer = UserOut.model_validate(prop.freelancer) if prop.freelancer else None
        proposals_list.append(prop_out)
    
    p_out.proposals = proposals_list
    p_out.proposals_count = len(proposals_list)
    p_out.milestones = [MilestoneOut.model_validate(m) for m in project.milestones]
    return p_out
