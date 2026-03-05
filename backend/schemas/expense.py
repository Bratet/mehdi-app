from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    notes: Optional[str] = None
    date: date


class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[date] = None


class ExpenseResponse(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    notes: Optional[str] = None
    date: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExpenseSummary(BaseModel):
    category: str
    total_amount: float
