# OCR Setup for Image PII Detection

## Overview

The PII detection system can extract text from images (PNG, JPG, etc.) using OCR (Optical Character Recognition) to detect sensitive information in images.

## Installation

### macOS
```bash
brew install tesseract
```

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
```

### Windows
1. Download installer from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install Tesseract OCR
3. Add to PATH or set environment variable:
   ```bash
   setx TESSDATA_PREFIX "C:\Program Files\Tesseract-OCR\tessdata"
   ```

## Python Package

The Python package is already in `requirements.txt`:
```bash
pip install pytesseract
```

## Verification

The system will work without OCR, but images won't be scanned for PII. The code gracefully handles missing OCR and will:
- Skip OCR if tesseract is not installed
- Continue processing other files normally
- Show "No PII Detected" for images if OCR fails

## Testing

To test OCR functionality:
1. Create an image with text containing PII (SSN, phone, etc.)
2. Upload the image
3. The system should extract text and detect PII

## Notes

- OCR processing is slower than text file scanning
- Only processes images (PNG, JPG, GIF, BMP, TIFF, WebP)
- Requires tesseract-ocr system package (not just Python package)
- Works best with clear, high-contrast text in images

