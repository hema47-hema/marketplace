from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    amount = Column(Float, nullable=False)
    status = Column(String(50), default="pending")  # 'pending', 'funded', 'submitted', 'released'
    submission_notes = Column(Text, nullable=True)
    submission_url = Column(String(500), nullable=True)
    due_days = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="milestones")
