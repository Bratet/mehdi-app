import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..core.database import Base


class ExpenseCategory(Base):
    __tablename__ = "expense_categories"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String)
    icon: Mapped[str | None] = mapped_column(String, nullable=True)


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    establishment_id: Mapped[str] = mapped_column(String, ForeignKey("establishments.id"))
    category_id: Mapped[str] = mapped_column(String, ForeignKey("expense_categories.id"))
    amount: Mapped[float] = mapped_column(Numeric(10, 2))
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    receipt_url: Mapped[str | None] = mapped_column(String, nullable=True)
    date: Mapped[str] = mapped_column(String)
    created_by: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    category: Mapped["ExpenseCategory"] = relationship()
