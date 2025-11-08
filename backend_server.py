from flask import Flask, request, jsonify
from flask_cors import CORS
from src.model_dispatcher import ModelDispatcher
import base64

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

# Initialize the model dispatcher (supports multiple models)
print("\n" + "="*60)
print("Initializing AI Models...")
print("="*60)
dispatcher = ModelDispatcher()
print("="*60 + "\n")

@app.route('/api/classify', methods=['POST'])
def classify_file():
    """
    Endpoint to classify a single file
    Expects: { filename: string, binaryData: base64 string, model: string (optional) }
    Returns: classification result
    """
    try:
        data = request.json
        filename = data.get('filename')
        binary_data_base64 = data.get('binaryData')
        model = data.get('model', 'signature-based')  # Default to signature-based
        
        if not filename or not binary_data_base64:
            return jsonify({'error': 'Missing filename or binaryData'}), 400
        
        # Decode base64 to bytes
        binary_data = base64.b64decode(binary_data_base64)
        
        # Process through selected model
        result = dispatcher.classify(binary_data, filename, model)
        
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
    Expects: { files: [{ filename: string, binaryData: base64 string }, ...], model: string (optional) }
    Returns: array of classification results
    """
    try:
        data = request.json
        files_data = data.get('files', [])
        model = data.get('model', 'signature-based')  # Default to signature-based
        
        if not files_data:
            return jsonify({'error': 'No files provided'}), 400
        
        print(f"\n📊 Batch classification request: {len(files_data)} files using model '{model}'")
        
        # Process each file with selected model
        results = []
        for file_data in files_data:
            filename = file_data.get('filename')
            binary_data_base64 = file_data.get('binaryData')
            
            if filename and binary_data_base64:
                binary_data = base64.b64decode(binary_data_base64)
                result = dispatcher.classify(binary_data, filename, model)
                results.append(result)
        
        print(f"✅ Batch complete: {len(results)} files classified")
        
        # Convert all results to dicts
        return jsonify({
            'success': True,
            'results': [result.to_dict() for result in results]
        })
        
    except Exception as e:
        print(f"❌ Batch classification error: {e}")
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

if __name__ == '__main__':
    print("Starting AI File Classification API Server...")
    print("Server running on http://localhost:5000")
    print("Endpoints:")
    print("  POST /api/classify - Classify single file")
    print("  POST /api/classify-batch - Classify multiple files (batch)")
    print("  POST /api/classify-zip - Classify all files in ZIP (server-side)")
    print("  GET  /api/health - Health check")
    app.run(debug=True, port=5000)

