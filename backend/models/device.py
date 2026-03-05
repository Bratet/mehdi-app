from datetime import datetime
from typing import Optional

from sqlalchemy import Float, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))  # e.g., "PS5 - Station 1"
    device_type: Mapped[str] = mapped_column(
        String(20)
    )  # playstation | pc | billiards | ping_pong | xbox | custom
    status: Mapped[str] = mapped_column(
        String(20), default="available"
    )  # available | busy | maintenance
    hourly_rate_single: Mapped[float] = mapped_column(Float)
    hourly_rate_multi: Mapped[float] = mapped_column(Float)
    icon: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    sessions: Mapped[list["Session"]] = relationship(back_populates="device")  # noqa: F821
