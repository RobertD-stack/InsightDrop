# Google Magika AI Integration Guide

## Overview

[Google Magika](https://github.com/google/magika) is a **true AI-powered file type detection system** that uses deep learning to achieve ~99% accuracy across 200+ content types. This guide explains how to integrate it into the file classification system.

## What is Magika?

### Key Features
- 🤖 **Real AI/ML:** Uses Keras models with ONNX runtime (not rule-based!)
- 📊 **High Accuracy:** ~99% average precision and recall
- ⚡ **Fast:** ~5ms inference time per file
- 📚 **Comprehensive:** Trained on 100M+ files
- 🏢 **Production-Ready:** Used by Gmail, Drive, VirusTotal, and Safe Browsing
- 🌐 **Multi-Platform:** Python, Rust, JavaScript/TypeScript, Go bindings

### Comparison with Current System

| Feature | Current (Signature-Based) | Google Magika (AI) |
|---------|---------------------------|-------------------|
| **Technology** | Binary pattern matching | Deep Learning (Keras/ONNX) |
| **Accuracy** | 95-100% (clear signatures) | ~99% (all file types) |
| **Speed** | ~0.15ms per file | ~5ms per file |
| **Training** | No training (hardcoded rules) | Trained on 100M+ files |
| **Content Types** | ~40 types | 200+ types |
| **Text Files** | Poor (ambiguous signatures) | Excellent |
| **Dependencies** | None (python-magic optional) | Required (magika package) |
| **Updates** | Manual code changes | Model updates |

## Installation

### Python Backend

```bash
# Install Magika
pip install magika

# Verify installation
python -c "from magika import Magika; print('Magika installed successfully!')"
```

Add to `requirements.txt`:
```txt
magika>=1.0.0
```

### JavaScript Frontend (Optional)

```bash
npm install magika
```

## Backend Integration

### Step 1: Create Magika Identifier Class

Create new file: `src/file_type_identifier_magika.py`

```python
from magika import Magika
from typing import Dict, Any
from pathlib import Path

class MagikaFileTypeIdentifier:
    def __init__(self):
        """Initialize Magika AI model"""
        try:
            self.magika = Magika()
            self.has_magika = True
            print("✅ Magika AI model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading Magika: {e}")
            self.has_magika = False
    
    def identify(self, binary_data: bytes, filename: str = None) -> Dict[str, Any]:
        """
        Identify file type using Magika AI
        
        Args:
            binary_data: File contents as bytes
            filename: Optional filename
            
        Returns:
            Dictionary with detection results
        """
        if not self.has_magika:
            return {
                'type': 'unknown',
                'extension': None,
                'mime_type': None,
                'confidence_factors': {
                    'magic_match': False,
                    'extension_match': False,
                    'structure_valid': False
                }
            }
        
        try:
            # Use Magika to identify
            result = self.magika.identify_bytes(binary_data)
            
            # Extract detection results
            label = result.output.label
            mime_type = result.output.mime_type
            score = result.score
            description = result.output.description
            
            # Get extension from filename if provided
            extension = None
            if filename:
                extension = Path(filename).suffix.lower().replace('.', '')
            
            # Check if extension matches prediction
            extension_match = False
            if extension and label:
                extension_match = (extension.lower() == label.lower())
            
            return {
                'type': label,
                'extension': extension,
                'mime_type': mime_type,
                'confidence_factors': {
                    'magic_match': True,  # Magika found a match
                    'extension_match': extension_match,
                    'structure_valid': score > 0.5  # High confidence
                },
                'magika_score': score,
                'magika_description': description
            }
            
        except Exception as e:
            print(f"Error in Magika identification: {e}")
            return {
                'type': 'unknown',
                'extension': extension,
                'mime_type': None,
                'confidence_factors': {
                    'magic_match': False,
                    'extension_match': False,
                    'structure_valid': False
                }
            }
```

### Step 2: Update Pipeline to Support Both Models

Modify `src/pipeline.py`:

```python
from src.file_type_identifier import FileTypeIdentifier
from src.file_type_identifier_magika import MagikaFileTypeIdentifier
from src.content_classifier import ContentCategoryClassifier
from src.confidence_scorer import ConfidenceScorer
from src.utils import FileClassificationResult
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import os

class FileClassificationPipeline:
    def __init__(self, model='signature-based'):
        """
        Initialize pipeline with selected model
        
        Args:
            model: 'signature-based' or 'magika-ai'
        """
        self.model = model
        
        # Initialize appropriate identifier
        if model == 'magika-ai':
            self.type_identifier = MagikaFileTypeIdentifier()
            print("🤖 Using Magika AI model")
        else:
            self.type_identifier = FileTypeIdentifier()
            print("🔍 Using signature-based detection")
        
        self.category_classifier = ContentCategoryClassifier()
        self.confidence_scorer = ConfidenceScorer()
    
    def process_file(self, binary_data: bytes, filename: str = None) -> FileClassificationResult:
        """
        Main processing pipeline
        Input: binary file data and optional filename
        Output: FileClassificationResult object
        """
        
        # Step 1: Identify file type
        type_result = self.type_identifier.identify(binary_data, filename)
        
        # Step 2: Classify content category
        content_category = self.category_classifier.classify(
            type_result['type'], 
            binary_data
        )
        
        # Step 3: Calculate confidence score
        confidence = self.confidence_scorer.calculate(
            type_result['confidence_factors'],
            type_result['type']
        )
        
        # Step 4: Build result object
        metadata = {
            'file_size': len(binary_data),
            'filename': filename,
            'analyzed_at': datetime.now().isoformat(),
            'extension': type_result.get('extension'),
            'model_used': self.model
        }
        
        # Add Magika-specific metadata if available
        if self.model == 'magika-ai':
            metadata['magika_score'] = type_result.get('magika_score')
            metadata['magika_description'] = type_result.get('magika_description')
        
        result = FileClassificationResult(
            filetype=type_result['type'],
            content_category=content_category,
            confidence_score=confidence,
            mime_type=type_result.get('mime_type'),
            metadata=metadata
        )
        
        return result
    
    # ... rest of the pipeline code remains the same ...
```

### Step 3: Update Backend Server

Modify `backend_server.py`:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from src.pipeline import FileClassificationPipeline
import base64
import time

app = Flask(__name__)

# Enable CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": False
    }
})

