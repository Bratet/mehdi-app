from pydantic import BaseModel, ConfigDict


class StartSessionRequest(BaseModel):
    device_id: str
    mode: str = "solo"
    customer_id: str | None = None


class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    device_id: str
    customer_id: str | None = None
    status: str
    started_at: str
    paused_at: str | None = None
    total_pause_duration: int
    ended_at: str | None = None
    notes: str | None = None


class TransferSessionRequest(BaseModel):
    target_device_id: str


class SwitchModeRequest(BaseModel):
    mode: str  # solo or multiplayer
