from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.expense import Expense, ExpenseCategory
from ..schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseCategoryResponse

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.get("/categories", response_model=list[ExpenseCategoryResponse])
async def list_expense_categories(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(ExpenseCategory).order_by(ExpenseCategory.name))
    return [ExpenseCategoryResponse.model_validate(c) for c in result.scalars().all()]


@router.get("", response_model=list[ExpenseResponse])
async def list_expenses(
    establishment_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Expense).options(selectinload(Expense.category))
    eid = establishment_id or current_user.establishment_id
    if eid:
        query = query.where(Expense.establishment_id == eid)
    result = await db.execute(query.order_by(Expense.date.desc()))
    return [ExpenseResponse.model_validate(e) for e in result.scalars().all()]


@router.post("", response_model=ExpenseResponse)
async def create_expense(
    data: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = Expense(**data.model_dump(), created_by=current_user.id)
    db.add(expense)
    await db.commit()
    await db.refresh(expense, ["category"])
    return ExpenseResponse.model_validate(expense)


@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Expense).where(Expense.id == expense_id))
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    await db.delete(expense)
    await db.commit()
    return {"message": "Expense deleted"}
