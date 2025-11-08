import mimetypes
from pathlib import Path
from typing import Dict, Any

class FileTypeIdentifier:
    def __init__(self):
        try:
            import magic
            self.magic_mime = magic.Magic(mime=True)
            self.magic_type = magic.Magic()
            self.has_magic = True
        except (ImportError, Exception) as e:
            print(f"Warning: Magic library not available, using fallback detection")
            self.magic_mime = None
            self.magic_type = None
            self.has_magic = False
    
    def identify(self, binary_data: bytes, filename: str = None) -> Dict[str, Any]:
        """
        Identify file type from binary data
        Returns: dict with 'type', 'extension', 'mime_type', 'confidence_factors'
        """
        results = {
            'type': 'unknown',
            'extension': None,
            'mime_type': None,
            'confidence_factors': {
                'magic_match': False,
                'extension_match': False,
                'structure_valid': False
            }
        }
        
        # Method 1: Get extension first (if filename provided)
        extension = None
        if filename:
            extension = Path(filename).suffix.lower().replace('.', '')
            results['extension'] = extension
        
        # Method 2: Magic number detection (signature-based)
        detected_type = self._detect_by_signature(binary_data)
        if detected_type:
            results['type'] = detected_type
            results['confidence_factors']['magic_match'] = True
            results['confidence_factors']['structure_valid'] = True
        
        # Method 3: Try magic library if available
        if self.has_magic and self.magic_mime and len(binary_data) > 0:
            try:
                mime_type = self.magic_mime.from_buffer(binary_data)
                results['mime_type'] = mime_type
                
                # Only override if we didn't detect via signature
                if not detected_type:
                    results['type'] = self._mime_to_filetype(mime_type)
                    results['confidence_factors']['magic_match'] = True
            except Exception as e:
                pass
        
        # Method 4: If no detection yet, trust the extension for known types
        if (results['type'] == 'unknown' or results['type'] == 'txt') and extension:
            # List of extensions we trust (text-based files)
            trusted_extensions = [
                # Text files
                'txt', 'md', 'markdown', 'readme', 'log',
                # Data formats
                'csv', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf',
                # Web
                'html', 'htm', 'xhtml', 'css', 'scss', 'sass', 'less',
                # Scripting/Programming
                'js', 'jsx', 'ts', 'tsx', 'py', 'pyw', 'pyc', 'java', 'class',
                'cpp', 'cxx', 'cc', 'c', 'h', 'hpp', 'hxx', 'cs', 'vb',
                'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'clj',
                'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd',
                'sql', 'pl', 'pm', 'r', 'm', 'mm', 'lua', 'dart',
                # Markup/Documentation
                'md', 'rst', 'tex', 'latex', 'rtf',
                # Config
                'json', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'properties',
                # Other
                'diff', 'patch', 'lock', 'gitignore', 'dockerfile'
            ]
            if extension in trusted_extensions:
                results['type'] = extension
                results['confidence_factors']['extension_match'] = True
                results['confidence_factors']['structure_valid'] = True
        
        # Method 5: Check if extension matches detected type
        if extension and results['type'] != 'unknown':
            if results['type'].lower() == extension.lower():
                results['confidence_factors']['extension_match'] = True
        
        return results
    
    def _detect_by_signature(self, binary_data: bytes) -> str:
        """Detect file type by magic number signatures"""
        if len(binary_data) < 4:
            return None
        
        # Check first bytes for known signatures
        signatures = {
            # Images
            b'\xFF\xD8\xFF': 'jpg',
            b'\x89PNG\r\n\x1a\n': 'png',
            b'GIF87a': 'gif',
            b'GIF89a': 'gif',
            b'BM': 'bmp',
            b'RIFF': 'webp',  # WebP (check further)
            b'\x00\x00\x01\x00': 'ico',  # ICO
            b'II*\x00': 'tiff',  # TIFF (little-endian)
            b'MM\x00*': 'tiff',  # TIFF (big-endian)
            b'ftyp': 'heic',  # HEIC/HEIF (check further)
            
            # Documents
            b'%PDF': 'pdf',
            b'PK\x03\x04': 'zip',  # Also used by docx, xlsx, pptx, odt, ods, odp
            b'{\\rtf': 'rtf',  # RTF
            b'{\\rtf1': 'rtf',  # RTF variant
            
            # Archives
            b'PK\x05\x06': 'zip',
            b'Rar!\x1a\x07': 'rar',
            b'Rar!\x1a\x07\x00': 'rar',  # RAR v1.50+
            b'Rar!\x1a\x07\x01\x00': 'rar',  # RAR v5.0+
            b'\x1f\x8b': 'gz',
            b'7z\xbc\xaf\x27\x1c': '7z',  # 7-Zip
            b'BZ': 'bz2',  # BZIP2
            b'\xfd7zXZ\x00': 'xz',  # XZ
            b'ustar': 'tar',  # TAR (at offset 257)
            
            # Executables
            b'MZ': 'exe',  # Windows/DOS executable
            b'\x7fELF': 'elf',  # Linux/Unix executable
            b'\xca\xfe\xba\xbe': 'class',  # Java class file
            b'\xfe\xed\xfa\xce': 'macho',  # Mach-O (macOS)
            b'\xce\xfa\xed\xfe': 'macho',  # Mach-O (little-endian)
            b'\xcf\xfa\xed\xfe': 'macho64',  # Mach-O 64-bit
            
            # Audio/Video
            b'ID3': 'mp3',  # MP3 with ID3 tag
            b'\xFF\xFB': 'mp3',  # MP3 frame sync
            b'\xFF\xF3': 'mp3',  # MP3 frame sync
            b'\xFF\xF2': 'mp3',  # MP3 frame sync
            b'\xFF\xE3': 'mp3',  # MP3 frame sync
            b'RIFF': 'wav',  # WAV (check further)
            b'fLaC': 'flac',  # FLAC
            b'OggS': 'ogg',  # OGG
            b'\x00\x00\x00 ftyp': 'mp4',  # MP4/M4A (check further)
            b'ftyp': 'mp4',  # MP4 (at offset 4)
            b'ftypqt': 'mov',  # QuickTime MOV
            b'ftypisom': 'mp4',  # ISO MP4
            b'ftypM4A': 'm4a',  # M4A
            b'ftypM4V': 'm4v',  # M4V
            b'\x1a\x45\xdf\xa3': 'mkv',  # Matroska (MKV, WebM)
            b'FLV\x01': 'flv',  # Flash Video
            b'\x00\x00\x00\x18ftyp3gp': '3gp',  # 3GP
            b'\x00\x00\x00\x20ftyp3gp': '3gp',  # 3GP variant
            
            # Text/Code files (by extension, but add some signatures)
            b'#!/': 'sh',  # Shell script
            b'#!': 'script',  # Generic script
            b'<?xml': 'xml',  # XML
            b'<html': 'html',  # HTML
            b'<!DOCTYPE': 'html',  # HTML
            b'{\n': 'json',  # JSON (starts with {)
            b'[\n': 'json',  # JSON (starts with [)
            b'---': 'yaml',  # YAML
        }
        
        # Check signatures
        for sig, filetype in signatures.items():
            if binary_data[:len(sig)] == sig:
                # Special handling for Office files (they're ZIP files)
                if sig == b'PK\x03\x04':
                    return self._detect_office_format(binary_data)
                return filetype
        
        # Check for RIFF-based formats (WAV, AVI, WebP)
        if binary_data[:4] == b'RIFF' and len(binary_data) >= 12:
            if binary_data[8:12] == b'WAVE':
                return 'wav'
            elif binary_data[8:12] == b'AVI ':
                return 'avi'
            elif binary_data[8:12] == b'WEBP':
                return 'webp'
        
        # Check for ftyp-based formats (MP4, HEIC, MOV, M4A, M4V) at offset 4
        if len(binary_data) >= 16 and b'ftyp' in binary_data[4:12]:
            # Check the brand identifier at offset 8
            brand = binary_data[8:12]
            if b'heic' in binary_data[8:16] or b'heif' in binary_data[8:16]:
                return 'heic'
            elif b'qt' in binary_data[8:16]:
                return 'mov'
            elif b'isom' in binary_data[8:16] or b'mp4' in binary_data[8:16] or brand == b'isom' or brand == b'mp41':
                return 'mp4'
            elif b'M4A' in binary_data[8:16] or brand == b'M4A ':
                return 'm4a'
            elif b'M4V' in binary_data[8:16] or brand == b'M4V ':
                return 'm4v'
            else:
                # Default to mp4 for other ftyp signatures
                return 'mp4'
        
        # Check for Matroska (MKV, WebM)
        if binary_data[:4] == b'\x1a\x45\xdf\xa3':
            # Check if it's WebM
            if len(binary_data) > 20 and b'webm' in binary_data[:50]:
                return 'webm'
            return 'mkv'
        
        # Check for TAR (at offset 257)
        if len(binary_data) >= 265:
            if binary_data[257:262] == b'ustar':
                return 'tar'
        
        # Check for BZIP2
        if binary_data[:2] == b'BZ':
            return 'bz2'
        
        # Check for Java class file
        if binary_data[:4] == b'\xca\xfe\xba\xbe':
            return 'class'
        
        # Check for FLAC
        if binary_data[:4] == b'fLaC':
            return 'flac'
        
        # Check for OGG
        if binary_data[:4] == b'OggS':
            return 'ogg'
        
        # Check for 7-Zip
        if binary_data[:6] == b'7z\xbc\xaf\x27\x1c':
            return '7z'
        
        # Check for XZ
        if binary_data[:6] == b'\xfd7zXZ\x00':
            return 'xz'
        
        # Check for FLV
        if binary_data[:4] == b'FLV\x01':
            return 'flv'
        
        # Check for XML/HTML (text-based, but check signature)
        if len(binary_data) >= 5:
            text_start = binary_data[:100].decode('utf-8', errors='ignore').strip()
            if text_start.startswith('<?xml'):
                return 'xml'
            elif text_start.startswith('<html') or text_start.startswith('<!DOCTYPE'):
                return 'html'
            elif text_start.startswith('{') or text_start.startswith('['):
                # Could be JSON, but need more validation
                pass
        
        return None
    
    def _detect_office_format(self, binary_data: bytes) -> str:
        """Detect Office format from ZIP-based files"""
        try:
            # Look for Office-specific patterns in the data
            data_str = binary_data[:2000].decode('latin-1', errors='ignore')
            
            # Microsoft Office formats
            if 'word/' in data_str or '[Content_Types].xml' in data_str and 'wordprocessingml' in data_str:
                return 'docx'
            elif 'xl/' in data_str or 'worksheets/' in data_str or 'spreadsheetml' in data_str:
                return 'xlsx'
            elif 'ppt/' in data_str or 'presentationml' in data_str:
                return 'pptx'
            
            # OpenDocument formats
            elif 'mimetype' in data_str:
                if 'opendocument.text' in data_str or 'application/vnd.oasis.opendocument.text' in data_str:
                    return 'odt'
                elif 'opendocument.spreadsheet' in data_str or 'application/vnd.oasis.opendocument.spreadsheet' in data_str:
                    return 'ods'
                elif 'opendocument.presentation' in data_str or 'application/vnd.oasis.opendocument.presentation' in data_str:
                    return 'odp'
        except:
            pass
        return 'zip'
    
    def _mime_to_filetype(self, mime_type: str) -> str:
        """Convert MIME type to file extension"""
        mime_map = {
            # Images
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/bmp': 'bmp',
            'image/svg+xml': 'svg',
            'image/webp': 'webp',
            'image/tiff': 'tiff',
            'image/x-icon': 'ico',
            'image/vnd.microsoft.icon': 'ico',
            'image/heic': 'heic',
            'image/heif': 'heif',
            
            # Videos
            'video/mp4': 'mp4',
            'video/x-msvideo': 'avi',
            'video/quicktime': 'mov',
            'video/x-matroska': 'mkv',
            'video/webm': 'webm',
            'video/x-flv': 'flv',
            'video/x-ms-wmv': 'wmv',
            'video/mpeg': 'mpeg',
            'video/3gpp': '3gp',
            'video/x-m4v': 'm4v',
            
            # Audio
            'audio/mpeg': 'mp3',
            'audio/mp3': 'mp3',
            'audio/wav': 'wav',
            'audio/x-wav': 'wav',
            'audio/flac': 'flac',
            'audio/aac': 'aac',
            'audio/ogg': 'ogg',
            'audio/x-ms-wma': 'wma',
            'audio/mp4': 'm4a',
            'audio/x-m4a': 'm4a',
            'audio/opus': 'opus',
            'audio/webm': 'webm',
            
            # Documents
            'application/pdf': 'pdf',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'application/vnd.ms-powerpoint': 'ppt',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
            'application/vnd.oasis.opendocument.text': 'odt',
            'application/vnd.oasis.opendocument.spreadsheet': 'ods',
            'application/vnd.oasis.opendocument.presentation': 'odp',
            'application/rtf': 'rtf',
            'text/plain': 'txt',
            'text/markdown': 'md',
            'text/csv': 'csv',
            
            # Archives
            'application/zip': 'zip',
            'application/x-rar': 'rar',
            'application/x-rar-compressed': 'rar',
            'application/x-7z-compressed': '7z',
            'application/gzip': 'gz',
            'application/x-gzip': 'gz',
            'application/x-bzip2': 'bz2',
            'application/x-xz': 'xz',
            'application/x-tar': 'tar',
            'application/x-compressed-tar': 'tar.gz',
            
            # Code/Text
            'application/json': 'json',
            'application/xml': 'xml',
            'text/xml': 'xml',
            'text/html': 'html',
            'text/css': 'css',
            'text/javascript': 'js',
            'application/javascript': 'js',
            'application/typescript': 'ts',
            'text/x-python': 'py',
            'text/x-java': 'java',
            'text/x-c': 'c',
            'text/x-c++': 'cpp',
            'text/x-csharp': 'cs',
            'text/x-php': 'php',
            'application/x-ruby': 'rb',
            'text/x-go': 'go',
            'text/x-rust': 'rs',
            'text/x-swift': 'swift',
            'text/x-kotlin': 'kt',
            'text/x-scala': 'scala',
            'text/x-shellscript': 'sh',
            'text/x-sql': 'sql',
            'text/yaml': 'yaml',
            'application/x-yaml': 'yaml',
            'text/x-toml': 'toml',
            
            # Executables
            'application/x-msdownload': 'exe',
            'application/x-executable': 'exe',
            'application/x-dosexec': 'exe',
            'application/x-sharedlib': 'so',
            'application/x-mach-binary': 'macho',
            'application/java-archive': 'jar',
            'application/x-msi': 'msi',
            'application/vnd.debian.binary-package': 'deb',
            'application/x-rpm': 'rpm',
            'application/x-apple-diskimage': 'dmg',
            
            # Databases
            'application/x-sqlite3': 'sqlite',
            'application/x-sqlite': 'sqlite',
            'application/vnd.ms-access': 'mdb',
            
            # Other
            'application/octet-stream': 'bin',
        }
        
        return mime_map.get(mime_type, mime_type.split('/')[-1])
    
    def _validate_structure(self, binary_data: bytes, filetype: str) -> bool:
        """Basic structure validation for common file types"""
        if len(binary_data) < 4:
            return False
        
        # Already validated by signature detection
        return True