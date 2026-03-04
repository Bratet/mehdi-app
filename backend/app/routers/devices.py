from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ..core.database import get_db
from ..core.security import get_current_user, require_roles
from ..models.user import User
from ..models.device import Device, DeviceType, Zone, DeviceStatus, MaintenanceLog
from ..schemas.device import DeviceCreate, DeviceUpdate, DeviceResponse, DeviceTypeResponse, ZoneCreate, ZoneResponse

router = APIRouter(prefix="/devices", tags=["Devices"])


@router.get("/types", response_model=list[DeviceTypeResponse])
async def list_device_types(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(DeviceType).order_by(DeviceType.name))
    return [DeviceTypeResponse.model_validate(dt) for dt in result.scalars().all()]


@router.get("/zones", response_model=list[ZoneResponse])
async def list_zones(
    establishment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Zone).where(Zone.establishment_id == establishment_id).order_by(Zone.sort_order)
    )
    return [ZoneResponse.model_validate(z) for z in result.scalars().all()]


@router.post("/zones", response_model=ZoneResponse)
async def create_zone(
    data: ZoneCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "admin")),
):
    zone = Zone(**data.model_dump())
    db.add(zone)
    await db.commit()
    await db.refresh(zone)
    return ZoneResponse.model_validate(zone)


@router.get("", response_model=list[DeviceResponse])
async def list_devices(
    establishment_id: str | None = None,
    status: str | None = None,
    device_type_id: str | None = None,
    zone_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Device).options(selectinload(Device.device_type), selectinload(Device.zone))

    eid = establishment_id or current_user.establishment_id
    if eid:
        query = query.where(Device.establishment_id == eid)
    if status:
        query = query.where(Device.status == status)
    if device_type_id:
        query = query.where(Device.device_type_id == device_type_id)
    if zone_id:
        query = query.where(Device.zone_id == zone_id)

    result = await db.execute(query.order_by(Device.name))
    return [DeviceResponse.model_validate(d) for d in result.scalars().all()]


@router.get("/{device_id}", response_model=DeviceResponse)
async def get_device(device_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Device).options(selectinload(Device.device_type), selectinload(Device.zone)).where(Device.id == device_id)
    )
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return DeviceResponse.model_validate(device)


@router.post("", response_model=DeviceResponse)
async def create_device(
    data: DeviceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "admin")),
):
    device = Device(**data.model_dump())
    db.add(device)
    await db.commit()
    await db.refresh(device, ["device_type", "zone"])
    return DeviceResponse.model_validate(device)


@router.patch("/{device_id}", response_model=DeviceResponse)
async def update_device(
    device_id: str,
    data: DeviceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "admin")),
):
    result = await db.execute(select(Device).where(Device.id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(device, key, value)

    await db.commit()
    await db.refresh(device, ["device_type", "zone"])
    return DeviceResponse.model_validate(device)


@router.patch("/{device_id}/status")
async def update_device_status(
    device_id: str,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Device).where(Device.id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    device.status = status
    await db.commit()
    return {"message": "Status updated", "status": status}


@router.delete("/{device_id}")
async def delete_device(
    device_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "admin")),
):
    result = await db.execute(select(Device).where(Device.id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    await db.delete(device)
    await db.commit()
    return {"message": "Device deleted"}
