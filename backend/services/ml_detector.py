# services/ml_detector.py — HuggingFace ML Detection Layer (Unit 4)

from typing import Optional

# Lazy-load the pipeline to avoid startup delay
_pipeline = None


def _get_pipeline():
    """Lazy-load the HuggingFace text-classification pipeline."""
    global _pipeline
    if _pipeline is None:
        try:
            from transformers import pipeline
            # Using a lightweight zero-shot or spam classifier
            # Replace model name with a phishing-specific model if available
            _pipeline = pipeline(
                "text-classification",
                model="mrm8488/bert-tiny-finetuned-sms-spam-detection",
                truncation=True,
                max_length=512
            )
        except Exception as e:
            print(f"[ML] Failed to load model: {e}")
            _pipeline = None
    return _pipeline


def ml_detect(text: str) -> float:
    """
    Run ML-based phishing/spam detection.

    Returns:
        Confidence score between 0–100 (higher = more suspicious).
        Falls back to 0.0 on error.
    """
    try:
        pipe = _get_pipeline()
        if pipe is None:
            return 0.0

        result = pipe(text[:512])[0]  # Truncate to avoid token overflow
        label: str = result.get("label", "").upper()
        confidence: float = result.get("score", 0.0)

        # Map label → phishing score
        # SPAM / LABEL_1 → suspicious; HAM / LABEL_0 → clean
        if label in ("SPAM", "LABEL_1", "1"):
            return round(confidence * 100, 2)
        else:
            # Invert: high ham confidence → low phishing score
            return round((1.0 - confidence) * 100, 2)

    except Exception as e:
        print(f"[ML] Detection error: {e}")
        return 0.0
