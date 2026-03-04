from fastapi import APIRouter, Depends
from ..dependencies import get_current_user

router = APIRouter()


@router.get("/sessions")
async def get_sessions(user: dict = Depends(get_current_user)):
    return {"message": "Session analytics - to be implemented"}
