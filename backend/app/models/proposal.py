from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    freelancer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    cover_letter = Column(Text, nullable=False)
    bid_amount = Column(Float, nullable=False)
    estimated_days = Column(Integer, default=7)
    status = Column(String(50), default="pending")  # 'pending', 'accepted', 'rejected'
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="proposals")
    freelancer = relationship("User", back_populates="proposals")
