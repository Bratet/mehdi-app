from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import ContactMessage
from app.schemas import ContactCreate, ContactResponse, SuccessResponse
from typing import List

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("/", response_model=SuccessResponse)
async def create_contact(payload: ContactCreate, db: AsyncSession = Depends(get_db)):
    msg = ContactMessage(**payload.model_dump())
    db.add(msg)
    await db.commit()
    return SuccessResponse(success=True, message="Message sent successfully!")


@router.get("/", response_model=List[ContactResponse])
async def list_contacts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ContactMessage).order_by(ContactMessage.created_at.desc())
    )
    return result.scalars().all()
