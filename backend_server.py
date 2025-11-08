from flask import Flask, request, jsonify
from flask_cors import CORS
from src.pipeline import FileClassificationPipeline
import base64
import time

app = Flask(__name__)

# Enable CORS with proper configuration for all methods including FormData
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": False
    }
})

# Configure Flask for large file uploads (2GB max)
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024 * 1024  # 2GB

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
        start_time = time.time()
        
        data = request.json
        filename = data.get('filename')
        binary_data_base64 = data.get('binaryData')
        
        if not filename or not binary_data_base64:
            return jsonify({'error': 'Missing filename or binaryData'}), 400
        
        # Decode base64 to bytes
        decode_start = time.time()
        binary_data = base64.b64decode(binary_data_base64)
        decode_time = time.time() - decode_start
        
        # Process through AI pipeline
        classify_start = time.time()
        result = pipeline.process_file(binary_data, filename)
        classify_time = time.time() - classify_start
        
        total_time = time.time() - start_time
        
        print(f"⏱️  Single file '{filename}': {total_time:.4f}s (decode: {decode_time:.4f}s, classify: {classify_time:.4f}s)")
        
        # Convert to dict and return
        return jsonify({
            'success': True,
            'result': result.to_dict(),
            'timing': {
                'total_time': round(total_time, 4),
                'decode_time': round(decode_time, 4),
                'classification_time': round(classify_time, 4)
            }
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
        start_time = time.time()
        
        data = request.json
        files_data = data.get('files', [])
        
        if not files_data:
            return jsonify({'error': 'No files provided'}), 400
        
        print(f"\n{'='*60}")
        print(f"📊 BATCH CLASSIFICATION REQUEST")
        print(f"{'='*60}")
        print(f"Files in batch: {len(files_data)}")
        
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
        print(f"✅ Successfully classified {len(results)} files")
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
            }
        })
        
    except Exception as e:
        print(f"❌ Error in batch classification: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/classify-zip', methods=['POST'])
def classify_zip():
    """
    Endpoint to classify all files in a ZIP archive (server-side extraction)
    Expects: FormData with 'zipFile' field OR JSON with 'zipData' base64 string
    Returns: array of classification results
    """
    try:
        import zipfile
        import io
        
        print("\n" + "="*60)
        print("📦 ZIP CLASSIFICATION REQUEST RECEIVED")
        print("="*60)
        
        # Check if request is FormData (binary upload) or JSON (base64)
        if 'zipFile' in request.files:
            # FormData upload - better for large files
            zip_file_obj = request.files['zipFile']
            zip_data = zip_file_obj.read()
            print(f"✅ Received binary ZIP via FormData: {len(zip_data) / 1024 / 1024:.2f} MB")
        else:
            # JSON with base64 - for smaller files
            data = request.json
            zip_base64 = data.get('zipData')
            
            if not zip_base64:
                print("❌ Error: Missing zipData in request")
                return jsonify({'error': 'Missing zipData or zipFile'}), 400
            
            print(f"✅ Received base64 data: {len(zip_base64)} characters")
            zip_data = base64.b64decode(zip_base64)
            print(f"✅ Decoded ZIP size: {len(zip_data) / 1024 / 1024:.2f} MB")
        
        zip_file = zipfile.ZipFile(io.BytesIO(zip_data))
        file_list = zip_file.filelist
        total_files = sum(1 for f in file_list if not f.is_dir())
        print(f"✅ ZIP contains {total_files} files (excluding directories)")
        
        results = []
        processed = 0
        
        for file_info in file_list:
            if file_info.is_dir():
                continue
            
            processed += 1
            if processed % 100 == 0 or processed == 1:
                print(f"  Processing file {processed}/{total_files}: {file_info.filename}")
            
            try:
                # Extract and classify file
                file_data = zip_file.read(file_info.filename)
                result = pipeline.process_file(file_data, file_info.filename)
                
                result_dict = result.to_dict()
                result_dict['original_path'] = file_info.filename
                results.append(result_dict)
            except Exception as e:
                # Continue processing other files even if one fails
                print(f"⚠️  Error processing {file_info.filename}: {e}")
                results.append({
                    'filetype': 'error',
                    'content_category': 'unknown',
                    'confidence_score': 0.0,
                    'metadata': {'error': str(e), 'filename': file_info.filename},
                    'original_path': file_info.filename
                })
        
        print(f"✅ Successfully processed {len(results)} files")
        print("="*60 + "\n")
        
        return jsonify({
            'success': True,
            'results': results,
            'total_processed': len(results)
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

@app.route('/api/branch', methods=['GET'])
def get_branch():
    """Get current git branch name"""
    try:
        import subprocess
        result = subprocess.run(
            ['git', 'branch', '--show-current'],
            capture_output=True,
            text=True,
            cwd='.',
            timeout=5
        )
        branch_name = result.stdout.strip() if result.returncode == 0 else 'unknown'
        return jsonify({'branch': branch_name})
    except Exception as e:
        print(f"Error getting branch: {e}")
        return jsonify({'branch': 'unknown'})

if __name__ == '__main__':
    print("Starting AI File Classification API Server...")
    print("Server running on http://localhost:5000")
    print("Endpoints:")
    print("  POST /api/classify - Classify single file")
    print("  POST /api/classify-batch - Classify multiple files (batch)")
    print("  POST /api/classify-zip - Classify all files in ZIP (server-side)")
    print("  GET  /api/health - Health check")
    print("  GET  /api/branch - Get current git branch")
    app.run(debug=True, port=5000)

