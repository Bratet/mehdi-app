from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.session import Session, SessionSegment, SessionStatus, SessionMode
from ..models.device import Device, DeviceStatus
from ..models.establishment import EstablishmentSettings
from ..schemas.session import StartSessionRequest, SessionResponse, TransferSessionRequest, SwitchModeRequest

router = APIRouter(prefix="/sessions", tags=["Sessions"])


async def _get_rates(db: AsyncSession, establishment_id: str):
    result = await db.execute(
        select(EstablishmentSettings).where(EstablishmentSettings.establishment_id == establishment_id)
    )
    settings = result.scalar_one_or_none()
    if not settings:
        return 20.0, 30.0
    return float(settings.solo_rate_per_hour), float(settings.multiplayer_rate_per_hour)


@router.post("/start", response_model=SessionResponse)
async def start_session(
    data: StartSessionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check device exists and is available
    result = await db.execute(select(Device).where(Device.id == data.device_id))
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    if device.status != DeviceStatus.available:
        raise HTTPException(status_code=400, detail="Device is not available")

    # Get rates
    solo_rate, multi_rate = await _get_rates(db, device.establishment_id)
    mode = data.mode or "solo"
    rate = solo_rate if mode == "solo" else multi_rate

    now = datetime.now(timezone.utc)

    # Create session
    session = Session(
        establishment_id=device.establishment_id,
        device_id=device.id,
        customer_id=data.customer_id,
        started_by=current_user.id,
        status=SessionStatus.active,
        started_at=now,
    )
    db.add(session)
    await db.flush()

    # Create first segment
    segment = SessionSegment(
        session_id=session.id,
        mode=mode,
        rate_per_hour=rate,
        started_at=now,
    )
    db.add(segment)

    # Mark device as occupied
    device.status = DeviceStatus.occupied

    await db.commit()
    await db.refresh(session, ["segments", "device"])
    return SessionResponse.model_validate(session)


@router.post("/{session_id}/pause")
async def pause_session(session_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session or session.status != SessionStatus.active:
        raise HTTPException(status_code=400, detail="Session not active")

    session.status = SessionStatus.paused
    session.paused_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": "Session paused"}


@router.post("/{session_id}/resume")
async def resume_session(session_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session or session.status != SessionStatus.paused:
        raise HTTPException(status_code=400, detail="Session not paused")

    if session.paused_at:
        pause_duration = int((datetime.now(timezone.utc) - session.paused_at).total_seconds())
        session.total_pause_duration += pause_duration

    session.status = SessionStatus.active
    session.paused_at = None
    await db.commit()
    return {"message": "Session resumed"}


@router.post("/{session_id}/stop", response_model=SessionResponse)
async def stop_session(session_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Session).options(selectinload(Session.segments)).where(Session.id == session_id)
    )
    session = result.scalar_one_or_none()
    if not session or session.status in [SessionStatus.completed, SessionStatus.auto_closed]:
        raise HTTPException(status_code=400, detail="Session already ended")

    now = datetime.now(timezone.utc)
    session.status = SessionStatus.completed
    session.ended_at = now

    # Close the last open segment
    for seg in session.segments:
        if seg.ended_at is None:
            seg.ended_at = now
            seg.duration_seconds = int((now - seg.started_at).total_seconds())
            seg.cost = round(float(seg.rate_per_hour) * seg.duration_seconds / 3600, 2)

    # Free device
    dev_result = await db.execute(select(Device).where(Device.id == session.device_id))
    device = dev_result.scalar_one_or_none()
    if device:
        device.status = DeviceStatus.available

    await db.commit()
    await db.refresh(session, ["segments", "device"])
    return SessionResponse.model_validate(session)


@router.post("/{session_id}/transfer")
async def transfer_session(
    session_id: str,
    data: TransferSessionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session or session.status not in [SessionStatus.active, SessionStatus.paused]:
        raise HTTPException(status_code=400, detail="Session not active or paused")

    # Check target device
    target = await db.execute(select(Device).where(Device.id == data.target_device_id))
    target_device = target.scalar_one_or_none()
    if not target_device or target_device.status != DeviceStatus.available:
        raise HTTPException(status_code=400, detail="Target device not available")

    # Free old device
    old_device = await db.execute(select(Device).where(Device.id == session.device_id))
    old = old_device.scalar_one_or_none()
    if old:
        old.status = DeviceStatus.available

    # Move session
    session.device_id = target_device.id
    target_device.status = DeviceStatus.occupied

    await db.commit()
    return {"message": "Session transferred"}


@router.patch("/{session_id}/mode")
async def switch_mode(
    session_id: str,
    data: SwitchModeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Session).options(selectinload(Session.segments)).where(Session.id == session_id)
    )
    session = result.scalar_one_or_none()
    if not session or session.status != SessionStatus.active:
        raise HTTPException(status_code=400, detail="Session not active")

    now = datetime.now(timezone.utc)
    solo_rate, multi_rate = await _get_rates(db, session.establishment_id)

    # Close current segment
    for seg in session.segments:
        if seg.ended_at is None:
            seg.ended_at = now
            seg.duration_seconds = int((now - seg.started_at).total_seconds())
            seg.cost = round(float(seg.rate_per_hour) * seg.duration_seconds / 3600, 2)

    # Start new segment
    new_rate = solo_rate if data.mode == "solo" else multi_rate
    new_seg = SessionSegment(
        session_id=session.id,
        mode=data.mode,
        rate_per_hour=new_rate,
        started_at=now,
    )
    db.add(new_seg)
    await db.commit()
    return {"message": f"Mode switched to {data.mode}"}


@router.get("", response_model=list[SessionResponse])
async def list_sessions(
    establishment_id: str | None = None,
    status: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Session).options(selectinload(Session.segments), selectinload(Session.device))
    eid = establishment_id or current_user.establishment_id
    if eid:
        query = query.where(Session.establishment_id == eid)
    if status:
        query = query.where(Session.status == status)
    result = await db.execute(query.order_by(Session.started_at.desc()))
    return [SessionResponse.model_validate(s) for s in result.scalars().all()]


@router.get("/active", response_model=list[SessionResponse])
async def list_active_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Session)
        .options(selectinload(Session.segments), selectinload(Session.device))
        .where(Session.status.in_([SessionStatus.active, SessionStatus.paused]))
    )
    if current_user.establishment_id:
        query = query.where(Session.establishment_id == current_user.establishment_id)
    result = await db.execute(query.order_by(Session.started_at.desc()))
    return [SessionResponse.model_validate(s) for s in result.scalars().all()]


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Session).options(selectinload(Session.segments), selectinload(Session.device)).where(Session.id == session_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionResponse.model_validate(session)
