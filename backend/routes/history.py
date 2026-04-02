from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db, ScanRecord
from models.schemas import URLAnalysis
from typing import List
from pydantic import BaseModel
import json
from datetime import datetime

router = APIRouter()

class HistorySummary(BaseModel):
    id: int
    target: str
    source: str
    timestamp: datetime
    risk: str
    score: float
    result: str
    
    class Config:
        orm_mode = True
        from_attributes = True # for pydantic v2
        
class HistoryDetail(HistorySummary):
    tactics: dict
    explanation: str
    urls: List[URLAnalysis] = []

@router.get("/history", response_model=List[HistorySummary], summary="Get all past scans")
def get_history(db: Session = Depends(get_db)):
    records = db.query(ScanRecord).order_by(ScanRecord.timestamp.desc()).all()
    return records

@router.get("/history/{scan_id}", response_model=HistoryDetail, summary="Get scan details by ID")
def get_scan_by_id(scan_id: int, db: Session = Depends(get_db)):
    record = db.query(ScanRecord).filter(ScanRecord.id == scan_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    tactics = {}
    try:
        tactics = json.loads(record.tactics) if record.tactics else {}
    except:
        pass
        
    urls = []
    try:
        urls = json.loads(record.urls) if record.urls else []
    except:
        pass
        
    return HistoryDetail(
        id=record.id,
        target=record.target,
        source=record.source,
        timestamp=record.timestamp,
        risk=record.risk,
        score=record.score,
        result=record.result,
        tactics=tactics,
        explanation=record.explanation,
        urls=urls
    )
