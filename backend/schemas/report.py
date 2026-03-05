from pydantic import BaseModel


class RevenueData(BaseModel):
    date: str
    revenue: float


class SessionStats(BaseModel):
    date: str
    count: int


class ProductSales(BaseModel):
    product_name: str
    total_sold: int
    revenue: float


class DeviceUsage(BaseModel):
    device_name: str
    total_sessions: int
    total_hours: float


class DashboardSummary(BaseModel):
    today_revenue: float
    active_sessions: int
    total_sessions_today: int
    net_profit: float
