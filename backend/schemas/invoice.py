from datetime import datetime

from pydantic import BaseModel, ConfigDict


class InvoiceItemResponse(BaseModel):
    id: int
    invoice_id: int
    description: str
    quantity: int
    unit_price: float
    total_price: float

    model_config = ConfigDict(from_attributes=True)


class InvoiceResponse(BaseModel):
    id: int
    session_id: int
    device_name: str
    session_duration: str
    session_cost: float
    products_cost: float
    total_cost: float
    payment_method: str
    created_at: datetime
    items: list[InvoiceItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
