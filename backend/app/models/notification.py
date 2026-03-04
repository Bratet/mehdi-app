import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, JSON, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from ..core.database import Base
import enum


class NotificationType(str, enum.Enum):
    session_alert = "session_alert"
    low_stock = "low_stock"
    new_booking = "new_booking"
    system = "system"


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    establishment_id: Mapped[str] = mapped_column(String, ForeignKey("establishments.id"))
    user_id: Mapped[str | None] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    type: Mapped[str] = mapped_column(SAEnum(NotificationType))
    title: Mapped[str] = mapped_column(String)
    message: Mapped[str] = mapped_column(String)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
