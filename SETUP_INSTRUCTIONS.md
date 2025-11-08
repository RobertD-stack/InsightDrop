# AI File Classification System - Setup Instructions

This application combines a React frontend with a Python AI backend to classify files and extract ZIP archives.

## 🎯 Features

- **AI File Classification** - Automatically identifies file types using binary signatures
- **ZIP Extraction** - Extracts and classifies all files within ZIP archives
- **Confidence Scoring** - Shows how confident the AI is about each classification
- **Content Categorization** - Groups files into categories (media, structured, document, executable, etc.)

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**

## 🚀 Installation & Setup

### Step 1: Install Python Dependencies

```bash
pip install -r requirements.txt
```

The requirements include:
- `flask` - Web server for AI API
- `flask-cors` - Enable frontend to backend communication
- `python-magic-bin` - File type detection
- `pillow` - Image processing
- `PyPDF2` - PDF analysis
- `chardet` - Character encoding detection
- `langdetect` - Language detection

### Step 2: Install Frontend Dependencies

```bash
npm install
```

This installs:
- React, TypeScript, Vite
- JSZip for ZIP extraction
- TailwindCSS for styling
- Lucide React for icons

## 🎬 Running the Application

### Terminal 1: Start the Python AI Backend

```bash
python backend_server.py
```

The backend API will start on **http://localhost:5000**

You should see:
```
Starting AI File Classification API Server...
Server running on http://localhost:5000
Endpoints:
  POST /api/classify - Classify single file
  POST /api/classify-batch - Classify multiple files
  GET  /api/health - Health check
```

### Terminal 2: Start the React Frontend

```bash
npm run dev
```

The frontend will start on **http://localhost:5173**

## 📖 How to Use

1. **Open your browser** to `http://localhost:5173`
2. **Upload files** by:
   - Dragging and dropping files onto the upload area
   - Clicking "Select Files" to browse your computer
   - Uploading ZIP archives to extract and classify all contained files
3. **View Results**:
   - File Type (detected by AI)
   - Category (media, structured, document, etc.)
   - Confidence Score (how sure the AI is)
   - File Size and metadata
4. **Expand Details** - Click "Show Classification Details" to see additional metadata

## 🔧 API Endpoints

### POST /api/classify
Classify a single file
```json
{
  "filename": "document.pdf",
  "binaryData": "base64_encoded_binary_data"
}
```

### POST /api/classify-batch
Classify multiple files at once
```json
{
  "files": [
    {
      "filename": "file1.jpg",
      "binaryData": "base64_data"
    },
    {
      "filename": "file2.pdf",
      "binaryData": "base64_data"
    }
  ]
}
```

### GET /api/health
Check if the API is running

## 📁 Project Structure

```
NCATFallHackathon2025/
├── backend_server.py          # Flask API server
├── main.py                    # Python CLI test tool
├── src/                       # Python AI modules
│   ├── pipeline.py           # Classification pipeline
│   ├── file_type_identifier.py
│   ├── content_classifier.py
│   ├── confidence_scorer.py
│   └── utils.py
├── src/                       # React frontend
│   ├── App.tsx
│   ├── components/
│   │   ├── FileUploader.tsx
│   │   └── ResultsDisplay.tsx
│   └── types.ts
├── tests/test_files/          # Sample test files
└── requirements.txt           # Python dependencies

## 🧪 Testing the AI Classifier (Python Only)

You can test the AI classifier without the frontend:

```bash
python main.py
```

This will process all files in `tests/test_files/` and display classification results.

## 🐛 Troubleshooting

### Backend won't start
- Make sure Python 3.8+ is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check if port 5000 is available

### Frontend won't connect to backend
- Make sure backend is running on port 5000
- Check browser console for CORS errors
- Verify `http://localhost:5000/api/health` returns a response

### ZIP extraction not working
- Make sure jszip is installed: `npm install jszip`
- Check browser console for errors

## 📊 Supported File Types

The AI can identify:
- **Images**: JPG, PNG, GIF, BMP, SVG, WebP
- **Documents**: PDF, DOC, DOCX, TXT, CSV
- **Media**: MP3, MP4, AVI, WAV
- **Code**: JS, TS, PY, JAVA, CPP, HTML, CSS
- **Archives**: ZIP, RAR, 7Z, TAR, GZ
- **Executables**: EXE, DLL, SO
- And many more!

## 🎓 How It Works

1. **File Upload** - User selects files or ZIP archives
2. **Binary Conversion** - Files are read as binary data (Uint8Array)
3. **ZIP Extraction** (if applicable) - JSZip extracts all nested files
4. **API Call** - Binary data sent to Python backend
5. **AI Analysis**:
   - Magic number detection (file signatures)
   - MIME type identification
   - Content structure validation
   - Confidence scoring (weighted algorithm)
6. **Results Display** - Classification results shown in React UI

## 📝 License

MIT License - Feel free to use and modify!

