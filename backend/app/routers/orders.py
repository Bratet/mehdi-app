from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.order import Order, OrderItem, OrderStatus
from ..models.product import Product
from ..schemas.order import OrderCreate, OrderResponse

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse)
async def create_order(
    data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = Order(
        establishment_id=data.establishment_id,
        session_id=data.session_id,
        customer_id=data.customer_id,
        created_by=current_user.id,
    )
    db.add(order)
    await db.flush()

    subtotal = 0.0
    for item_data in data.items:
        product_result = await db.execute(select(Product).where(Product.id == item_data.product_id))
        product = product_result.scalar_one_or_none()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item_data.product_id} not found")

        item_total = float(product.price) * item_data.quantity
        item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=item_data.quantity,
            unit_price=product.price,
            total_price=item_total,
        )
        db.add(item)
        subtotal += item_total

        # Decrement stock
        product.stock_quantity -= item_data.quantity

    order.subtotal = subtotal
    order.total = subtotal
    order.status = OrderStatus.completed

    await db.commit()
    await db.refresh(order, ["items"])
    return OrderResponse.model_validate(order)


@router.get("", response_model=list[OrderResponse])
async def list_orders(
    establishment_id: str | None = None,
    session_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Order).options(selectinload(Order.items))
    eid = establishment_id or current_user.establishment_id
    if eid:
        query = query.where(Order.establishment_id == eid)
    if session_id:
        query = query.where(Order.session_id == session_id)
    result = await db.execute(query.order_by(Order.created_at.desc()))
    return [OrderResponse.model_validate(o) for o in result.scalars().all()]


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderResponse.model_validate(order)


@router.patch("/{order_id}/cancel")
async def cancel_order(order_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status == OrderStatus.cancelled:
        raise HTTPException(status_code=400, detail="Order already cancelled")

    # Restore stock
    for item in order.items:
        product_result = await db.execute(select(Product).where(Product.id == item.product_id))
        product = product_result.scalar_one_or_none()
        if product:
            product.stock_quantity += item.quantity

    order.status = OrderStatus.cancelled
    await db.commit()
    return {"message": "Order cancelled"}
