# services/highlight_detector.py — Suspicious Word Highlighter (Unit 7)

import re
from typing import List, Dict

# Words/phrases to highlight per category
HIGHLIGHT_PATTERNS: Dict[str, List[str]] = {
    "urgency": [
        "urgent", "immediately", "24 hours", "act now", "right now",
        "limited time", "expire", "expires", "deadline", "asap",
        "last chance", "hurry", "time sensitive"
    ],
    "fear": [
        "blocked", "suspended", "warning", "unauthorized", "compromised",
        "hacked", "locked", "disabled", "terminated", "illegal",
        "fraud", "risk", "danger", "violation", "breach"
    ],
    "authority": [
        "bank", "security team", "government", "irs", "fbi",
        "microsoft", "apple", "paypal", "amazon", "official",
        "administrator", "compliance", "legal"
    ],
    "reward": [
        "won", "winner", "prize", "cashback", "reward", "gift",
        "free", "congratulations", "selected", "bonus",
        "claim", "lucky", "jackpot", "voucher"
    ],
}


def highlight_text(text: str) -> List[Dict]:
    """
    Detect suspicious words and return their character positions.

    Args:
        text: The raw input message string

    Returns:
        List of dicts:
        [
            {
                "start": int,
                "end": int,
                "word": str,
                "type": "urgency" | "fear" | "authority" | "reward"
            }
        ]
    """
    highlights = []
    seen_ranges = set()

    for tactic, keywords in HIGHLIGHT_PATTERNS.items():
        for keyword in keywords:
            pattern = re.compile(r'\b' + re.escape(keyword) + r'\b', re.IGNORECASE)
            for match in pattern.finditer(text):
                start, end = match.start(), match.end()
                # Avoid duplicate overlapping highlights
                if (start, end) not in seen_ranges:
                    seen_ranges.add((start, end))
                    highlights.append({
                        "start": start,
                        "end": end,
                        "word": match.group(),
                        "type": tactic
                    })

    # Sort by position for easy frontend rendering
    highlights.sort(key=lambda h: h["start"])
    return highlights
