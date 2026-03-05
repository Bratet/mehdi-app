from datetime import datetime, timedelta, date

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from models.session import Session, SessionProduct
from models.device import Device
from models.product import Product
from models.expense import Expense


def _period_start(period: str) -> date:
    """Return the start date for a given period filter."""
    today = date.today()
    if period == "daily":
        return today - timedelta(days=30)
    elif period == "weekly":
        return today - timedelta(weeks=12)
    elif period == "monthly":
        return today - timedelta(days=365)
    return today - timedelta(days=30)


async def get_revenue_data(db: AsyncSession, period: str) -> list[dict]:
    """Get revenue grouped by date for completed sessions."""
    start = _period_start(period)

    stmt = (
        select(
            func.date(Session.created_at).label("date"),
            func.sum(Session.total_cost).label("revenue"),
        )
        .where(
            and_(
                Session.status == "completed",
                func.date(Session.created_at) >= str(start),
            )
        )
        .group_by(func.date(Session.created_at))
        .order_by(func.date(Session.created_at))
    )

    result = await db.execute(stmt)
    rows = result.all()
    return [{"date": str(row.date), "revenue": float(row.revenue or 0)} for row in rows]


async def get_session_stats(db: AsyncSession, period: str) -> list[dict]:
    """Get session count grouped by date."""
    start = _period_start(period)

    stmt = (
        select(
            func.date(Session.created_at).label("date"),
            func.count(Session.id).label("count"),
        )
        .where(func.date(Session.created_at) >= str(start))
        .group_by(func.date(Session.created_at))
        .order_by(func.date(Session.created_at))
    )

    result = await db.execute(stmt)
    rows = result.all()
    return [{"date": str(row.date), "count": int(row.count)} for row in rows]


async def get_best_selling_products(db: AsyncSession, limit: int = 10) -> list[dict]:
    """Get top-selling products by total quantity sold."""
    stmt = (
        select(
            Product.name.label("product_name"),
            func.sum(SessionProduct.quantity).label("total_sold"),
            func.sum(SessionProduct.price_at_time * SessionProduct.quantity).label("revenue"),
        )
        .join(Product, SessionProduct.product_id == Product.id)
        .group_by(Product.name)
        .order_by(func.sum(SessionProduct.quantity).desc())
        .limit(limit)
    )

    result = await db.execute(stmt)
    rows = result.all()
    return [
        {
            "product_name": row.product_name,
            "total_sold": int(row.total_sold),
            "revenue": float(row.revenue or 0),
        }
        for row in rows
    ]


async def get_most_used_devices(db: AsyncSession, limit: int = 10) -> list[dict]:
    """Get devices ranked by number of sessions and total hours."""
    stmt = (
        select(
            Device.name.label("device_name"),
            func.count(Session.id).label("total_sessions"),
            func.sum(Session.single_minutes_used + Session.multi_minutes_used).label("total_minutes"),
        )
        .join(Session, Session.device_id == Device.id)
        .group_by(Device.name)
        .order_by(func.count(Session.id).desc())
        .limit(limit)
    )

    result = await db.execute(stmt)
    rows = result.all()
    return [
        {
            "device_name": row.device_name,
            "total_sessions": int(row.total_sessions),
            "total_hours": round(float(row.total_minutes or 0) / 60, 1),
        }
        for row in rows
    ]


async def get_dashboard_summary(db: AsyncSession) -> dict:
    """Get summary stats for today: revenue, active sessions, total sessions, net profit."""
    today = str(date.today())

    # Today's revenue from completed sessions
    revenue_stmt = select(func.sum(Session.total_cost)).where(
        and_(
            Session.status == "completed",
            func.date(Session.created_at) == today,
        )
    )
    revenue_result = await db.execute(revenue_stmt)
    today_revenue = float(revenue_result.scalar() or 0)

    # Active sessions count
    active_stmt = select(func.count(Session.id)).where(Session.status == "active")
    active_result = await db.execute(active_stmt)
    active_sessions = int(active_result.scalar() or 0)

    # Total sessions today
    total_stmt = select(func.count(Session.id)).where(
        func.date(Session.created_at) == today
    )
    total_result = await db.execute(total_stmt)
    total_sessions_today = int(total_result.scalar() or 0)

    # Today's expenses
    expense_stmt = select(func.sum(Expense.amount)).where(
        func.date(Expense.date) == today
    )
    expense_result = await db.execute(expense_stmt)
    today_expenses = float(expense_result.scalar() or 0)

    net_profit = round(today_revenue - today_expenses, 2)

    return {
        "today_revenue": today_revenue,
        "active_sessions": active_sessions,
        "total_sessions_today": total_sessions_today,
        "net_profit": net_profit,
    }
