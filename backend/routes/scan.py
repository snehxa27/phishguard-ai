import json
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from sqlalchemy.orm import Session
from models.schemas import ScanRequest, ScanResponse, HighlightItem
from models.database import get_db, ScanRecord
from services.tactic_detector import detect_tactics
from services.ml_detector import ml_detect
from services.score_engine import calculate_final_score
from services.explanation_engine import generate_explanation
from services.highlight_detector import highlight_text
from services.file_parser import parse_file
from services.url_checker import analyze_urls

router = APIRouter()

def get_result_label(risk: str) -> str:
    if risk.lower() == "high": return "Phishing Attempt"
    if risk.lower() == "medium": return "Suspicious Content"
    return "Verified Safe"

@router.post("/scan", response_model=ScanResponse, summary="Scan text for phishing")
async def scan(request: ScanRequest, db: Session = Depends(get_db)) -> ScanResponse:
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")

    tactics: dict = detect_tactics(text)
    ml_score: float = ml_detect(text)
    
    url_results = analyze_urls(text)
    if url_results:
        url_max = max((u["risk_score"] for u in url_results), default=0)
        ml_score = max(ml_score, url_max)
        
    score_result: dict = calculate_final_score(tactics, ml_score)
    explanation: str = generate_explanation(text, tactics)
    
    raw_highlights: list = highlight_text(text)
    highlights = [HighlightItem(**h) for h in raw_highlights]

    # Save to database
    record = ScanRecord(
        target=text[:50] + ("..." if len(text) > 50 else ""),
        source="Direct text input",
        risk=score_result["risk"],
        score=score_result["score"],
        result=get_result_label(score_result["risk"]),
        tactics=json.dumps(tactics),
        explanation=explanation,
        urls=json.dumps(url_results) if url_results else None
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return ScanResponse(
        id=record.id,
        score=score_result["score"],
        risk=score_result["risk"],
        tactics=tactics,
        explanation=explanation,
        highlights=highlights,
        urls=url_results,
    )

@router.post("/upload", response_model=ScanResponse, summary="Upload and scan a file (.eml, .txt, .pdf)")
async def upload_and_scan(file: UploadFile = File(...), db: Session = Depends(get_db)) -> ScanResponse:
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        
    parsed = parse_file(file.filename or "unknown.txt", content)
    text = parsed.get("text", "").strip()
    
    if not text or text.startswith("Error parsing"):
        raise HTTPException(status_code=400, detail=f"Could not extract parseable text from file: {text}")

    tactics: dict = detect_tactics(text)
    ml_score: float = ml_detect(text)
    
    url_results = analyze_urls(text)
    if url_results:
        url_max = max((u["risk_score"] for u in url_results), default=0)
        ml_score = max(ml_score, url_max)
        
    score_result: dict = calculate_final_score(tactics, ml_score)
    explanation: str = generate_explanation(text, tactics)
    
    raw_highlights: list = highlight_text(text)
    highlights = [HighlightItem(**h) for h in raw_highlights]

    target_name = parsed.get("subject") or file.filename or "Unknown File"
    sender_name = parsed.get("sender") or "File Upload"

    record = ScanRecord(
        target=target_name,
        source=sender_name,
        risk=score_result["risk"],
        score=score_result["score"],
        result=get_result_label(score_result["risk"]),
        tactics=json.dumps(tactics),
        explanation=explanation,
        urls=json.dumps(url_results) if url_results else None
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return ScanResponse(
        id=record.id,
        score=score_result["score"],
        risk=score_result["risk"],
        tactics=tactics,
        explanation=explanation,
        highlights=highlights,
        extracted_text=text,
        subject=parsed.get("subject"),
        sender=parsed.get("sender"),
        urls=url_results,
    )
