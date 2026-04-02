# 🛡️ PhishGuard AI — Backend

A modular FastAPI backend for real-time phishing detection using rule-based NLP + ML.

## 📁 Project Structure

```
phishguard/
├── main.py                         # FastAPI app entry point
├── requirements.txt
├── models/
│   ├── __init__.py
│   └── schemas.py                  # Pydantic request/response models
├── routes/
│   ├── __init__.py
│   └── scan.py                     # POST /api/scan endpoint
└── services/
    ├── __init__.py
    ├── tactic_detector.py          # Unit 3: Rule-based keyword scoring
    ├── ml_detector.py              # Unit 4: HuggingFace ML pipeline
    ├── score_engine.py             # Unit 5: Weighted score combiner
    ├── explanation_engine.py       # Unit 6: OpenAI / fallback explanation
    └── highlight_detector.py       # Unit 7: Regex-based word highlighter
```

## 🚀 Setup

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

## 📡 API Usage

### POST /api/scan

**Request:**
```json
{ "text": "URGENT: Your account is suspended. Verify immediately." }
```

**Response:**
```json
{
  "score": 72.5,
  "risk": "High",
  "tactics": {
    "urgency": 50.0,
    "fear": 50.0,
    "authority": 0.0,
    "reward": 0.0
  },
  "explanation": "This message is suspicious because it creates urgency and uses fear tactics...",
  "highlights": [
    { "start": 0, "end": 6, "word": "URGENT", "type": "urgency" },
    { "start": 32, "end": 41, "word": "suspended", "type": "fear" }
  ]
}
```

## ⚙️ Environment Variables

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | (Optional) Enables GPT-powered explanations |

## 📖 Docs

Interactive API docs at: `http://localhost:8000/docs`
