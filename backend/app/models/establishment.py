import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Numeric, Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..core.database import Base


class Establishment(Base):
    __tablename__ = "establishments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    settings: Mapped["EstablishmentSettings | None"] = relationship(back_populates="establishment", uselist=False)


class EstablishmentSettings(Base):
    __tablename__ = "establishment_settings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    establishment_id: Mapped[str] = mapped_column(String, ForeignKey("establishments.id"), unique=True)
    currency: Mapped[str] = mapped_column(String, default="MAD")
    vat_rate: Mapped[float] = mapped_column(Numeric(5, 2), default=20)
    opening_time: Mapped[str] = mapped_column(String, default="09:00")
    closing_time: Mapped[str] = mapped_column(String, default="00:00")
    pause_limit_minutes: Mapped[int] = mapped_column(Integer, default=30)
    alert_intervals: Mapped[dict] = mapped_column(JSON, default=[30, 15, 5])
    solo_rate_per_hour: Mapped[float] = mapped_column(Numeric(10, 2), default=20)
    multiplayer_rate_per_hour: Mapped[float] = mapped_column(Numeric(10, 2), default=30)
    booking_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    booking_deposit_required: Mapped[bool] = mapped_column(Boolean, default=False)
    booking_deposit_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    loyalty_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    loyalty_points_per_currency: Mapped[float] = mapped_column(Numeric(10, 2), default=1)

    establishment: Mapped["Establishment"] = relationship(back_populates="settings")
