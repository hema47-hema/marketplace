from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="Web Development")
    budget = Column(Float, nullable=False)
    status = Column(String(50), default="open")  # 'open', 'in_progress', 'completed', 'cancelled'
    required_skills = Column(Text, default="")  # Comma-separated
    deadline_days = Column(Integer, default=14)
    hired_freelancer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("User", foreign_keys=[client_id], back_populates="posted_projects")
    hired_freelancer = relationship("User", foreign_keys=[hired_freelancer_id])
    proposals = relationship("Proposal", back_populates="project", cascade="all, delete-orphan")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="project")
    reviews = relationship("Review", back_populates="project")
