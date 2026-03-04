from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, DateTime, Numeric, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..core.database import Base
import enum

if TYPE_CHECKING:
    from .device import Device
    from .customer import Customer


class SessionStatus(str, enum.Enum):
    active = "active"
    paused = "paused"
    completed = "completed"
    auto_closed = "auto_closed"


class SessionMode(str, enum.Enum):
    solo = "solo"
    multiplayer = "multiplayer"


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    establishment_id: Mapped[str] = mapped_column(String, ForeignKey("establishments.id"))
    device_id: Mapped[str] = mapped_column(String, ForeignKey("devices.id"))
    customer_id: Mapped[str | None] = mapped_column(String, ForeignKey("customers.id"), nullable=True)
    started_by: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(SAEnum(SessionStatus), default=SessionStatus.active)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    paused_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    total_pause_duration: Mapped[int] = mapped_column(Integer, default=0)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    segments: Mapped[list[SessionSegment]] = relationship(back_populates="session")
    device: Mapped[Device] = relationship()
    customer: Mapped[Customer | None] = relationship()


class SessionSegment(Base):
    __tablename__ = "session_segments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String, ForeignKey("sessions.id"))
    mode: Mapped[str] = mapped_column(SAEnum(SessionMode))
    rate_per_hour: Mapped[float] = mapped_column(Numeric(10, 2))
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cost: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)

    session: Mapped[Session] = relationship(back_populates="segments")
