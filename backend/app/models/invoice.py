import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Numeric, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from ..core.database import Base
import enum


class InvoiceStatus(str, enum.Enum):
    draft = "draft"
    issued = "issued"
    paid = "paid"
    partial = "partial"
    cancelled = "cancelled"


class DiscountType(str, enum.Enum):
    percentage = "percentage"
    fixed = "fixed"


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    establishment_id: Mapped[str] = mapped_column(String, ForeignKey("establishments.id"))
    invoice_number: Mapped[str] = mapped_column(String, unique=True)
    session_id: Mapped[str | None] = mapped_column(String, ForeignKey("sessions.id"), nullable=True)
    order_id: Mapped[str | None] = mapped_column(String, ForeignKey("orders.id"), nullable=True)
    customer_id: Mapped[str | None] = mapped_column(String, ForeignKey("customers.id"), nullable=True)
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    discount_type: Mapped[str | None] = mapped_column(SAEnum(DiscountType), nullable=True)
    discount_value: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    discount_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    vat_rate: Mapped[float] = mapped_column(Numeric(5, 2), default=20)
    vat_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    total: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    amount_paid: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    status: Mapped[str] = mapped_column(SAEnum(InvoiceStatus), default=InvoiceStatus.draft)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
