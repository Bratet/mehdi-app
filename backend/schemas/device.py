from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict


class DeviceCreate(BaseModel):
    name: str
    device_type: str
    hourly_rate_single: float
    hourly_rate_multi: float
    icon: Optional[str] = None


class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    device_type: Optional[str] = None
    hourly_rate_single: Optional[float] = None
    hourly_rate_multi: Optional[float] = None
    icon: Optional[str] = None


class DeviceResponse(BaseModel):
    id: int
    name: str
    device_type: str
    status: str
    hourly_rate_single: float
    hourly_rate_multi: float
    icon: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DeviceStatusUpdate(BaseModel):
    status: Literal["available", "busy", "maintenance"]
