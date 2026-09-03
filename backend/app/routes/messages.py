from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.user import User
from ..models.message import Message
from ..schemas.message import MessageCreate, MessageOut
from ..schemas.user import UserOut
from ..auth_utils import get_current_user

router = APIRouter(prefix="/api/messages", tags=["Integrated Messaging"])

@router.get("", response_model=List[MessageOut])
def get_messages(
    other_user_id: Optional[int] = None,
    project_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves message history between current user and another party,
    or for a specific project.
    """
    query = db.query(Message)

    if project_id:
        query = query.filter(Message.project_id == project_id)
    elif other_user_id:
        query = query.filter(
            ((Message.sender_id == current_user.id) & (Message.receiver_id == other_user_id)) |
            ((Message.sender_id == other_user_id) & (Message.receiver_id == current_user.id))
        )
    else:
        # Return all messages involving current user
        query = query.filter(
            (Message.sender_id == current_user.id) | (Message.receiver_id == current_user.id)
        )

    messages = query.order_by(Message.created_at.asc()).all()

    # Mark received as read
    for m in messages:
        if m.receiver_id == current_user.id and not m.is_read:
            m.is_read = True
    db.commit()

    result = []
    for m in messages:
        m_out = MessageOut.model_validate(m)
        m_out.sender = UserOut.model_validate(m.sender) if m.sender else None
        m_out.receiver = UserOut.model_validate(m.receiver) if m.receiver else None
        result.append(m_out)
    return result

@router.post("", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def send_message(
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sends a message to another user."""
    receiver = db.query(User).filter(User.id == payload.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Recipient not found")

    message = Message(
        project_id=payload.project_id,
        sender_id=current_user.id,
        receiver_id=payload.receiver_id,
        content=payload.content.strip(),
        is_read=False
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    m_out = MessageOut.model_validate(message)
    m_out.sender = UserOut.model_validate(current_user)
    m_out.receiver = UserOut.model_validate(receiver)
    return m_out
