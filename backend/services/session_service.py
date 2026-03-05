from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.session import Session, SessionProduct
from models.device import Device
from models.invoice import Invoice, InvoiceItem
from models.product import Product


async def calculate_session_cost(session: Session, db: AsyncSession) -> float:
    """Calculate the total cost of a session based on time usage and device rates."""
    result = await db.execute(select(Device).where(Device.id == session.device_id))
    device = result.scalar_one()

    single_cost = session.single_minutes_used * device.hourly_rate_single / 60
    multi_cost = session.multi_minutes_used * device.hourly_rate_multi / 60

    return round(single_cost + multi_cost, 2)


async def update_session_time_tracking(session: Session, db: AsyncSession) -> None:
    """Update single_minutes_used or multi_minutes_used based on elapsed time since start."""
    now = datetime.utcnow()
    elapsed_minutes = (now - session.start_time).total_seconds() / 60

    # Distribute remaining time to current mode
    if session.mode == "single":
        session.single_minutes_used = round(elapsed_minutes - session.multi_minutes_used, 2)
    else:
        session.multi_minutes_used = round(elapsed_minutes - session.single_minutes_used, 2)


async def end_session(
    session_id: int,
    payment_method: str,
    db: AsyncSession,
) -> Invoice:
    """End a session: update time tracking, calculate cost, generate invoice."""
    # Load session with products
    result = await db.execute(
        select(Session)
        .options(selectinload(Session.session_products).selectinload(SessionProduct.product))
        .where(Session.id == session_id)
    )
    session = result.scalar_one_or_none()
    if session is None:
        raise ValueError(f"Session {session_id} not found")

    # Update time tracking
    await update_session_time_tracking(session, db)

    # Calculate cost
    session_cost = await calculate_session_cost(session, db)
    products_cost = sum(sp.price_at_time * sp.quantity for sp in session.session_products)
    session.total_cost = session_cost + products_cost
    session.status = "completed"
    session.payment_method = payment_method

    # Set device back to available
    result = await db.execute(select(Device).where(Device.id == session.device_id))
    device = result.scalar_one()
    device.status = "available"

    # Generate invoice
    from services.billing_service import generate_invoice

    invoice = await generate_invoice(session, db)

    await db.commit()

    # Reload invoice with items for response
    from sqlalchemy.orm import selectinload as _selectinload
    result = await db.execute(
        select(Invoice).options(_selectinload(Invoice.items)).where(Invoice.id == invoice.id)
    )
    return result.scalar_one()
