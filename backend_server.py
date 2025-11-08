from flask import Flask, request, jsonify
from flask_cors import CORS
from src.pipeline import FileClassificationPipeline
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

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

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'AI Classification API is running'})

if __name__ == '__main__':
    print("Starting AI File Classification API Server...")
    print("Server running on http://localhost:5000")
    print("Endpoints:")
    print("  POST /api/classify - Classify single file")
    print("  POST /api/classify-batch - Classify multiple files")
    print("  GET  /api/health - Health check")
    app.run(debug=True, port=5000)

