from schemas.device import DeviceCreate, DeviceResponse, DeviceStatusUpdate, DeviceUpdate
from schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseSummary, ExpenseUpdate
from schemas.invoice import InvoiceItemResponse, InvoiceResponse
from schemas.product import ProductCreate, ProductResponse, ProductUpdate
from schemas.report import (
    DashboardSummary,
    DeviceUsage,
    ProductSales,
    RevenueData,
    SessionStats,
)
from schemas.session import (
    SessionAddProduct,
    SessionCreate,
    SessionExtend,
    SessionProductResponse,
    SessionResponse,
    SessionTransfer,
    SessionUpdate,
)
from schemas.user import LoginRequest, TokenResponse, UserCreate, UserResponse

__all__ = [
    # User
    "UserCreate",
    "UserResponse",
    "LoginRequest",
    "TokenResponse",
    # Device
    "DeviceCreate",
    "DeviceUpdate",
    "DeviceResponse",
    "DeviceStatusUpdate",
    # Session
    "SessionCreate",
    "SessionUpdate",
    "SessionExtend",
    "SessionAddProduct",
    "SessionTransfer",
    "SessionResponse",
    "SessionProductResponse",
    # Product
    "ProductCreate",
    "ProductUpdate",
    "ProductResponse",
    # Invoice
    "InvoiceResponse",
    "InvoiceItemResponse",
    # Expense
    "ExpenseCreate",
    "ExpenseUpdate",
    "ExpenseResponse",
    "ExpenseSummary",
    # Reports
    "RevenueData",
    "SessionStats",
    "ProductSales",
    "DeviceUsage",
    "DashboardSummary",
]
