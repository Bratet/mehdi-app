from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.expense import Expense
from models.user import User
from schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseSummary, ExpenseUpdate
from services.auth_service import get_current_user, require_admin

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


@router.get("/summary", response_model=list[ExpenseSummary])
async def expense_summary(
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Expense.category, func.sum(Expense.amount).label("total_amount"))
        .group_by(Expense.category)
        .order_by(func.sum(Expense.amount).desc())
    )
    rows = result.all()
    return [ExpenseSummary(category=row.category, total_amount=row.total_amount) for row in rows]


@router.get("/", response_model=list[ExpenseResponse])
async def list_expenses(
    category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    query = select(Expense)
    if category is not None:
        query = query.where(Expense.category == category)
    query = query.order_by(Expense.date.desc())

    result = await db.execute(query)
    expenses = result.scalars().all()
    return expenses


@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(
    body: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    expense = Expense(**body.model_dump())
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    return expense


@router.put("/{id}", response_model=ExpenseResponse)
async def update_expense(
    id: int,
    body: ExpenseUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(Expense).where(Expense.id == id))
    expense = result.scalar_one_or_none()
    if expense is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(expense, key, value)

    await db.commit()
    await db.refresh(expense)
    return expense


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(Expense).where(Expense.id == id))
    expense = result.scalar_one_or_none()
    if expense is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

    await db.delete(expense)
    await db.commit()
