# services/score_engine.py — Combined Rule + ML Score Engine (Unit 5)

from typing import Dict


def _get_risk_label(score: float) -> str:
    """Map a numeric score to a risk label."""
    if score >= 70:
        return "High"
    elif score >= 40:
        return "Medium"
    return "Low"


def calculate_final_score(
    rule_scores: Dict[str, float],
    ml_score: float
) -> Dict:
    """
    Combine rule-based tactic scores with ML confidence into a final score.

    Args:
        rule_scores: Dict of tactic scores (0–100 each)
        ml_score: ML model confidence (0–100)

    Returns:
        {
            "score": final_score (0–100),
            "risk": "Low" | "Medium" | "High"
        }
    """
    if not rule_scores:
        rule_avg = 0.0
    else:
        rule_avg = sum(rule_scores.values()) / len(rule_scores)

    final = (rule_avg * 0.6) + (ml_score * 0.4)
    final = round(min(max(final, 0.0), 100.0), 2)

    return {
        "score": final,
        "risk": _get_risk_label(final)
    }
