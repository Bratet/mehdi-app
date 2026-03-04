from pydantic import BaseModel, ConfigDict


class DeviceTypeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    icon: str | None = None


class ZoneCreate(BaseModel):
    name: str
    description: str | None = None
    sort_order: int = 0


class ZoneResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    description: str | None = None
    sort_order: int


class DeviceCreate(BaseModel):
    device_type_id: str
    zone_id: str | None = None
    name: str
    ip_address: str | None = None
    notes: str | None = None


class DeviceUpdate(BaseModel):
    name: str | None = None
    zone_id: str | None = None
    ip_address: str | None = None
    notes: str | None = None
    status: str | None = None


class DeviceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    status: str
    device_type_id: str
    zone_id: str | None = None
    ip_address: str | None = None
    notes: str | None = None
    device_type: DeviceTypeResponse | None = None
    zone: ZoneResponse | None = None
