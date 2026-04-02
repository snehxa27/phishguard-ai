# services/tactic_detector.py — Rule-Based Psychological Tactic Detection (Unit 3)

import re
from typing import Dict

# Keyword maps per tactic
TACTIC_KEYWORDS: Dict[str, list] = {
    "urgency": [
        "urgent", "immediately", "24 hours", "right now", "act now",
        "limited time", "expire", "expires", "deadline", "asap",
        "without delay", "time sensitive", "last chance", "hurry"
    ],
    "fear": [
        "blocked", "suspended", "warning", "unauthorized", "compromised",
        "hacked", "breached", "locked", "disabled", "terminated",
        "illegal", "fraud", "detected", "risk", "danger", "violation"
    ],
    "authority": [
        "bank", "security team", "government", "irs", "fbi", "police",
        "microsoft", "apple", "paypal", "amazon", "official",
        "administrator", "support team", "verify your identity",
        "compliance", "legal department"
    ],
    "reward": [
        "won", "winner", "prize", "cashback", "reward", "gift",
        "free", "congratulations", "selected", "bonus", "claim",
        "lucky", "jackpot", "voucher", "discount", "offer"
    ],
}


def _score_tactic(text: str, keywords: list) -> float:
    """
    Score a single tactic by counting keyword hits.
    Returns a value from 0 to 100.
    """
    text_lower = text.lower()
    hits = sum(1 for kw in keywords if re.search(r'\b' + re.escape(kw) + r'\b', text_lower))
    # Normalize: 1 hit = ~25pts, 2 = 50, 3 = 75, 4+ = 100
    return min(hits * 25.0, 100.0)


def detect_tactics(text: str) -> Dict[str, float]:
    """
    Detect phishing-related psychological patterns in text.

    Returns:
        {
            "urgency": score (0–100),
            "fear": score (0–100),
            "authority": score (0–100),
            "reward": score (0–100)
        }
    """
    return {
        tactic: _score_tactic(text, keywords)
        for tactic, keywords in TACTIC_KEYWORDS.items()
    }