app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024 * 1024  # 2GB

# Initialize pipelines for both models
pipelines = {
    'signature-based': FileClassificationPipeline(model='signature-based'),
    'magika-ai': FileClassificationPipeline(model='magika-ai')
}

@app.route('/api/classify-batch', methods=['POST'])
def classify_batch():
    """
    Endpoint to classify multiple files
    Now supports model selection!
    """
    try:
        start_time = time.time()
        
        data = request.json
        files_data = data.get('files', [])
        model = data.get('model', 'signature-based')  # Get selected model
        
        if not files_data:
            return jsonify({'error': 'No files provided'}), 400
        
        # Select appropriate pipeline
        pipeline = pipelines.get(model, pipelines['signature-based'])
        
        print(f"\n{'='*60}")
        print(f"📊 BATCH CLASSIFICATION REQUEST")
        print(f"{'='*60}")
        print(f"Files in batch: {len(files_data)}")
        print(f"Model: {model}")
        
        # Prepare files for batch processing
        decode_start = time.time()
        files_to_process = []
        for file_data in files_data:
            filename = file_data.get('filename')
            binary_data_base64 = file_data.get('binaryData')
            
            if filename and binary_data_base64:
                binary_data = base64.b64decode(binary_data_base64)
                files_to_process.append((binary_data, filename))
        
        decode_time = time.time() - decode_start
        print(f"⏱️  Base64 decode time: {decode_time:.3f}s")
        
        # Process batch through AI pipeline
        classify_start = time.time()
        results = pipeline.process_batch(files_to_process)
        classify_time = time.time() - classify_start
        
        total_time = time.time() - start_time
        avg_time = classify_time / len(files_to_process) if files_to_process else 0
        
        print(f"⏱️  Classification time: {classify_time:.3f}s")
        print(f"⏱️  Average per file: {avg_time:.4f}s")
        print(f"⏱️  Total processing time: {total_time:.3f}s")
        print(f"✅ Successfully classified {len(results)} files using {model}")
        print(f"{'='*60}\n")
        
        # Convert all results to dicts
        return jsonify({
            'success': True,
            'results': [result.to_dict() for result in results],
            'timing': {
                'total_time': round(total_time, 3),
                'decode_time': round(decode_time, 3),
                'classification_time': round(classify_time, 3),
                'average_per_file': round(avg_time, 4),
                'files_processed': len(results)
            },
            'model_used': model
        })
        
    except Exception as e:
        print(f"❌ Error in batch classification: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ... rest of backend code ...
```

## Frontend Integration

The frontend already supports model selection! The `selectedModel` state is passed to the API:

```typescript
// In FileUploader.tsx
const response = await fetch('http://localhost:5000/api/classify-batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    files: filesData, 
    model: selectedModel  // ← Already passes the selected model!
  })
})
```

## Testing

### Test Magika Installation

```python
from magika import Magika

