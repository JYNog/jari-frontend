from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import os

from db import SessionLocal, Base, engine
from models import AppUser

app = FastAPI(title="자리 API (Supabase)")

origins = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/users/count")
def users_count(db: Session = Depends(get_db)):
    return {"count": db.query(AppUser).count()}


class SearchReq(BaseModel):
    q: Optional[str] = None
    categories: List[str]
    radius_m: int
    center_lat: float
    center_lon: float


class SearchResp(BaseModel):
    center: dict
    pois: list
    total_all: int


@app.post("/search", response_model=SearchResp)
def search(req: SearchReq):
    """
    업종별 주변 업체 검색. 현재는 예시 구현으로, 실제 데이터 대신
    요청한 좌표와 카테고리를 그대로 반환한다.
    q가 없어도 동작하도록 Optional[str]로 정의하였다.
    """
    return {
        "center": {"lat": req.center_lat, "lon": req.center_lon, "label": req.q or ""},
        "pois": [],
        "total_all": 0,
    }
