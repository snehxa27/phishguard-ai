# models/schemas.py — Pydantic Request & Response Models

from pydantic import BaseModel
from typing import Dict, List, Optional


class ScanRequest(BaseModel):
    text: str

    class Config:
        json_schema_extra = {
            "example": {
                "text": "URGENT: Your account has been suspended. Verify immediately to avoid permanent closure."
            }
        }


class HighlightItem(BaseModel):
    start: int
    end: int
    word: str
    type: str

class URLAnalysis(BaseModel):
    url: str
    risk_score: float
    status: str
    reason: str


class ScanResponse(BaseModel):
    id: Optional[int] = None
    score: float
    risk: str
    tactics: Dict[str, float]
    explanation: str
    highlights: List[HighlightItem]
    extracted_text: Optional[str] = None
    subject: Optional[str] = None
    sender: Optional[str] = None
    urls: List[URLAnalysis] = []

