import re
import socket
from typing import List, Dict, Any
from urllib.parse import urlparse

SUSPICIOUS_KEYWORDS = ["login", "verify", "secure", "update", "bank", "account", "confirm", "auth", "signin"]
FAKE_DOMAINS = ["paypa1", "g00gle", "faceb00k", "micro-soft", "micros0ft", "apple-support", "chase-bank"]
SHORTENERS = ['bit.ly', 'tinyurl.com', 'is.gd', 't.co', 'goo.gl', 'ow.ly', 'cutt.ly']

def is_ip_address(domain: str) -> bool:
    try:
        socket.inet_aton(domain)
        return True
    except socket.error:
        pass
    try:
        socket.inet_pton(socket.AF_INET6, domain)
        return True
    except socket.error:
        pass
    return False

def extract_urls(text: str) -> List[str]:
    """Extracts all HTTP/HTTPS and WWW URLs from the given text."""
    # Find http/https
    urls = re.findall(r'(https?://[^\s<>"\'{}|\\^`]+)', text, re.IGNORECASE)
    # Find www. ignoring if it was already matched
    www_urls = re.findall(r'(?:^|[\s<>"\'{}|\\^`])(www\.[^\s<>"\'{}|\\^`]+)', text, re.IGNORECASE)
    
    found = set(urls)
    for w in www_urls:
        if not w.startswith('http'):
            found.add('http://' + w)
            
    return list(found)

def analyze_url(url: str) -> Dict[str, Any]:
    """Analyzes a single URL for malicious characteristics."""
    risk_score = 0
    reasons = []
    
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        if ':' in domain:
            domain = domain.split(':')[0]
            
        path = parsed.path.lower()
        query = parsed.query.lower()
        
        # 1. IP Address
        if is_ip_address(domain):
            risk_score += 80
            reasons.append("Uses IP address instead of domain name")
            
        # 2. Typosquatting
        for fake in FAKE_DOMAINS:
            if fake in domain:
                risk_score += 70
                reasons.append(f"Typosquatting pattern detected: {fake}")
                
        # 3. Suspicious Keywords
        for kw in SUSPICIOUS_KEYWORDS:
            if kw in domain or kw in path or kw in query:
                risk_score += 30
                reasons.append(f"Suspicious keyword '{kw}'")
                
        # 4. Excessive Subdomains
        parts = domain.replace('www.', '').split('.')
        if len(parts) > 3:
            risk_score += 40
            reasons.append(f"Excessive subdomains ({len(parts)})")
            
        # 5. Shorteners
        if any(s in domain for s in SHORTENERS):
            risk_score += 25
            reasons.append("URL shortener detected")
            
    except Exception:
        risk_score += 10
        reasons.append("Unparseable URL format")
        
    risk_score = min(risk_score, 100)
    
    if risk_score >= 70:
        status = "Malicious"
    elif risk_score >= 30:
        status = "Suspicious"
    else:
        status = "Safe"
        reasons.append("No immediate threats detected")
        
    return {
        "url": url,
        "risk_score": risk_score,
        "status": status,
        "reason": "; ".join(reasons)
    }

def analyze_urls(text: str) -> List[Dict[str, Any]]:
    """Extracts and analyzes all URLs from the given text."""
    urls = extract_urls(text)
    return [analyze_url(u) for u in urls]
