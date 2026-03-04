from fastapi import APIRouter, Depends
from ..dependencies import get_current_user

router = APIRouter()


@router.get("/devices")
async def get_devices(user: dict = Depends(get_current_user)):
    return {"message": "Device analytics - to be implemented"}
