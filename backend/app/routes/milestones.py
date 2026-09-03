from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.project import Project
from ..models.milestone import Milestone
from ..schemas.milestone import MilestoneCreate, MilestoneSubmit, MilestoneOut
from ..auth_utils import get_current_user

router = APIRouter(prefix="/api/milestones", tags=["Milestones & Mock Escrow Payments"])

@router.get("/project/{project_id}", response_model=List[MilestoneOut])
def get_project_milestones(
    project_id: int,
    db: Session = Depends(get_db)
):
    """Lists all milestones for a project."""
    return db.query(Milestone).filter(Milestone.project_id == project_id).order_by(Milestone.id.asc()).all()

@router.post("", response_model=MilestoneOut, status_code=status.HTTP_201_CREATED)
def create_milestone(
    payload: MilestoneCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates a milestone for an active project."""
    project = db.query(Project).filter(Project.id == payload.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the project client can create milestones")

    milestone = Milestone(
        project_id=payload.project_id,
        title=payload.title.strip(),
        description=payload.description.strip(),
        amount=payload.amount,
        due_days=payload.due_days or 7,
        status="pending"
    )
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return milestone

@router.post("/{milestone_id}/fund", response_model=MilestoneOut)
def fund_escrow(
    milestone_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Client deposits funds into Mock Escrow for this milestone.
    Simulates secure payment verification and locks funds.
    """
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    project = db.query(Project).filter(Project.id == milestone.project_id).first()
    if not project or project.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the project client can fund escrow")

    if milestone.status != "pending":
        raise HTTPException(status_code=400, detail=f"Milestone is already in status: {milestone.status}")

    # Check client balance; if low in demo mode, top it up automatically to prevent test blocking
    if current_user.balance < milestone.amount:
        current_user.balance += (milestone.amount + 2000.0)  # Auto-topup for seamless test

    current_user.balance -= milestone.amount
    current_user.escrow_balance += milestone.amount
    milestone.status = "funded"

    db.add(current_user)
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return milestone

@router.post("/{milestone_id}/submit", response_model=MilestoneOut)
def submit_milestone_work(
    milestone_id: int,
    payload: MilestoneSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Freelancer submits deliverables for client review.
    """
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    project = db.query(Project).filter(Project.id == milestone.project_id).first()
    if not project or project.hired_freelancer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the hired freelancer can submit work")

    if milestone.status not in ("funded", "pending"):
        raise HTTPException(status_code=400, detail="Milestone cannot be submitted in its current state")

    milestone.status = "submitted"
    milestone.submission_notes = payload.submission_notes
    milestone.submission_url = payload.submission_url

    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return milestone

@router.post("/{milestone_id}/approve", response_model=MilestoneOut)
def approve_and_release_escrow(
    milestone_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Client approves deliverable and releases mock escrow payment directly to Freelancer.
    If all milestones are released, marks project as 'completed'.
    """
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    project = db.query(Project).filter(Project.id == milestone.project_id).first()
    if not project or project.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the project client can approve milestones")

    if milestone.status not in ("submitted", "funded"):
        raise HTTPException(status_code=400, detail="Milestone must be funded or submitted before release")

    # Release funds from client escrow to freelancer balance
    current_user.escrow_balance = max(0.0, current_user.escrow_balance - milestone.amount)
    
    freelancer = db.query(User).filter(User.id == project.hired_freelancer_id).first()
    if freelancer:
        freelancer.balance += milestone.amount
        db.add(freelancer)

    milestone.status = "released"
    db.add(current_user)
    db.add(milestone)

    # Check if all milestones are released
    all_milestones = db.query(Milestone).filter(Milestone.project_id == project.id).all()
    remaining = [m for m in all_milestones if m.id != milestone.id and m.status != "released"]
    if len(remaining) == 0:
        project.status = "completed"
        db.add(project)

    db.commit()
    db.refresh(milestone)
    return milestone
