"""
PII (Personally Identifiable Information) Detector
Detects sensitive information in file contents including:
- SSN (Social Security Numbers)
- Phone numbers
- IP addresses
- Names
- Addresses
- Student IDs
- Credit card numbers
- Email addresses
Supports multiple languages
"""
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class PIIDetection:
    """Represents a detected PII instance"""
    pii_type: str
    value: str
    confidence: float
    position: Optional[int] = None
    context: Optional[str] = None


class PIIDetector:
    """Detects Personally Identifiable Information in file contents"""
    
    def __init__(self):
        # Compile regex patterns for efficiency
        self.patterns = self._compile_patterns()
    
    def _compile_patterns(self) -> Dict[str, re.Pattern]:
        """Compile all PII detection patterns"""
        patterns = {}
        
        # SSN (US): XXX-XX-XXXX or XXXXXXXXX
        patterns['ssn'] = re.compile(
            r'\b\d{3}-?\d{2}-?\d{4}\b',
            re.IGNORECASE
        )
        
        # Phone numbers (US and international formats)
        # US: (XXX) XXX-XXXX, XXX-XXX-XXXX, XXX.XXX.XXXX, XXXXXXXXXX
        # International: +X XXX XXX XXXX, variations
        # Exclude patterns that look like SSN or IP addresses
        patterns['phone'] = re.compile(
            r'\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b(?!\s*[-.]?\s*\d{4})|'  # US format, not followed by more digits
            r'\b\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b(?!\.\d)',  # International, not IP
            re.IGNORECASE
        )
        
        # IP addresses (IPv4 and IPv6)
        # More specific patterns to avoid matching phone numbers or other numbers
        patterns['ip_address'] = re.compile(
            r'\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b|'  # IPv4 (valid range)
            r'\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b|'  # IPv6 full
            r'\b(?:[0-9a-fA-F]{1,4}:)*::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}\b',  # IPv6 compressed
            re.IGNORECASE
        )
        
        # Credit card numbers (various formats)
        # Most credit cards: 13-19 digits, may have spaces or dashes
        patterns['credit_card'] = re.compile(
            r'\b(?:\d{4}[-\s]?){3}\d{1,4}\b|'  # Standard format
            r'\b\d{13,19}\b',  # Without separators
            re.IGNORECASE
        )
        
        # Email addresses
        patterns['email'] = re.compile(
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            re.IGNORECASE
        )
        
        # Student IDs (common patterns: alphanumeric, 6-10 characters)
        patterns['student_id'] = re.compile(
            r'\b(?:STU|STUDENT|ID|SID)[-:\s]?[A-Z0-9]{6,10}\b|'
            r'\b[A-Z]{2,4}\d{4,8}\b',  # Common pattern: letters + numbers
            re.IGNORECASE
        )
        
        # Address patterns (street addresses)
        patterns['address'] = re.compile(
            r'\b\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Street|St|Avenue|Ave|Road|Rd|'
            r'Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Way|Parkway|Pkwy)\b',
            re.IGNORECASE
        )
        
        # Names (common first/last name patterns)
        # This is less reliable, so lower confidence
        patterns['name'] = re.compile(
            r'\b(?:Mr|Mrs|Ms|Dr|Prof)\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b|'  # Title + Name
            r'\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b',  # First Last (Middle)
            re.IGNORECASE
        )
        
        return patterns
    
    def _validate_ssn(self, ssn: str) -> bool:
        """Validate SSN format (exclude invalid ranges)"""
        # Remove dashes
        digits = re.sub(r'[^\d]', '', ssn)
        if len(digits) != 9:
            return False
        
        # Invalid SSN ranges
        area = int(digits[:3])
        group = int(digits[3:5])
        serial = int(digits[5:])
        
        # Area 000, 666, 900-999 are invalid
        if area == 0 or area == 666 or 900 <= area <= 999:
            return False
        
        # Group 00 is invalid
        if group == 0:
            return False
        
        # Serial 0000 is invalid
        if serial == 0:
            return False
        
        return True
    
    def _validate_credit_card(self, card: str) -> bool:
        """Validate credit card using Luhn algorithm"""
        # Remove non-digits
        digits = re.sub(r'[^\d]', '', card)
        
        if len(digits) < 13 or len(digits) > 19:
            return False
        
        # Luhn algorithm
        total = 0
        reverse_digits = digits[::-1]
        
        for i, digit in enumerate(reverse_digits):
            n = int(digit)
            if i % 2 == 1:
                n *= 2
                if n > 9:
                    n -= 9
            total += n
        
        return total % 10 == 0
    
    def _validate_ip(self, ip: str) -> bool:
        """Validate IP address format"""
        # IPv4 validation
        if '.' in ip:
            parts = ip.split('.')
            if len(parts) != 4:
                return False
            try:
                for part in parts:
                    num = int(part)
                    if num < 0 or num > 255:
                        return False
                return True
            except ValueError:
                return False
        
        # IPv6 validation (basic check)
        if ':' in ip:
            # Basic IPv6 format check
            parts = ip.split(':')
            if len(parts) > 8:
                return False
            return True
        
        return False
    
    def _calculate_confidence(self, pii_type: str, value: str) -> float:
        """Calculate confidence score for detected PII"""
        base_confidence = {
            'ssn': 0.95,
            'credit_card': 0.90,
            'ip_address': 0.85,
            'email': 0.95,
            'phone': 0.80,
            'student_id': 0.70,
            'address': 0.75,
            'name': 0.60,  # Lower confidence for names
        }
        
        confidence = base_confidence.get(pii_type, 0.70)
        
        # Apply validation checks
        if pii_type == 'ssn' and not self._validate_ssn(value):
            confidence *= 0.5
        elif pii_type == 'credit_card' and not self._validate_credit_card(value):
            confidence *= 0.5
        elif pii_type == 'ip_address' and not self._validate_ip(value):
            confidence *= 0.5
        
        return min(confidence, 1.0)
    
    def detect(self, text_content: str, max_context_length: int = 50) -> List[PIIDetection]:
        """
        Detect PII in text content
        
        Args:
            text_content: The text to analyze
            max_context_length: Maximum length of context around detected PII
        
        Returns:
            List of PIIDetection objects
        """
        detections = []
        
        # Only process text content (skip binary files)
        if not isinstance(text_content, str):
            return detections
        
        # Process each pattern
        for pii_type, pattern in self.patterns.items():
            matches = pattern.finditer(text_content)
            
            for match in matches:
                value = match.group(0)
                start_pos = match.start()
                end_pos = match.end()
                
                # Get context around the match
                context_start = max(0, start_pos - max_context_length)
                context_end = min(len(text_content), end_pos + max_context_length)
                context = text_content[context_start:context_end]
                
                # Calculate confidence
                confidence = self._calculate_confidence(pii_type, value)
                
                # Only include high-confidence detections
                if confidence >= 0.5:
                    detection = PIIDetection(
                        pii_type=pii_type,
                        value=value,
                        confidence=round(confidence, 2),
                        position=start_pos,
                        context=context.strip()
                    )
                    detections.append(detection)
        
        # Remove duplicates (same value at same position)
        seen = set()
        unique_detections = []
        for det in detections:
            key = (det.pii_type, det.value, det.position)
            if key not in seen:
                seen.add(key)
                unique_detections.append(det)
        
        return unique_detections
    
    def extract_text_from_image(self, binary_data: bytes) -> str:
        """
        Extract text from image using OCR
        
        Args:
            binary_data: Image file data
        
        Returns:
            Extracted text string
        """
        try:
            from PIL import Image
            import pytesseract
            import io
            
            # Open image from bytes
            image = Image.open(io.BytesIO(binary_data))
            
            # Perform OCR with error handling
            try:
                text = pytesseract.image_to_string(image)
                return text
            except pytesseract.TesseractNotFoundError:
                # Tesseract not installed on system
                print("OCR: Tesseract not found. Install tesseract-ocr to enable image PII detection.")
                return ""
            except Exception as e:
                print(f"OCR warning: {e}")
                return ""
        except ImportError:
            # pytesseract Python package not available
            print("OCR: pytesseract package not installed. Install with: pip install pytesseract")
            return ""
        except Exception as e:
            # OCR failed, return empty
            print(f"OCR warning: {e}")
            return ""
    
    def detect_in_binary(self, binary_data: bytes, file_type: str = None) -> List[PIIDetection]:
        """
        Detect PII in binary data by attempting to decode as text or extract from images
        
        Args:
            binary_data: Binary file data
            file_type: Optional file type hint (e.g., 'png', 'jpg', 'pdf')
        
        Returns:
            List of PIIDetection objects
        """
        detections = []
        
        # Check if it's an image that might contain text
        image_types = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp']
        if file_type and file_type.lower() in image_types:
            # Try OCR first for images
            try:
                text_content = self.extract_text_from_image(binary_data)
                if text_content and len(text_content.strip()) > 10:  # Only if we got meaningful text
                    detections = self.detect(text_content)
                    if detections:
                        return detections
            except Exception as e:
                print(f"OCR extraction failed: {e}")
        
        # Try multiple encodings for text-based files
        encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252', 'ascii']
        
        for encoding in encodings:
            try:
                # Decode a sample (first 1MB to avoid memory issues)
                sample_size = min(len(binary_data), 1024 * 1024)
                text_content = binary_data[:sample_size].decode(encoding, errors='ignore')
                
                # Detect PII in decoded text
                detections = self.detect(text_content)
                
                # If we found PII, return it
                if detections:
                    break
            except (UnicodeDecodeError, ValueError):
                continue
        
        return detections
    
    def summarize(self, detections: List[PIIDetection]) -> Dict[str, any]:
        """
        Summarize PII detections
        
        Returns:
            Dictionary with summary statistics
        """
        if not detections:
            return {
                'has_pii': False,
                'pii_types_found': [],
                'total_count': 0,
                'high_confidence_count': 0
            }
        
        # Group by type
        by_type = {}
        for det in detections:
            if det.pii_type not in by_type:
                by_type[det.pii_type] = []
            by_type[det.pii_type].append(det)
        
        # Count high confidence (>0.8)
        high_confidence = [d for d in detections if d.confidence >= 0.8]
        
        return {
            'has_pii': True,
            'pii_types_found': list(by_type.keys()),
            'total_count': len(detections),
            'high_confidence_count': len(high_confidence),
            'by_type': {
                pii_type: {
                    'count': len(dets),
                    'examples': [d.value for d in dets[:3]]  # First 3 examples
                }
                for pii_type, dets in by_type.items()
            },
            'detections': [
                {
                    'type': d.pii_type,
                    'value': d.value[:20] + '...' if len(d.value) > 20 else d.value,  # Masked value
                    'confidence': d.confidence
                }
                for d in detections[:10]  # First 10 detections
            ]
        }

