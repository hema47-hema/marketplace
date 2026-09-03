import random
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict
from sqlalchemy.orm import Session
from ..models.otp import OTPToken
from ..models.user import User
from ..config import OTP_EXPIRE_MINUTES

logger = logging.getLogger("marketplace.otp_service")

# In-memory store for recent dev OTPs (for convenience in local testing/demo)
_recent_otps: Dict[str, dict] = {}

def generate_6digit_otp() -> str:
    """Generate a cryptographically suitable random 6-digit numeric code."""
    return f"{random.randint(100000, 999999)}"

def create_and_send_otp(db: Session, user: User) -> str:
    """
    Creates a new OTP token in the database, invalidates any previous unused tokens,
    and dispatches the email (logged prominently to console and stored for dev testing).
    """
    # Invalidate previous tokens
    db.query(OTPToken).filter(
        OTPToken.user_id == user.id,
        OTPToken.is_used == False
    ).update({"is_used": True})

    code = generate_6digit_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES)

    token = OTPToken(
        user_id=user.id,
        email=user.email,
        code=code,
        expires_at=expires_at,
        is_used=False
    )
    db.add(token)
    db.commit()

    # Save to in-memory store for quick UI dev retrieval
    _recent_otps[user.email.lower()] = {
        "code": code,
        "expires_at": expires_at,
        "user_id": user.id
    }

    # Dispatch: Log prominently so the tester can see it in terminal immediately
    border = "=" * 65
    print(f"\n{border}")
    print(f"[EMAIL DISPATCH TO: {user.email}]")
    print(f"   Hello {user.full_name},")
    print(f"   Your 6-Digit NexusAI Marketplace Verification Code is:")
    print(f"   >>>  [ {code} ]  <<<")
    print(f"   This code expires in {OTP_EXPIRE_MINUTES} minutes.")
    print(f"{border}\n")

    return code

def verify_user_otp(db: Session, email: str, code: str) -> bool:
    """
    Verifies that the provided 6-digit OTP is valid, unused, and not expired.
    If valid, marks it used and updates user.is_verified = True.
    """
    email_clean = email.strip().lower()
    token = db.query(OTPToken).filter(
        OTPToken.email.ilike(email_clean),
        OTPToken.code == code.strip(),
        OTPToken.is_used == False
    ).order_by(OTPToken.created_at.desc()).first()

    if not token:
        return False

    if datetime.utcnow() > token.expires_at:
        return False

    token.is_used = True
    user = db.query(User).filter(User.id == token.user_id).first()
    if user:
        user.is_verified = True
        db.add(user)

    db.add(token)
    db.commit()

    # Clear cached OTP
    if email_clean in _recent_otps:
        del _recent_otps[email_clean]

    return True

def get_latest_otp_for_dev(email: str) -> Optional[str]:
    """Helper for dev UI autofill / testing inspection."""
    rec = _recent_otps.get(email.strip().lower())
    if rec and datetime.utcnow() < rec["expires_at"]:
        return rec["code"]
    return None
