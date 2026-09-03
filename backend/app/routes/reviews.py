from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.project import Project
from ..models.review import Review
from ..schemas.review import ReviewCreate, ReviewOut
from ..schemas.user import UserOut
from ..auth_utils import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["Reviews & Ratings"])

@router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def submit_review(
    payload: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits a transparent rating and review upon project completion.
    Updates the recipient's aggregate star rating and review count.
    """
    project = db.query(Project).filter(Project.id == payload.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    reviewee = db.query(User).filter(User.id == payload.reviewee_id).first()
    if not reviewee:
        raise HTTPException(status_code=404, detail="Reviewed user not found")

    if payload.reviewee_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot review yourself")

    # Prevent duplicate review from same user for same project
    existing = db.query(Review).filter(
        Review.project_id == payload.project_id,
        Review.reviewer_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a review for this project")

    review = Review(
        project_id=payload.project_id,
        reviewer_id=current_user.id,
        reviewee_id=payload.reviewee_id,
        rating=float(payload.rating),
        tags=payload.tags or "",
        comment=payload.comment.strip()
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Recalculate recipient average rating
    all_reviews = db.query(Review).filter(Review.reviewee_id == reviewee.id).all()
    if all_reviews:
        avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
        reviewee.rating = round(avg_rating, 2)
        reviewee.reviews_count = len(all_reviews)
        db.add(reviewee)
        db.commit()

    r_out = ReviewOut.model_validate(review)
    r_out.reviewer = UserOut.model_validate(current_user)
    return r_out

@router.get("/user/{user_id}", response_model=List[ReviewOut])
def get_user_reviews(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Lists all verified reviews received by a user."""
    reviews = db.query(Review).filter(Review.reviewee_id == user_id).order_by(Review.created_at.desc()).all()
    result = []
    for r in reviews:
        r_out = ReviewOut.model_validate(r)
        r_out.reviewer = UserOut.model_validate(r.reviewer) if r.reviewer else None
        result.append(r_out)
    return result

@router.get("/project/{project_id}", response_model=List[ReviewOut])
def get_project_reviews(
    project_id: int,
    db: Session = Depends(get_db)
):
    """Lists reviews submitted for a project."""
    reviews = db.query(Review).filter(Review.project_id == project_id).all()
    result = []
    for r in reviews:
        r_out = ReviewOut.model_validate(r)
        r_out.reviewer = UserOut.model_validate(r.reviewer) if r.reviewer else None
        result.append(r_out)
    return result
