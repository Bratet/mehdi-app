from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.booking import Booking, BookingStatus
from ..schemas.booking import BookingCreate, BookingResponse

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.get("", response_model=list[BookingResponse])
async def list_bookings(
    establishment_id: str | None = None,
    status: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Booking)
    eid = establishment_id or current_user.establishment_id
    if eid:
        query = query.where(Booking.establishment_id == eid)
    if status:
        query = query.where(Booking.status == status)
    result = await db.execute(query.order_by(Booking.date.desc(), Booking.start_time.desc()))
    return [BookingResponse.model_validate(b) for b in result.scalars().all()]


@router.post("", response_model=BookingResponse)
async def create_booking(
    data: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = Booking(**data.model_dump())
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    return BookingResponse.model_validate(booking)


@router.patch("/{booking_id}/confirm")
async def confirm_booking(booking_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = BookingStatus.confirmed
    await db.commit()
    return {"message": "Booking confirmed"}


@router.patch("/{booking_id}/cancel")
async def cancel_booking(booking_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = BookingStatus.cancelled
    await db.commit()
    return {"message": "Booking cancelled"}
