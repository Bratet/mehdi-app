from pydantic import BaseModel, ConfigDict


class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int


class OrderCreate(BaseModel):
    session_id: str | None = None
    customer_id: str | None = None
    items: list[OrderItemCreate]


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    product_id: str
    quantity: int
    unit_price: float
    total_price: float


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    session_id: str | None = None
    customer_id: str | None = None
    status: str
    subtotal: float
    discount_amount: float
    vat_amount: float
    total: float
    items: list[OrderItemResponse] = []
