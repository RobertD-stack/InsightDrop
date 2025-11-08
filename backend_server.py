from flask import Flask, request, jsonify
from flask_cors import CORS
from src.pipeline import FileClassificationPipeline
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configure for large file processing (5000+ files)
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 1024  # 1GB max request size
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# Initialize the AI pipeline
pipeline = FileClassificationPipeline()

@app.route('/api/classify', methods=['POST'])
def classify_file():
    """
    Endpoint to classify a single file
    Expects: { filename: string, binaryData: base64 string }
    Returns: classification result
    """
    try:
        data = request.json
        filename = data.get('filename')
        binary_data_base64 = data.get('binaryData')
        
        if not filename or not binary_data_base64:
            return jsonify({'error': 'Missing filename or binaryData'}), 400
        
        # Decode base64 to bytes
        binary_data = base64.b64decode(binary_data_base64)
        
        # Process through AI pipeline
        result = pipeline.process_file(binary_data, filename)
        
        # Convert to dict and return
        return jsonify({
            'success': True,
            'result': result.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/classify-batch', methods=['POST'])
def classify_batch():
    """
    Endpoint to classify multiple files
    Expects: { files: [{ filename: string, binaryData: base64 string }, ...] }
    Returns: array of classification results
    """
    try:
        data = request.json
        files_data = data.get('files', [])
        
        if not files_data:
            return jsonify({'error': 'No files provided'}), 400
        
        # Prepare files for batch processing
        files_to_process = []
        for file_data in files_data:
            filename = file_data.get('filename')
            binary_data_base64 = file_data.get('binaryData')
            
            if filename and binary_data_base64:
                binary_data = base64.b64decode(binary_data_base64)
                files_to_process.append((binary_data, filename))
        
        # Process batch through AI pipeline
        results = pipeline.process_batch(files_to_process)
        
        # Convert all results to dicts
        return jsonify({
            'success': True,
            'results': [result.to_dict() for result in results]
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/classify-zip', methods=['POST'])
def classify_zip():
    """
    Endpoint to classify all files in a ZIP archive (server-side extraction)
    Expects: { zipData: base64 string }
    Returns: array of classification results
    """
    try:
        import zipfile
        import io
        
        print("\n" + "="*60)
        print("📦 ZIP CLASSIFICATION REQUEST RECEIVED")
        print("="*60)
        
        data = request.json
        zip_base64 = data.get('zipData')
        
        if not zip_base64:
            print("❌ Error: Missing zipData in request")
            return jsonify({'error': 'Missing zipData'}), 400
        
        print(f"✅ Received base64 data: {len(zip_base64)} characters")
        
        # Decode ZIP
        try:
            zip_data = base64.b64decode(zip_base64)
        except Exception as e:
            print(f"❌ Error: Failed to decode base64 - {e}")
            return jsonify({
                'success': False,
                'error': f'Invalid base64 data: {str(e)}'
            }), 400
        
        print(f"✅ Decoded ZIP size: {len(zip_data) / 1024 / 1024:.2f} MB")
        
        # Debug: Show first bytes to help diagnose
        if len(zip_data) > 0:
            first_bytes = zip_data[:min(20, len(zip_data))]
            print(f"🔍 First bytes (hex): {first_bytes.hex()}")
            print(f"🔍 First bytes (ascii): {first_bytes[:10]}")
        
        # Validate ZIP file signature before attempting to open
        if len(zip_data) < 4:
            print(f"❌ Error: File too small ({len(zip_data)} bytes)")
            return jsonify({
                'success': False,
                'error': f'File is too small to be a valid ZIP file ({len(zip_data)} bytes).'
            }), 400
        
        if zip_data[:2] != b'PK':
            print(f"❌ Error: File does not have ZIP signature. First 2 bytes: {zip_data[:2]}")
            # Try to identify what type of file it might be
            detected_type = "unknown"
            if zip_data[:4] == b'Rar!':
                detected_type = "RAR archive"
            elif zip_data[:2] == b'\x1f\x8b':
                detected_type = "GZIP archive"
            elif zip_data[:4] == b'7z\xbc\xaf':
                detected_type = "7-Zip archive"
            
            return jsonify({
                'success': False,
                'error': f'File is not a valid ZIP file. ZIP files must start with "PK" signature. Detected format: {detected_type}'
            }), 400
        
        # Try to open as ZIP file
        try:
            zip_file = zipfile.ZipFile(io.BytesIO(zip_data))
        except zipfile.BadZipFile as e:
            print(f"❌ Error: Invalid ZIP file format - {e}")
            return jsonify({
                'success': False,
                'error': f'File is not a valid ZIP archive. The file may be corrupted or in a different format. Error: {str(e)}'
            }), 400
        file_list = zip_file.filelist
        total_files = sum(1 for f in file_list if not f.is_dir())
        print(f"✅ ZIP contains {total_files} files (excluding directories)")
        
        results = []
        processed = 0
        errors = 0
        
        # Process files with progress updates
        for file_info in file_list:
            if file_info.is_dir():
                continue
            
            processed += 1
            # More frequent progress updates for large batches
            if processed % 50 == 0 or processed == 1 or processed == total_files:
                progress_pct = (processed / total_files) * 100
                print(f"  Processing file {processed}/{total_files} ({progress_pct:.1f}%): {file_info.filename[:50]}")
            
            try:
                # Extract and classify file
                file_data = zip_file.read(file_info.filename)
                result = pipeline.process_file(file_data, file_info.filename)
                
                result_dict = result.to_dict()
                result_dict['original_path'] = file_info.filename
                results.append(result_dict)
            except Exception as e:
                # Continue processing other files even if one fails
                errors += 1
                if errors <= 10:  # Only print first 10 errors to avoid spam
                    print(f"⚠️  Error processing {file_info.filename}: {e}")
                elif errors == 11:
                    print(f"⚠️  (Suppressing further error messages...)")
                results.append({
                    'filetype': 'error',
                    'content_category': 'unknown',
                    'confidence_score': 0.0,
                    'metadata': {'error': str(e), 'filename': file_info.filename},
                    'original_path': file_info.filename
                })
        
        success_count = len(results) - errors
        print(f"✅ Successfully processed {success_count}/{total_files} files")
        if errors > 0:
            print(f"⚠️  {errors} files had errors during processing")
        print("="*60 + "\n")
        
        return jsonify({
            'success': True,
            'results': results,
            'total_processed': len(results),
            'total_files': total_files,
            'successful': success_count,
            'errors': errors
        })
        
    except Exception as e:
        print(f"❌ CRITICAL ERROR in classify_zip: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'AI Classification API is running'})

if __name__ == '__main__':
    print("Starting AI File Classification API Server...")
    print("Server running on http://localhost:5001")
    print("Configuration:")
    print(f"  Max request size: {app.config['MAX_CONTENT_LENGTH'] / (1024*1024):.0f} MB")
    print("Endpoints:")
    print("  POST /api/classify - Classify single file")
    print("  POST /api/classify-batch - Classify multiple files (batch)")
    print("  POST /api/classify-zip - Classify all files in ZIP (server-side)")
    print("  GET  /api/health - Health check")
    print("\n💡 Optimized for processing 5000+ files in ZIP archives")
    app.run(debug=True, port=5001, threaded=True)

