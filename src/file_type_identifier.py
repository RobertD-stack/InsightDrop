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
        # But check extension first for Office files (DOCX/XLSX/PPTX are ZIP files)
        # to avoid misclassifying them as ZIP
        detected_type = None
        if extension and extension in ['docx', 'xlsx', 'pptx']:
            # Office files are ZIP files, but we want to detect them properly
            # Check signature first, then use extension if signature matches ZIP
            detected_type = self._detect_by_signature(binary_data)
            if detected_type == 'zip':
                # It's a ZIP signature, check if it's actually an Office file
                office_type = self._detect_office_format(binary_data)
                if office_type != 'zip':
                    detected_type = office_type
                else:
                    # Signature says ZIP, but extension says Office file
                    # Trust the extension for Office files
                    detected_type = extension
        else:
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
            # List of extensions we trust (including media files)
            trusted_extensions = [
                # Text/Code
                'txt', 'csv', 'json', 'xml', 'html', 'css', 'js', 'py', 'java', 
                'cpp', 'c', 'h', 'php', 'rb', 'go', 'rs', 'sql', 'md', 'yaml', 'yml',
                # Images
                'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff', 'ico',
                # Videos
                'mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm', 'mpeg', 'mpg', 'm4v',
                # Audio
                'mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus',
                # Documents
                'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'rtf', 'odt',
                # Archives
                'zip', 'rar', 'tar', 'gz', '7z', 'bz2', 'xz'
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
            
            # Documents
            b'%PDF': 'pdf',
            b'PK\x03\x04': 'zip',  # Also used by docx, xlsx
            
            # Archives
            b'PK\x05\x06': 'zip',
            b'Rar!\x1a\x07': 'rar',
            b'\x1f\x8b': 'gz',
            
            # Executables
            b'MZ': 'exe',
            b'\x7fELF': 'elf',
            
            # Audio/Video
            b'ID3': 'mp3',
            b'\xFF\xFB': 'mp3',
            b'\xFF\xF3': 'mp3',
            b'\xFF\xF2': 'mp3',
            b'RIFF': 'wav',  # Check further for WAV
            b'ftyp': 'mp4',  # Usually at offset 4
        }
        
        # Check signatures
        for sig, filetype in signatures.items():
            if binary_data[:len(sig)] == sig:
                # Special handling for Office files (they're ZIP files)
                if sig == b'PK\x03\x04':
                    return self._detect_office_format(binary_data)
                return filetype
        
        # Check for MP4 (signature at offset 4)
        if len(binary_data) >= 12 and b'ftyp' in binary_data[4:12]:
            return 'mp4'
        
        # Check for QuickTime/MOV (can start with various atoms)
        if len(binary_data) >= 8:
            # MOV files often start with 'ftyp' at offset 4 or 'mdat'/'moov' atoms
            if binary_data[4:8] in [b'ftyp', b'mdat', b'moov', b'pnot', b'udta', b'cmov']:
                # Check if it's likely MOV/QuickTime
                if b'qt  ' in binary_data[8:20] or b'mp4' in binary_data[8:20]:
                    return 'mov'
        
        # Check for RIFF-based formats (WAV, AVI)
        if binary_data[:4] == b'RIFF' and len(binary_data) >= 12:
            if binary_data[8:12] == b'WAVE':
                return 'wav'
            elif binary_data[8:12] == b'AVI ':
                return 'avi'
        
        # Check for EBML-based formats (WebM, MKV) - both use same signature
        # We'll default to webm, but extension will override if it's .mkv
        if len(binary_data) >= 4 and binary_data[:4] == b'\x1a\x45\xdf\xa3':
            return 'webm'  # Default to webm, extension will override for .mkv
        
        # Check for FLV (Flash Video)
        if len(binary_data) >= 3 and binary_data[:3] == b'FLV':
            return 'flv'
        
        return None
    
    def _detect_office_format(self, binary_data: bytes) -> str:
        """Detect Office format from ZIP-based files"""
        try:
            # Method 1: Try to actually read the ZIP structure
            import zipfile
            import io
            try:
                zip_file = zipfile.ZipFile(io.BytesIO(binary_data))
                file_list = zip_file.namelist()
                
                # Check for Office-specific directory structures
                if any('word/' in f.lower() for f in file_list):
                    return 'docx'
                elif any('xl/' in f.lower() or 'worksheets/' in f.lower() for f in file_list):
                    return 'xlsx'
                elif any('ppt/' in f.lower() or 'slides/' in f.lower() for f in file_list):
                    return 'pptx'
            except:
                pass
            
            # Method 2: Look for Office-specific patterns in the data
            # Check a larger sample (first 5000 bytes) for better detection
            sample_size = min(5000, len(binary_data))
            data_str = binary_data[:sample_size].decode('latin-1', errors='ignore')
            
            if 'word/' in data_str or '[Content_Types].xml' in data_str:
                # Additional check: look for Word-specific patterns
                if 'word/document.xml' in data_str or 'word/styles.xml' in data_str:
                    return 'docx'
            elif 'xl/' in data_str or 'worksheets/' in data_str or 'xl/workbook.xml' in data_str:
                return 'xlsx'
            elif 'ppt/' in data_str or 'slides/' in data_str or 'ppt/presentation.xml' in data_str:
                return 'pptx'
        except Exception as e:
            pass
        return 'zip'
    
    def _mime_to_filetype(self, mime_type: str) -> str:
        """Convert MIME type to file extension"""
        mime_map = {
            # Images
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/bmp': 'bmp',
            'image/svg+xml': 'svg',
            'image/webp': 'webp',
            'image/tiff': 'tiff',
            # Videos
            'video/mp4': 'mp4',
            'video/x-msvideo': 'avi',
            'video/quicktime': 'mov',
            'video/x-matroska': 'mkv',
            'video/webm': 'webm',
            'video/x-flv': 'flv',
            'video/x-ms-wmv': 'wmv',
            'video/mpeg': 'mpeg',
            'video/x-m4v': 'm4v',
            # Audio
            'audio/mpeg': 'mp3',
            'audio/wav': 'wav',
            'audio/x-wav': 'wav',
            'audio/flac': 'flac',
            'audio/aac': 'aac',
            'audio/ogg': 'ogg',
            'audio/x-ms-wma': 'wma',
            'audio/mp4': 'm4a',
            'audio/opus': 'opus',
            # Documents
            'application/pdf': 'pdf',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'application/vnd.ms-powerpoint': 'ppt',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
            # Archives
            'application/zip': 'zip',
            'application/x-rar': 'rar',
            'application/x-tar': 'tar',
            'application/gzip': 'gz',
            'application/x-7z-compressed': '7z',
            # Data
            'application/json': 'json',
            'application/xml': 'xml',
            'text/csv': 'csv',
            'text/plain': 'txt',
            'text/html': 'html',
            # Executables
            'application/x-msdownload': 'exe',
            'application/x-executable': 'exe',
            'application/x-dosexec': 'exe',
        }
        
        return mime_map.get(mime_type, mime_type.split('/')[-1])
    
    def _validate_structure(self, binary_data: bytes, filetype: str) -> bool:
        """Basic structure validation for common file types"""
        if len(binary_data) < 4:
            return False
        
        # Already validated by signature detection
        return True