import email
from io import BytesIO
from pypdf import PdfReader
import re

def parse_file(filename: str, content: bytes) -> dict:
    """
    Parses a file based on its extension and extracts relevant text and metadata.
    Returns:
        {
            "text": str,
            "subject": str | None,
            "sender": str | None
        }
    """
    ext = filename.lower().split('.')[-1] if '.' in filename else ''
    
    if ext == 'txt':
        return {"text": content.decode('utf-8', errors='ignore'), "subject": None, "sender": None}
    
    elif ext == 'pdf':
        try:
            reader = PdfReader(BytesIO(content))
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return {"text": text.strip(), "subject": None, "sender": None}
        except Exception as e:
            return {"text": f"Error parsing PDF: {str(e)}", "subject": None, "sender": None}
            
    elif ext == 'eml':
        try:
            msg = email.message_from_bytes(content)
            subject = msg.get('Subject', '')
            sender = msg.get('From', '')
            
            body = ""
            html_fallback = ""
            
            if msg.is_multipart():
                for part in msg.walk():
                    content_type = part.get_content_type()
                    content_disp = str(part.get("Content-Disposition"))
                    
                    if "attachment" in content_disp:
                        continue
                        
                    if content_type == "text/plain":
                        payload = part.get_payload(decode=True)
                        if payload:
                            body += payload.decode('utf-8', errors='ignore') + "\n"
                    elif content_type == "text/html":
                        payload = part.get_payload(decode=True)
                        if payload:
                            html_fallback += payload.decode('utf-8', errors='ignore') + "\n"
            else:
                content_type = msg.get_content_type()
                payload = msg.get_payload(decode=True)
                if payload:
                    if content_type == "text/html":
                        html_fallback = payload.decode('utf-8', errors='ignore')
                    else:
                        body = payload.decode('utf-8', errors='ignore')

            # If no plain text was found, cleanly strip the HTML
            if not body.strip() and html_fallback.strip():
                # Simple HTML tag stripper
                body = re.sub(r'<style[^>]*>.*?</style>', ' ', html_fallback, flags=re.DOTALL | re.IGNORECASE)
                body = re.sub(r'<script[^>]*>.*?</script>', ' ', body, flags=re.DOTALL | re.IGNORECASE)
                body = re.sub(r'<[^>]+>', ' ', body) # Strip remaining tags
                body = re.sub(r'\s+', ' ', body)     # Compact whitespace
                
            return {
                "text": body.strip(),
                "subject": subject,
                "sender": sender
            }
        except Exception as e:
            return {"text": f"Error parsing EML: {str(e)}", "subject": None, "sender": None}
    
    else:
        # Fallback to plain text decoding attempt
        return {"text": content.decode('utf-8', errors='ignore'), "subject": None, "sender": None}
