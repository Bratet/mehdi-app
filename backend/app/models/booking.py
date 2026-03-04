from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, Numeric, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..core.database import Base
import enum

if TYPE_CHECKING:
    from .customer import Customer
    from .device import DeviceType


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    converted = "converted"
    cancelled = "cancelled"
    no_show = "no_show"


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    establishment_id: Mapped[str] = mapped_column(String, ForeignKey("establishments.id"))
    customer_id: Mapped[str] = mapped_column(String, ForeignKey("customers.id"))
    device_type_id: Mapped[str] = mapped_column(String, ForeignKey("device_types.id"))
    device_id: Mapped[str | None] = mapped_column(String, ForeignKey("devices.id"), nullable=True)
    date: Mapped[str] = mapped_column(String)
    start_time: Mapped[str] = mapped_column(String)
    end_time: Mapped[str] = mapped_column(String)
    mode: Mapped[str] = mapped_column(String, default="solo")
    status: Mapped[str] = mapped_column(SAEnum(BookingStatus), default=BookingStatus.pending)
    deposit_paid: Mapped[bool] = mapped_column(Boolean, default=False)
    deposit_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    customer: Mapped[Customer] = relationship()
    device_type: Mapped[DeviceType] = relationship()
