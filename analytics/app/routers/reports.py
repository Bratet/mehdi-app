from fastapi import APIRouter, Depends
from ..dependencies import get_current_user

router = APIRouter()


@router.post("/generate")
async def generate_report(user: dict = Depends(get_current_user)):
    return {"message": "Report generation - to be implemented"}


@router.get("/{report_id}/download")
async def download_report(report_id: str, user: dict = Depends(get_current_user)):
    return {"message": "Report download - to be implemented"}
