from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.user import User
from schemas.report import DashboardSummary, DeviceUsage, ProductSales, RevenueData, SessionStats
from services.auth_service import get_current_user
from services.report_service import (
    get_best_selling_products,
    get_dashboard_summary,
    get_most_used_devices,
    get_revenue_data,
    get_session_stats,
)

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/revenue", response_model=list[RevenueData])
async def revenue_report(
    period: str = Query("daily"),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    data = await get_revenue_data(db, period)
    return data


@router.get("/sessions", response_model=list[SessionStats])
async def sessions_report(
    period: str = Query("daily"),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    data = await get_session_stats(db, period)
    return data


@router.get("/products/best-selling", response_model=list[ProductSales])
async def best_selling_products(
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    data = await get_best_selling_products(db)
    return data


@router.get("/devices/most-used", response_model=list[DeviceUsage])
async def most_used_devices(
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    data = await get_most_used_devices(db)
    return data


@router.get("/summary", response_model=DashboardSummary)
async def dashboard_summary(
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    data = await get_dashboard_summary(db)
    return data
