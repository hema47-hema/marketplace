from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from ..database import get_db
from ..models.user import User
from ..schemas.user import (
    UserCreate, UserVerifyOTP, UserResendOTP, UserLogin,
    UserOut, TokenResponse
)
from ..auth_utils import (
    hash_password, verify_password, create_access_token,
    get_current_user
)
from ..services.email_service import (
    create_and_send_otp, verify_user_otp, get_latest_otp_for_dev
)
from ..config import DEV_MODE

router = APIRouter(prefix="/api/auth", tags=["Authentication & OTP"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new client or freelancer account.
    Account starts as unverified (is_verified = False).
    Dispatches a 6-digit email OTP verification code.
    """
    email_clean = user_in.email.strip().lower()
    existing = db.query(User).filter(User.email.ilike(email_clean)).first()
    if existing:
        if not existing.is_verified:
            # Resend OTP if user already registered but never verified
            code = create_and_send_otp(db, existing)
            return {
                "message": "Account already exists but is unverified. A new 6-digit OTP has been sent to your email.",
                "email": existing.email,
                "needs_verification": True,
                "dev_otp": code if DEV_MODE else None
            }
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in."
        )

    new_user = User(
        email=email_clean,
        full_name=user_in.full_name.strip(),
        hashed_password=hash_password(user_in.password),
        role=user_in.role.lower() if user_in.role in ("client", "freelancer") else "freelancer",
        is_verified=False,
        title=user_in.title or ("Senior Freelance Specialist" if user_in.role == "freelancer" else "Project Client"),
        bio=user_in.bio or "Passionate tech professional ready to collaborate.",
        skills=user_in.skills or "",
        hourly_rate=user_in.hourly_rate or 45.0,
        balance=3000.0 if user_in.role == "client" else 250.0,
        avatar_url=f"https://api.dicebear.com/7.x/bottts/svg?seed={email_clean}"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate and dispatch 6-digit OTP
    code = create_and_send_otp(db, new_user)

    return {
        "message": f"Verification code sent to {new_user.email}. Please enter the 6-digit code to activate your account.",
        "email": new_user.email,
        "needs_verification": True,
        "dev_otp": code if DEV_MODE else None
    }

@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(payload: UserVerifyOTP, db: Session = Depends(get_db)):
    """
    Verifies the 6-digit email OTP and activates the user account.
    Returns standard JWT bearer access token on success.
    """
    email_clean = payload.email.strip().lower()
    user = db.query(User).filter(User.email.ilike(email_clean)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with this email was not found."
        )

    is_valid = verify_user_otp(db, email_clean, payload.code)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired 6-digit verification code. Please request a new one."
        )

    # Issue JWT token
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    db.refresh(user)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@router.post("/resend-otp")
def resend_otp(payload: UserResendOTP, db: Session = Depends(get_db)):
    """
    Resends a fresh 6-digit verification OTP code.
    """
    email_clean = payload.email.strip().lower()
    user = db.query(User).filter(User.email.ilike(email_clean)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    code = create_and_send_otp(db, user)
    return {
        "message": f"A new 6-digit OTP has been dispatched to {user.email}.",
        "email": user.email,
        "dev_otp": code if DEV_MODE else None
    }

@router.get("/latest-otp")
def get_latest_otp(email: str):
    """
    Development helper endpoint to preview the latest generated OTP.
    """
    if not DEV_MODE:
        raise HTTPException(status_code=403, detail="Endpoint only available in DEV_MODE")
    code = get_latest_otp_for_dev(email)
    if not code:
        raise HTTPException(status_code=404, detail="No active OTP found for this email.")
    return {"email": email, "code": code}

@router.post("/login", response_model=TokenResponse)
def login(creds: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates user. If account is not verified, automatically triggers OTP and prompts verification.
    """
    email_clean = creds.email.strip().lower()
    user = db.query(User).filter(User.email.ilike(email_clean)).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_verified:
        code = create_and_send_otp(db, user)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": "Account is unverified. A new 6-digit OTP has been sent to your email.",
                "needs_verification": True,
                "email": user.email,
                "dev_otp": code if DEV_MODE else None
            }
        )

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns the currently authenticated user's profile and balance."""
    return UserOut.model_validate(current_user)

@router.get("/demo-accounts")
def get_demo_accounts(db: Session = Depends(get_db)):
    """Returns demo client & freelancer accounts for quick evaluation."""
    users = db.query(User).filter(User.is_verified == True).limit(5).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "title": u.title,
            "skills": u.skills,
            "rating": u.rating
        }
        for u in users
    ]
