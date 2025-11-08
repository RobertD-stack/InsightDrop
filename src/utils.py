from dataclasses import dataclass
from typing import Optional, Dict, Any
from datetime import datetime

@dataclass
class FileClassificationResult:
    """Output data structure for file classification"""
    filetype: str
    content_category: str
    confidence_score: float
    mime_type: Optional[str] = None
    encoding: Optional[str] = None
    language: Optional[str] = None
    metadata: Dict[str, Any] = None
    
    def to_dict(self):
        return {
            "filetype": self.filetype,
            "content_category": self.content_category,
            "confidence_score": self.confidence_score,
            "mime_type": self.mime_type,
            "encoding": self.encoding,
            "language": self.language,
            "metadata": self.metadata or {}
        }

# File type to category mapping
CATEGORY_MAP = {
    # Media files
    'image': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff', 'ico'],
    'video': ['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm', 'mpeg', 'mpg'],
    'audio': ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus'],
    
    # Structured data
    'structured': ['csv', 'json', 'xml', 'xlsx', 'xls', 'sql', 'db', 'sqlite'],
    
    # Documents
    'document': ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'ppt', 'pptx'],
    
    # Executables
    'executable': ['exe', 'dll', 'so', 'bin', 'app', 'msi', 'deb', 'rpm'],
    
    # Archives
    'archive': ['zip', 'rar', 'tar', 'gz', '7z', 'bz2', 'xz'],
    
    # Code
    'code': ['py', 'js', 'java', 'cpp', 'c', 'h', 'html', 'css', 'php', 'rb', 'go'],
}

# Reverse mapping for quick lookup
FILETYPE_TO_CATEGORY = {}
for category, filetypes in CATEGORY_MAP.items():
    for ft in filetypes:
        FILETYPE_TO_CATEGORY[ft.lower()] = category