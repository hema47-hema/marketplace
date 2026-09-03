from sqlalchemy import Column, Integer, String, Boolean, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="freelancer")  # 'client' or 'freelancer'
    is_verified = Column(Boolean, default=False)  # Requires 6-digit OTP verification
    avatar_url = Column(String(500), nullable=True)
    title = Column(String(255), default="")
    bio = Column(Text, default="")
    skills = Column(Text, default="")  # Comma-separated
    hourly_rate = Column(Float, default=45.0)
    balance = Column(Float, default=2500.0)  # Starting mock wallet balance
    escrow_balance = Column(Float, default=0.0)
    rating = Column(Float, default=5.0)
    reviews_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    otp_tokens = relationship("OTPToken", back_populates="user", cascade="all, delete-orphan")
    posted_projects = relationship("Project", back_populates="client", foreign_keys="Project.client_id")
    proposals = relationship("Proposal", back_populates="freelancer")
    sent_messages = relationship("Message", back_populates="sender", foreign_keys="Message.sender_id")
    received_messages = relationship("Message", back_populates="receiver", foreign_keys="Message.receiver_id")
    reviews_given = relationship("Review", back_populates="reviewer", foreign_keys="Review.reviewer_id")
    reviews_received = relationship("Review", back_populates="reviewee", foreign_keys="Review.reviewee_id")
