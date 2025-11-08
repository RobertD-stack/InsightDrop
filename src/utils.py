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
    # Media files - Images
    'image': [
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff', 'ico', 
        'heic', 'heif', 'jfif', 'jp2', 'jpx', 'j2k', 'j2c'
    ],
    
    # Media files - Videos
    'video': [
        'mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm', 'mpeg', 'mpg', 
        'm4v', '3gp', '3g2', 'asf', 'rm', 'rmvb', 'vob', 'ogv', 'divx'
    ],
    
    # Media files - Audio
    'audio': [
        'mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus', 'amr',
        'au', 'ra', 'aiff', 'aif', 'mid', 'midi', 'wv', 'ape', 'ac3'
    ],
    
    # Structured data
    'structured': [
        'csv', 'json', 'xml', 'xlsx', 'xls', 'sql', 'db', 'sqlite', 'mdb',
        'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'properties', 'tsv',
        'ods', 'parquet', 'avro', 'orc', 'feather'
    ],
    
    # Documents
    'document': [
        'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'ppt', 'pptx', 'odp',
        'pages', 'key', 'numbers', 'xps', 'epub', 'mobi', 'azw', 'fb2',
        'md', 'markdown', 'rst', 'tex', 'latex', 'djvu'
    ],
    
    # Executables
    'executable': [
        'exe', 'dll', 'so', 'bin', 'app', 'msi', 'deb', 'rpm', 'dmg',
        'pkg', 'apk', 'ipa', 'elf', 'macho', 'class', 'jar', 'war',
        'ear', 'sh', 'bat', 'cmd', 'ps1', 'vbs', 'com'
    ],
    
    # Archives
    'archive': [
        'zip', 'rar', 'tar', 'gz', '7z', 'bz2', 'xz', 'lz', 'lzma',
        'cab', 'arj', 'ace', 'z', 'lzh', 'sit', 'sitx', 'dmg', 'iso',
        'img', 'tar.gz', 'tar.bz2', 'tar.xz', 'zipx'
    ],
    
    # Code
    'code': [
        'py', 'pyw', 'pyc', 'js', 'jsx', 'ts', 'tsx', 'java', 'class',
        'cpp', 'cxx', 'cc', 'c', 'h', 'hpp', 'hxx', 'html', 'htm', 'xhtml',
        'css', 'scss', 'sass', 'less', 'php', 'rb', 'go', 'rs', 'swift',
        'kt', 'scala', 'clj', 'cljs', 'lua', 'dart', 'r', 'm', 'mm',
        'pl', 'pm', 'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd',
        'sql', 'cs', 'vb', 'fs', 'ml', 'mli', 'hs', 'lhs', 'elm',
        'ex', 'exs', 'erl', 'hrl', 'vim', 'vimrc', 'dockerfile', 'makefile'
    ],
}

# Reverse mapping for quick lookup
FILETYPE_TO_CATEGORY = {}
for category, filetypes in CATEGORY_MAP.items():
    for ft in filetypes:
        FILETYPE_TO_CATEGORY[ft.lower()] = category