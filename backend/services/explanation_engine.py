# services/explanation_engine.py — Human-Readable Explanation Generator (Unit 6)

import os
from typing import Dict


def generate_explanation(text: str, tactics: Dict[str, float]) -> str:
    """
    Generate a beginner-friendly explanation of why this message is suspicious.

    Uses OpenAI GPT if API key is available, otherwise falls back to
    a deterministic rule-based explanation.

    Args:
        text: The input email/message text
        tactics: Dict of detected tactic scores

    Returns:
        A short (2–3 line) human-readable explanation string.
    """
    active_tactics = [t for t, score in tactics.items() if score > 0]

    # --- Attempt OpenAI explanation ---
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        try:
            import openai
            openai.api_key = api_key

            tactic_str = ", ".join(active_tactics) if active_tactics else "none"
            prompt = (
                f"Analyze this message for phishing indicators.\n\n"
                f"Message: \"{text[:500]}\"\n"
                f"Detected tactics: {tactic_str}\n\n"
                f"Write a 2–3 sentence beginner-friendly explanation of why this "
                f"message may be suspicious. Be clear and direct. Avoid jargon."
            )

            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=120,
                temperature=0.5
            )
            return response.choices[0].message.content.strip()

        except Exception as e:
            print(f"[Explanation] OpenAI error: {e}")
            # Fall through to rule-based fallback

    # --- Rule-based fallback explanation ---
    return _rule_based_explanation(active_tactics)


def _rule_based_explanation(active_tactics: list) -> str:
    """Generate a deterministic explanation from active tactic names."""
    if not active_tactics:
        return (
            "This message appears clean. No common phishing tactics were detected. "
            "Always stay cautious with unsolicited messages."
        )

    descriptions = {
        "urgency": "creates a false sense of urgency to pressure you into acting quickly",
        "fear": "uses fear tactics such as threats of account suspension or security warnings",
        "authority": "impersonates a trusted authority like a bank, government, or tech company",
        "reward": "offers unrealistic rewards or prizes to lure you into clicking",
    }

    tactic_phrases = [descriptions[t] for t in active_tactics if t in descriptions]

    if len(tactic_phrases) == 1:
        detail = tactic_phrases[0]
    elif len(tactic_phrases) == 2:
        detail = f"{tactic_phrases[0]} and {tactic_phrases[1]}"
    else:
        detail = ", ".join(tactic_phrases[:-1]) + f", and {tactic_phrases[-1]}"

    return (
        f"This message is suspicious because it {detail}. "
        f"These are common techniques used by scammers to manipulate people into sharing "
        f"personal information or clicking malicious links. Do not respond or click any links."
    )
