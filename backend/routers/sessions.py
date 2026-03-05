from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models.device import Device
from models.product import Product
from models.session import Session, SessionProduct
from models.user import User
from schemas.invoice import InvoiceResponse
from schemas.session import (
    SessionAddProduct,
    SessionCreate,
    SessionExtend,
    SessionResponse,
    SessionTransfer,
)
from services.auth_service import get_current_user
from services.session_service import end_session

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("/", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def start_session(
    body: SessionCreate,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    # Check device exists and is available
    result = await db.execute(select(Device).where(Device.id == body.device_id))
    device = result.scalar_one_or_none()
    if device is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    if device.status != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Device is not available",
        )

    session = Session(
        device_id=body.device_id,
        mode=body.mode,
        start_time=datetime.utcnow(),
        planned_duration_minutes=body.planned_duration_minutes,
        extended_minutes=0,
        single_minutes_used=0,
        multi_minutes_used=0,
        status="active",
        total_cost=0,
    )
    db.add(session)

    # Set device status to busy
    device.status = "busy"

    await db.commit()
    await db.refresh(session)
    return session


@router.get("/", response_model=list[SessionResponse])
async def list_sessions(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    query = select(Session).options(
        selectinload(Session.session_products).selectinload(SessionProduct.product),
        selectinload(Session.device),
    )

    if status_filter is None or status_filter == "active":
        query = query.where(Session.status == "active")
    elif status_filter != "all":
        query = query.where(Session.status == status_filter)

    query = query.order_by(Session.start_time.desc())
    result = await db.execute(query)
    sessions = result.scalars().all()
    return sessions


@router.get("/{id}", response_model=SessionResponse)
async def get_session(
    id: int,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Session)
        .options(
            selectinload(Session.session_products).selectinload(SessionProduct.product),
            selectinload(Session.device),
        )
        .where(Session.id == id)
    )
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session


@router.post("/{id}/extend", response_model=SessionResponse)
async def extend_session(
    id: int,
    body: SessionExtend,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    result = await db.execute(select(Session).where(Session.id == id))
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not active",
        )

    session.planned_duration_minutes += body.additional_minutes
    session.extended_minutes += body.additional_minutes

    await db.commit()
    await db.refresh(session)
    return session


@router.post("/{id}/add-product", response_model=SessionResponse)
async def add_product_to_session(
    id: int,
    body: SessionAddProduct,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    result = await db.execute(select(Session).where(Session.id == id))
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not active",
        )

    # Get product and snapshot price
    product_result = await db.execute(select(Product).where(Product.id == body.product_id))
    product = product_result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    session_product = SessionProduct(
        session_id=id,
        product_id=body.product_id,
        quantity=body.quantity,
        price_at_time=product.price,
    )
    db.add(session_product)
    await db.commit()

    # Reload session with products
    result = await db.execute(
        select(Session)
        .options(
            selectinload(Session.session_products).selectinload(SessionProduct.product),
            selectinload(Session.device),
        )
        .where(Session.id == id)
    )
    session = result.scalar_one()
    return session


@router.post("/{id}/transfer", response_model=SessionResponse)
async def transfer_session(
    id: int,
    body: SessionTransfer,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    result = await db.execute(select(Session).where(Session.id == id))
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not active",
        )

    # Check target device is available
    target_result = await db.execute(
        select(Device).where(Device.id == body.target_device_id)
    )
    target_device = target_result.scalar_one_or_none()
    if target_device is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target device not found")
    if target_device.status != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target device is not available",
        )

    # Update device statuses
    old_device_result = await db.execute(
        select(Device).where(Device.id == session.device_id)
    )
    old_device = old_device_result.scalar_one()
    old_device.status = "available"
    target_device.status = "busy"

    # Transfer session
    session.device_id = body.target_device_id

    await db.commit()
    await db.refresh(session)
    return session


@router.post("/{id}/switch-mode", response_model=SessionResponse)
async def switch_mode(
    id: int,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    result = await db.execute(select(Session).where(Session.id == id))
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not active",
        )

    # Calculate minutes in current mode since start or last switch
    now = datetime.utcnow()
    elapsed = (now - session.start_time).total_seconds() / 60

    if session.mode == "single":
        session.single_minutes_used = elapsed - session.multi_minutes_used
    else:
        session.multi_minutes_used = elapsed - session.single_minutes_used

    # Flip the mode
    session.mode = "multiplayer" if session.mode == "single" else "single"

    await db.commit()
    await db.refresh(session)
    return session


@router.post("/{id}/end", response_model=InvoiceResponse)
async def end_session_endpoint(
    id: int,
    body: dict,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    payment_method = body.get("payment_method", "cash")

    # Verify session exists and is active
    result = await db.execute(select(Session).where(Session.id == id))
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not active",
        )

    try:
        invoice = await end_session(id, payment_method, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    return invoice
