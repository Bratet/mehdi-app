from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ..core.database import get_db
from ..core.security import get_current_user, require_roles
from ..models.user import User, Role
from ..models.establishment import Establishment, EstablishmentSettings
from ..schemas.establishment import (
    EstablishmentCreate, EstablishmentUpdate, EstablishmentResponse,
    EstablishmentSettingsUpdate, EstablishmentSettingsResponse
)

router = APIRouter(prefix="/establishments", tags=["Establishments"])


@router.get("", response_model=list[EstablishmentResponse])
async def list_establishments(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = select(Establishment)
    if current_user.role != Role.super_admin:
        query = query.where(Establishment.id == current_user.establishment_id)
    result = await db.execute(query.order_by(Establishment.created_at.desc()))
    return [EstablishmentResponse.model_validate(e) for e in result.scalars().all()]


@router.get("/{establishment_id}", response_model=EstablishmentResponse)
async def get_establishment(establishment_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Establishment).where(Establishment.id == establishment_id))
    est = result.scalar_one_or_none()
    if not est:
        raise HTTPException(status_code=404, detail="Establishment not found")
    return EstablishmentResponse.model_validate(est)


@router.post("", response_model=EstablishmentResponse)
async def create_establishment(
    data: EstablishmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin")),
):
    est = Establishment(**data.model_dump())
    db.add(est)
    await db.flush()

    # Create default settings
    settings = EstablishmentSettings(establishment_id=est.id)
    db.add(settings)
    await db.commit()
    await db.refresh(est)
    return EstablishmentResponse.model_validate(est)


@router.patch("/{establishment_id}", response_model=EstablishmentResponse)
async def update_establishment(
    establishment_id: str,
    data: EstablishmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "admin")),
):
    result = await db.execute(select(Establishment).where(Establishment.id == establishment_id))
    est = result.scalar_one_or_none()
    if not est:
        raise HTTPException(status_code=404, detail="Establishment not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(est, key, value)

    await db.commit()
    await db.refresh(est)
    return EstablishmentResponse.model_validate(est)


@router.delete("/{establishment_id}")
async def delete_establishment(
    establishment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin")),
):
    result = await db.execute(select(Establishment).where(Establishment.id == establishment_id))
    est = result.scalar_one_or_none()
    if not est:
        raise HTTPException(status_code=404, detail="Establishment not found")
    est.is_active = False
    await db.commit()
    return {"message": "Establishment deactivated"}


@router.get("/{establishment_id}/settings", response_model=EstablishmentSettingsResponse)
async def get_settings(establishment_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(EstablishmentSettings).where(EstablishmentSettings.establishment_id == establishment_id)
    )
    settings = result.scalar_one_or_none()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return EstablishmentSettingsResponse.model_validate(settings)


@router.put("/{establishment_id}/settings", response_model=EstablishmentSettingsResponse)
async def update_settings(
    establishment_id: str,
    data: EstablishmentSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "admin")),
):
    result = await db.execute(
        select(EstablishmentSettings).where(EstablishmentSettings.establishment_id == establishment_id)
    )
    settings = result.scalar_one_or_none()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(settings, key, value)

    await db.commit()
    await db.refresh(settings)
    return EstablishmentSettingsResponse.model_validate(settings)
