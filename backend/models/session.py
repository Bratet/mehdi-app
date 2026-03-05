from datetime import datetime
from typing import Optional

from sqlalchemy import Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    device_id: Mapped[int] = mapped_column(ForeignKey("devices.id"))
    mode: Mapped[str] = mapped_column(String(20))  # single | multiplayer
    start_time: Mapped[datetime] = mapped_column()
    planned_duration_minutes: Mapped[int] = mapped_column(Integer)
    extended_minutes: Mapped[int] = mapped_column(Integer, default=0)
    single_minutes_used: Mapped[float] = mapped_column(Float, default=0)
    multi_minutes_used: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[str] = mapped_column(
        String(20)
    )  # active | completed | cancelled
    total_cost: Mapped[float] = mapped_column(Float, default=0)
    payment_method: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True
    )  # cash | digital
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    device: Mapped["Device"] = relationship(back_populates="sessions")  # noqa: F821
    session_products: Mapped[list["SessionProduct"]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )


class SessionProduct(Base):
    __tablename__ = "session_products"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("sessions.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    quantity: Mapped[int] = mapped_column(Integer)
    price_at_time: Mapped[float] = mapped_column(Float)  # snapshot of price when added

    session: Mapped["Session"] = relationship(back_populates="session_products")
    product: Mapped["Product"] = relationship(back_populates="session_products")  # noqa: F821

    @property
    def product_name(self) -> str:
        return self.product.name if self.product else ""
