from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models.invoice import Invoice
from models.user import User
from schemas.invoice import InvoiceResponse
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/billing", tags=["billing"])


@router.get("/invoices", response_model=list[InvoiceResponse])
async def list_invoices(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    query = select(Invoice).options(selectinload(Invoice.items)).order_by(Invoice.created_at.desc())

    if date_from is not None:
        from_date = datetime.combine(date.fromisoformat(date_from), datetime.min.time())
        query = query.where(Invoice.created_at >= from_date)

    if date_to is not None:
        to_date = datetime.combine(date.fromisoformat(date_to), datetime.max.time())
        query = query.where(Invoice.created_at <= to_date)

    result = await db.execute(query)
    invoices = result.scalars().all()
    return invoices


@router.get("/invoices/{id}", response_model=InvoiceResponse)
async def get_invoice(
    id: int,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Invoice).options(selectinload(Invoice.items)).where(Invoice.id == id)
    )
    invoice = result.scalar_one_or_none()
    if invoice is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return invoice
