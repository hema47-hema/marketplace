from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserOut, UserUpdate
from ..auth_utils import get_current_user

router = APIRouter(prefix="/api/users", tags=["User Profiles & Freelancers"])

@router.get("/freelancers", response_model=List[UserOut])
def list_freelancers(
    skill: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Lists verified freelancers with optional skill or name filtering."""
    query = db.query(User).filter(
        User.role == "freelancer",
        User.is_verified == True
    )

    if skill:
        query = query.filter(User.skills.ilike(f"%{skill.strip()}%"))
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((User.full_name.ilike(s)) | (User.title.ilike(s)) | (User.skills.ilike(s)))

    return query.order_by(User.rating.desc()).all()

@router.get("/{user_id}", response_model=UserOut)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """Retrieves public user profile by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch("/me", response_model=UserOut)
def update_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates profile information for the authenticated user."""
    if payload.full_name is not None:
        current_user.full_name = payload.full_name.strip()
    if payload.title is not None:
        current_user.title = payload.title.strip()
    if payload.bio is not None:
        current_user.bio = payload.bio.strip()
    if payload.skills is not None:
        current_user.skills = payload.skills.strip()
    if payload.hourly_rate is not None:
        current_user.hourly_rate = payload.hourly_rate
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
