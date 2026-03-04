from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.notification import Notification
from ..schemas.notification import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Notification).where(
        (Notification.user_id == current_user.id) | (Notification.user_id.is_(None))
    )
    if current_user.establishment_id:
        query = query.where(Notification.establishment_id == current_user.establishment_id)
    result = await db.execute(query.order_by(Notification.created_at.desc()).limit(50))
    return [NotificationResponse.model_validate(n) for n in result.scalars().all()]


@router.get("/unread-count")
async def unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(func.count(Notification.id)).where(
        Notification.is_read == False,
        (Notification.user_id == current_user.id) | (Notification.user_id.is_(None)),
    )
    if current_user.establishment_id:
        query = query.where(Notification.establishment_id == current_user.establishment_id)
    result = await db.execute(query)
    return {"count": result.scalar()}


@router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Notification).where(Notification.id == notification_id))
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    await db.commit()
    return {"message": "Marked as read"}


@router.patch("/read-all")
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        update(Notification)
        .where(
            Notification.is_read == False,
            (Notification.user_id == current_user.id) | (Notification.user_id.is_(None)),
        )
        .values(is_read=True)
    )
    if current_user.establishment_id:
        query = query.where(Notification.establishment_id == current_user.establishment_id)
    await db.execute(query)
    await db.commit()
    return {"message": "All marked as read"}
