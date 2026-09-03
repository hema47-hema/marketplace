from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.project import Project
from ..models.proposal import Proposal
from ..schemas.proposal import ProposalCreate, ProposalOut
from ..schemas.user import UserOut
from ..auth_utils import get_current_user

router = APIRouter(prefix="/api/proposals", tags=["Proposals"])

@router.post("", response_model=ProposalOut, status_code=status.HTTP_201_CREATED)
def submit_proposal(
    payload: ProposalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allows a freelancer to submit a proposal/bid on an open project."""
    project = db.query(Project).filter(Project.id == payload.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.status != "open":
        raise HTTPException(status_code=400, detail="This project is no longer accepting new proposals")

    if project.client_id == current_user.id:
        raise HTTPException(status_code=400, detail="Clients cannot apply to their own projects")

    # Check for duplicate proposal
    existing = db.query(Proposal).filter(
        Proposal.project_id == payload.project_id,
        Proposal.freelancer_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a proposal for this project")

    proposal = Proposal(
        project_id=payload.project_id,
        freelancer_id=current_user.id,
        cover_letter=payload.cover_letter.strip(),
        bid_amount=payload.bid_amount,
        estimated_days=payload.estimated_days,
        status="pending"
    )
    db.add(proposal)
    db.commit()
    db.refresh(proposal)

    p_out = ProposalOut.model_validate(proposal)
    p_out.freelancer = UserOut.model_validate(current_user)
    return p_out

@router.post("/{proposal_id}/accept", response_model=ProposalOut)
def accept_proposal(
    proposal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Client accepts a proposal:
    - Sets proposal status to 'accepted'
    - Rejects other proposals for this project
    - Sets project status to 'in_progress' and hired_freelancer_id to this freelancer
    """
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    project = db.query(Project).filter(Project.id == proposal.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the project client can accept proposals")

    proposal.status = "accepted"
    project.status = "in_progress"
    project.hired_freelancer_id = proposal.freelancer_id

    # Reject other proposals
    other_proposals = db.query(Proposal).filter(
        Proposal.project_id == project.id,
        Proposal.id != proposal.id
    ).all()
    for other in other_proposals:
        other.status = "rejected"

    db.commit()
    db.refresh(proposal)

    p_out = ProposalOut.model_validate(proposal)
    p_out.freelancer = UserOut.model_validate(proposal.freelancer)
    return p_out
