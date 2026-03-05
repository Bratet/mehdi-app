from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict

from schemas.device import DeviceResponse


class SessionProductResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    price_at_time: float

    model_config = ConfigDict(from_attributes=True)


class SessionCreate(BaseModel):
    device_id: int
    mode: Literal["single", "multiplayer"]
    planned_duration_minutes: int


class SessionUpdate(BaseModel):
    mode: Optional[Literal["single", "multiplayer"]] = None


class SessionExtend(BaseModel):
    additional_minutes: int


class SessionAddProduct(BaseModel):
    product_id: int
    quantity: int = 1


class SessionTransfer(BaseModel):
    target_device_id: int


class SessionResponse(BaseModel):
    id: int
    device_id: int
    mode: str
    start_time: datetime
    planned_duration_minutes: int
    extended_minutes: int
    single_minutes_used: float
    multi_minutes_used: float
    status: str
    total_cost: float
    payment_method: Optional[str] = None
    created_at: datetime
    device: Optional[DeviceResponse] = None
    session_products: list[SessionProductResponse] = []

    model_config = ConfigDict(from_attributes=True)