m = Magika()

# Test with JavaScript code
result = m.identify_bytes(b'function log(msg) {console.log(msg);}')
print(f"Type: {result.output.label}")
print(f"MIME: {result.output.mime_type}")
print(f"Score: {result.score}")
```

### Compare Models

Upload the same files with both models and compare:

1. Select "Signature-Based" → Upload files → Check accuracy
2. Select "Google Magika (AI)" → Upload same files → Check accuracy
3. Compare confidence scores and categories

## Performance Benchmarks

### Expected Performance

| Metric | Signature-Based | Magika AI |
|--------|----------------|-----------|
| Single file | 0.15ms | 5ms |
| 100 files (sequential) | 15ms | 500ms |
| 100 files (parallel, 8 threads) | ~2ms | ~63ms |
| Model load time | 0ms (no model) | ~100ms (one-time) |
| Memory usage | <10MB | ~50MB (model in RAM) |

### When to Use Each Model

**Use Signature-Based When:**
- ✅ Speed is critical
- ✅ Files have clear binary signatures
- ✅ Working with common file types (images, PDFs, videos)
- ✅ No external dependencies allowed
- ✅ Processing millions of files

**Use Magika AI When:**
- ✅ Maximum accuracy needed
- ✅ Working with text files (code, configs, etc.)
- ✅ Ambiguous file types
- ✅ Need to detect 200+ content types
- ✅ Trust is critical (Gmail/Drive level detection)

## Magika Advantages

### Better Text File Detection

Signature-based struggles with text files (they all look similar):
```python
# Current system often fails on:
- .js vs .ts vs .jsx vs .tsx
- .yml vs .yaml vs .txt
- .py vs .pyi
- .c vs .cpp vs .h

# Magika AI excels at these!
```

### More Content Types

Magika supports 200+ content types including:
- Programming languages: Python, JavaScript, TypeScript, Go, Rust, Ruby, PHP, Java, C++, etc.
- Config files: JSON, YAML, TOML, INI, XML, etc.
- Markup: HTML, Markdown, LaTeX, etc.
- Data formats: CSV, Parquet, Protocol Buffers, etc.
- Archives: ZIP, TAR, RAR, 7Z, etc.
- Media: All image, video, audio formats
- Documents: PDF, DOCX, PPTX, XLSX, etc.
- And many more!

## Troubleshooting

### Magika Import Error

```bash
# Error: ModuleNotFoundError: No module named 'magika'
pip install magika

# If still fails, check Python version (requires 3.8+)
python --version
```

### ONNX Runtime Error

```bash
# Error: ONNX Runtime not found
pip install onnxruntime
```

### Model Download Issues

Magika downloads models on first use (~50MB). If behind firewall:
```bash
# Pre-download models
python -c "from magika import Magika; Magika()"
```

## Migration Path

### Phase 1: Add Magika as Option (CURRENT)
- ✅ UI dropdown with both options
- ✅ Signature-based remains default
- ⏳ Backend integration (this guide)

### Phase 2: Test & Compare
- Upload test files with both models
- Compare accuracy metrics
- Benchmark performance
- Gather user feedback

### Phase 3: Optional Switch
- Make Magika default if superior
- Keep signature-based for speed-critical paths
- Or use hybrid: fast signature-based first, fallback to Magika

## Resources

- **GitHub:** https://github.com/google/magika
- **Documentation:** https://google.github.io/magika/
- **Research Paper:** IEEE/ACM ICSE 2025
- **Web Demo:** https://google.github.io/magika/
- **PyPI:** https://pypi.org/project/magika/
- **npm:** https://www.npmjs.com/package/magika

## Summary

Google Magika represents a **real AI/ML upgrade** to the file detection system:

- 🤖 **True AI:** Deep learning, not pattern matching
- 📊 **Higher Accuracy:** ~99% vs ~95%
- 🎯 **More Types:** 200+ vs 40
- 🔬 **Better Text Detection:** Excels where signatures fail
- 🏢 **Production-Proven:** Used by billions at Google

**Current Status:**
- ✅ UI integration complete
- ⏳ Backend integration (follow this guide)
- ⏳ Testing phase
- ⏳ Production deployment decision

---

**Document Version:** 1.0  
**Date:** 2025-11-08  
**Status:** Ready for Implementation

