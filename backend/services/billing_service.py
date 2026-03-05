from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.session import Session, SessionProduct
from models.device import Device
from models.invoice import Invoice, InvoiceItem


def format_duration(minutes: float) -> str:
    """Format a duration in minutes as a human-readable string, e.g. '1h 30m'."""
    total = int(round(minutes))
    if total < 1:
        return "0m"
    hours = total // 60
    mins = total % 60
    if hours and mins:
        return f"{hours}h {mins}m"
    if hours:
        return f"{hours}h"
    return f"{mins}m"


async def generate_invoice(session: Session, db: AsyncSession) -> Invoice:
    """Create an Invoice with InvoiceItems for the given completed session."""
    # Load device name
    result = await db.execute(select(Device).where(Device.id == session.device_id))
    device = result.scalar_one()

    # Build duration description
    parts = []
    if session.single_minutes_used > 0:
        parts.append(f"{format_duration(session.single_minutes_used)} single")
    if session.multi_minutes_used > 0:
        parts.append(f"{format_duration(session.multi_minutes_used)} multi")
    duration_str = ", ".join(parts) if parts else "0m"

    # Session cost
    session_cost = float(session.total_cost)

    # Calculate products cost
    products_cost = 0.0
    for sp in session.session_products:
        products_cost += sp.price_at_time * sp.quantity

    # Create invoice
    invoice = Invoice(
        session_id=session.id,
        device_name=device.name,
        session_duration=duration_str,
        session_cost=session_cost,
        products_cost=products_cost,
        total_cost=session_cost + products_cost,
        payment_method=session.payment_method or "cash",
    )
    db.add(invoice)
    await db.flush()  # get invoice.id

    # Invoice item for session time
    time_description = f"{device.name} ({duration_str})"
    time_item = InvoiceItem(
        invoice_id=invoice.id,
        description=time_description,
        quantity=1,
        unit_price=session_cost,
        total_price=session_cost,
    )
    db.add(time_item)

    # Invoice items for products
    for sp in session.session_products:
        product_item = InvoiceItem(
            invoice_id=invoice.id,
            description=sp.product.name,
            quantity=sp.quantity,
            unit_price=sp.price_at_time,
            total_price=sp.price_at_time * sp.quantity,
        )
        db.add(product_item)

    return invoice
