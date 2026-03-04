from pydantic import BaseModel, ConfigDict


class InvoiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    invoice_number: str
    session_id: str | None = None
    order_id: str | None = None
    customer_id: str | None = None
    subtotal: float
    discount_type: str | None = None
    discount_value: float
    discount_amount: float
    vat_rate: float
    vat_amount: float
    total: float
    status: str
    created_at: str | None = None


class ApplyDiscountRequest(BaseModel):
    discount_type: str  # percentage or fixed
    discount_value: float
