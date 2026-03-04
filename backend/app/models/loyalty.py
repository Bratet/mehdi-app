import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, DateTime, Numeric, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..core.database import Base
import enum


class LoyaltyTransactionType(str, enum.Enum):
    earn = "earn"
    redeem = "redeem"


class LoyaltyRewardType(str, enum.Enum):
    free_hours = "free_hours"
    free_product = "free_product"
    discount = "discount"


class LoyaltyTier(Base):
    __tablename__ = "loyalty_tiers"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String)
    min_points: Mapped[int] = mapped_column(Integer, default=0)
    multiplier: Mapped[float] = mapped_column(Numeric(5, 2), default=1)
    color: Mapped[str | None] = mapped_column(String, nullable=True)


class LoyaltyAccount(Base):
    __tablename__ = "loyalty_accounts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id: Mapped[str] = mapped_column(String, ForeignKey("customers.id"), unique=True)
    tier_id: Mapped[str] = mapped_column(String, ForeignKey("loyalty_tiers.id"))
    total_points: Mapped[int] = mapped_column(Integer, default=0)
    available_points: Mapped[int] = mapped_column(Integer, default=0)
    qr_code: Mapped[str] = mapped_column(String, unique=True)

    tier: Mapped["LoyaltyTier"] = relationship()


class LoyaltyTransaction(Base):
    __tablename__ = "loyalty_transactions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id: Mapped[str] = mapped_column(String, ForeignKey("loyalty_accounts.id"))
    type: Mapped[str] = mapped_column(SAEnum(LoyaltyTransactionType))
    points: Mapped[int] = mapped_column(Integer)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    reference_type: Mapped[str | None] = mapped_column(String, nullable=True)
    reference_id: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class LoyaltyReward(Base):
    __tablename__ = "loyalty_rewards"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    establishment_id: Mapped[str] = mapped_column(String, ForeignKey("establishments.id"))
    name: Mapped[str] = mapped_column(String)
    type: Mapped[str] = mapped_column(SAEnum(LoyaltyRewardType))
    points_cost: Mapped[int] = mapped_column(Integer)
    value: Mapped[float] = mapped_column(Numeric(10, 2))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
