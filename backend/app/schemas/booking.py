from pydantic import BaseModel, ConfigDict


class BookingCreate(BaseModel):
    customer_id: str
    device_type_id: str
    device_id: str | None = None
    date: str
    start_time: str
    end_time: str
    mode: str = "solo"
    notes: str | None = None


class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    customer_id: str
    device_type_id: str
    device_id: str | None = None
    date: str
    start_time: str
    end_time: str
    mode: str
    status: str
    deposit_paid: bool
    deposit_amount: float
    notes: str | None = None
