from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import NewsletterSubscriber
from app.schemas import NewsletterCreate, SuccessResponse

router = APIRouter(prefix="/newsletter", tags=["newsletter"])


@router.post("/subscribe", response_model=SuccessResponse)
async def subscribe(payload: NewsletterCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(NewsletterSubscriber).where(NewsletterSubscriber.email == payload.email)
    )
    sub = existing.scalar_one_or_none()
    if sub:
        if sub.is_active:
            raise HTTPException(status_code=409, detail="Email already subscribed.")
        sub.is_active = True
        await db.commit()
        return SuccessResponse(success=True, message="Re-subscribed successfully!")

    new_sub = NewsletterSubscriber(email=payload.email)
    db.add(new_sub)
    await db.commit()
    return SuccessResponse(success=True, message="Subscribed successfully!")


@router.post("/unsubscribe", response_model=SuccessResponse)
async def unsubscribe(payload: NewsletterCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(NewsletterSubscriber).where(NewsletterSubscriber.email == payload.email)
    )
    sub = result.scalar_one_or_none()
    if not sub or not sub.is_active:
        raise HTTPException(status_code=404, detail="Subscription not found.")
    sub.is_active = False
    await db.commit()
    return SuccessResponse(success=True, message="Unsubscribed successfully!")
