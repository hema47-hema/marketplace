from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .user import UserOut

class MessageBase(BaseModel):
    content: str
    receiver_id: int
    project_id: Optional[int] = None

class MessageCreate(MessageBase):
    pass

class MessageOut(BaseModel):
    id: int
    project_id: Optional[int] = None
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    created_at: datetime
    sender: Optional[UserOut] = None
    receiver: Optional[UserOut] = None

    class Config:
        from_attributes = True
