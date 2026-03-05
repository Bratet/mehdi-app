from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.device import Device
from models.session import Session
from models.user import User
from schemas.device import DeviceCreate, DeviceResponse, DeviceStatusUpdate, DeviceUpdate
from services.auth_service import get_current_user, require_admin

router = APIRouter(prefix="/api/devices", tags=["devices"])


@router.get("/", response_model=list[DeviceResponse])
async def list_devices(
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    result = await db.execute(select(Device).order_by(Device.name))
    devices = result.scalars().all()
    return devices


@router.post("/", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
async def create_device(
    body: DeviceCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    device = Device(**body.model_dump())
    db.add(device)
    await db.commit()
    await db.refresh(device)
    return device


@router.put("/{id}", response_model=DeviceResponse)
async def update_device(
    id: int,
    body: DeviceUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(Device).where(Device.id == id))
    device = result.scalar_one_or_none()
    if device is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(device, key, value)

    await db.commit()
    await db.refresh(device)
    return device


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device(
    id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(Device).where(Device.id == id))
    device = result.scalar_one_or_none()
    if device is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    # Check for active sessions
    active_result = await db.execute(
        select(Session).where(Session.device_id == id, Session.status == "active")
    )
    if active_result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete device with active sessions",
        )

    await db.delete(device)
    await db.commit()


@router.patch("/{id}/status", response_model=DeviceResponse)
async def update_device_status(
    id: int,
    body: DeviceStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    result = await db.execute(select(Device).where(Device.id == id))
    device = result.scalar_one_or_none()
    if device is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    device.status = body.status
    await db.commit()
    await db.refresh(device)
    return device
