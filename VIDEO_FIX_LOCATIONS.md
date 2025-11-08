# Code Locations: Handling Unstructured Video Files

This document shows where the code handles videos that were previously being classified as "unstructured".

## 🔍 Key Files Modified

### 1. **`src/file_type_identifier.py`** - Video Extension Detection

**Location:** Lines 60-81

**What it does:** Adds video extensions to the trusted extensions list so videos are properly identified even without magic number signatures.

```python
# Method 4: If no detection yet, trust the extension for known types
if (results['type'] == 'unknown' or results['type'] == 'txt') and extension:
    # List of extensions we trust (including media files)
    trusted_extensions = [
        # ... other types ...
        # Videos  ← THIS IS WHERE VIDEOS ARE ADDED
        'mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm', 'mpeg', 'mpg', 'm4v',
        # ... other types ...
    ]
    if extension in trusted_extensions:
        results['type'] = extension
        results['confidence_factors']['extension_match'] = True
        results['confidence_factors']['structure_valid'] = True
```

**Why it matters:** Without this, videos without magic number signatures would be classified as "unknown" → "unstructured".

---

### 2. **`src/confidence_scorer.py`** - Higher Confidence for Videos

**Location:** Lines 25-32

**What it does:** Gives videos (and other media files) higher confidence scores when detected by extension.

```python
# Higher confidence for media files detected by extension
# Videos, images, and audio files are usually correctly identified by extension
media_types = ['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm', 'mpeg', 'mpg', 'm4v',
              'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff',
              'mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus']
if filetype in media_types and confidence_factors.get('extension_match', False):
    # Media files with matching extension get high confidence
    score = max(score, 0.70)  # At least 70% for media files with extension match
```

**Why it matters:** This ensures videos get 70%+ confidence instead of 5-10%, so they show proper scores instead of "N/A".

---

### 3. **`src/utils.py`** - Video Category Mapping

**Location:** Lines 27-32, 51-54

**What it does:** Maps video file types to the "video" category (not "unstructured").

```python
# File type to category mapping
CATEGORY_MAP = {
    # Media files
    'image': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff', 'ico'],
    'video': ['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm', 'mpeg', 'mpg'],  ← VIDEOS MAPPED HERE
    'audio': ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus'],
    # ... other categories ...
}

# Reverse mapping for quick lookup
FILETYPE_TO_CATEGORY = {}
for category, filetypes in CATEGORY_MAP.items():
    for ft in filetypes:
        FILETYPE_TO_CATEGORY[ft.lower()] = category  ← THIS CREATES THE LOOKUP
```

**Why it matters:** This is what determines if a file is categorized as "video" vs "unstructured".

---

### 4. **`src/file_type_identifier.py`** - Video Signature Detection

**Location:** Lines 134-160

**What it does:** Detects video files by their binary signatures (magic numbers).

```python
# Check for MP4 (signature at offset 4)
if len(binary_data) >= 12 and b'ftyp' in binary_data[4:12]:
    return 'mp4'

# Check for QuickTime/MOV (can start with various atoms)
if len(binary_data) >= 8:
    if binary_data[4:8] in [b'ftyp', b'mdat', b'moov', b'pnot', b'udta', b'cmov']:
        if b'qt  ' in binary_data[8:20] or b'mp4' in binary_data[8:20]:
            return 'mov'

# Check for RIFF-based formats (WAV, AVI)
if binary_data[:4] == b'RIFF' and len(binary_data) >= 12:
    if binary_data[8:12] == b'AVI ':
        return 'avi'

# Check for EBML-based formats (WebM, MKV)
if len(binary_data) >= 4 and binary_data[:4] == b'\x1a\x45\xdf\xa3':
    return 'webm'  # Default to webm, extension will override for .mkv

# Check for FLV (Flash Video)
if len(binary_data) >= 3 and binary_data[:3] == b'FLV':
    return 'flv'
```

**Why it matters:** Primary detection method for videos. If this fails, extension-based detection (Method 4) kicks in.

---

### 5. **`src/file_type_identifier.py`** - MIME Type Mapping for Videos

**Location:** Lines 184-204

**What it does:** Maps MIME types to video file extensions.

```python
def _mime_to_filetype(self, mime_type: str) -> str:
    mime_map = {
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
        # ... other types ...
    }
    return mime_map.get(mime_type, mime_type.split('/')[-1])
```

**Why it matters:** If the magic library detects a video MIME type, this converts it to the file extension.

---

## 🔄 How It All Works Together

### Flow for a Video File:

1. **File comes in** → `file_type_identifier.identify()`

2. **Try signature detection** (lines 134-160)
   - If MP4/MOV/AVI/WebM/FLV signature found → set type, mark as magic_match ✅
   - If not found → continue

3. **Try MIME type detection** (lines 48-58)
   - If magic library detects video MIME → convert to extension ✅
   - If not found → continue

4. **Try extension-based detection** (lines 60-81) ← **KEY FIX**
   - If extension is in `trusted_extensions` (includes videos) → set type ✅
   - Mark as `extension_match` and `structure_valid` ✅

5. **Category classification** → `content_classifier.classify()`
   - Look up filetype in `FILETYPE_TO_CATEGORY` (from `utils.py`)
   - If video extension → return "video" ✅ (not "unstructured")

6. **Confidence scoring** → `confidence_scorer.calculate()`
   - If video + extension_match → minimum 70% confidence ✅
   - Otherwise → 5-10% confidence ❌

---

## 📊 Before vs After

### Before (Videos as Unstructured):
- Video file → No signature → Unknown type → Unstructured category → 5% confidence → Shows "N/A"

### After (Videos Properly Classified):
- Video file → Extension in trusted list → Video type → Video category → 70%+ confidence → Shows "70.0%"

---

## 🎯 Summary

**Main Fix Locations:**
1. ✅ **`file_type_identifier.py` line 70** - Added videos to `trusted_extensions`
2. ✅ **`confidence_scorer.py` line 27-32** - Higher confidence for media files
3. ✅ **`utils.py` line 31** - Video types mapped to "video" category

**Result:** Videos are now properly classified as "video" with 70%+ confidence instead of "unstructured" with 5-10% confidence.

