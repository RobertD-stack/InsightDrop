# AI File Classifier 🤖📁

An intelligent file classification system that uses AI to identify and categorize files by analyzing binary signatures and content. Built for the NCAT Fall Hackathon 2025.

## 🚀 Quick Start (Easiest Way)

### **Windows:**

**Option 1: PowerShell Script (Recommended)**
```powershell
.\start.ps1
```

**Option 2: Batch File**
```cmd
start.bat
```

Both scripts will:
- ✅ Check for Python and Node.js
- ✅ Start the backend server (Flask)
- ✅ Start the frontend server (Vite)
- ✅ Open your browser automatically
- ✅ Show you the application at `http://localhost:3000`

Press `Ctrl+C` in the script window to stop all servers.

---

## 📋 Manual Setup

If you prefer to start servers manually:

### **1. Install Dependencies**

```bash
# Python dependencies
pip install -r requirements.txt

# Frontend dependencies
npm install
```

### **2. Start Backend (Terminal 1)**

```bash
python backend_server.py
```

✅ Backend running on **http://localhost:5000**

### **3. Start Frontend (Terminal 2)**

```bash
npm run dev
```

✅ Frontend running on **http://localhost:3000**

---

## 🎯 Features

- **AI File Classification** - Automatically identifies file types using binary signatures
- **Content Categorization** - Groups files into categories (media, documents, executables, etc.)
- **Confidence Scoring** - Shows how confident the AI is about each classification
- **ZIP Extraction** - Extracts and classifies all files within ZIP archives
- **Batch Processing** - Process thousands of files efficiently
- **Performance Metrics** - Real-time timing logs for optimization
- **Multiple AI Models** - Choose between different classification approaches

---

## 📦 Testing

A test pack with **5,000 diverse files** is included:

```
downloads-test-pack.zip
```

**Contains:**
- 1,000 JPEG images
- 800 PNG images
- 500 GIF animations
- 600 PDF documents
- 300 ZIP archives
- 200 executables
- 250 MP3 audio files
- 250 MP4 videos
- 300 Word documents
- 200 Excel spreadsheets
- Plus TXT, JSON, and CSV files!

**To generate more test files:**
```powershell
.\generate_test_files.ps1
```

---

## 🔧 Technology Stack

### **Backend:**
- Python 3.14+
- Flask (Web Server)
- python-magic-bin (File Signature Detection)
- PyPDF2 (PDF Analysis)
- Pillow (Image Processing)

### **Frontend:**
- React 18
- TypeScript
- Vite (Build Tool)
- Tailwind CSS (Styling)
- JSZip (Client-side ZIP Extraction)

---

## 📊 AI Models

Choose from 4 classification models:

1. **Signature-Based** (Fast) - Uses binary magic numbers
2. **Magic Library** (Accurate) - Uses python-magic for deep analysis
3. **Hybrid** (Balanced) - Combines multiple approaches
4. **ML-Enhanced** (Experimental) - Machine learning augmented

---

## ⏱️ Performance Metrics

The system tracks and displays:
- **Base64 decode time** - Time to convert uploaded data
- **Classification time** - Time for AI analysis
- **Average per file** - Performance per file
- **Total processing time** - End-to-end timing

**Example output:**
```
============================================================
📊 BATCH CLASSIFICATION REQUEST
============================================================
Files in batch: 50
⏱️  Base64 decode time: 0.123s
⏱️  Classification time: 2.456s
⏱️  Average per file: 0.0491s (49.1ms)
⏱️  Total processing time: 2.579s
✅ Successfully classified 50 files
============================================================
```

---

## 📁 Project Structure

```
NCATFallHackathon2025/
├── start.ps1                   # Startup script (PowerShell)
├── start.bat                   # Startup script (Batch)
├── backend_server.py           # Flask API server
├── generate_test_files.ps1     # Test file generator
├── downloads-test-pack.zip     # 5,000 test files
├── src/                        # Python AI modules
│   ├── pipeline.py            # Classification pipeline
│   ├── file_type_identifier.py
│   ├── content_classifier.py
│   ├── confidence_scorer.py
│   └── utils.py
├── src/                        # React frontend
│   ├── App.tsx
│   ├── components/
│   │   ├── FileUploader.tsx
│   │   ├── ResultsDisplay.tsx
│   │   └── Header.tsx
│   └── types.ts
└── tests/test_files/           # Sample test files
```

---

## 🛠️ API Endpoints

### `POST /api/classify`
Classify a single file

### `POST /api/classify-batch`
Classify multiple files at once (includes timing metrics)

### `POST /api/classify-zip`
Server-side ZIP extraction and classification

### `GET /api/health`
Health check endpoint

---

## 🐛 Troubleshooting

### Backend won't start
- Ensure Python 3.8+ is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check if port 5000 is available

### Frontend won't connect to backend
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify `http://localhost:5000/api/health` returns a response

### Startup script issues
- Run PowerShell as Administrator if needed
- Ensure execution policy allows scripts: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

---

## 👥 Team

Built for NCAT Fall Hackathon 2025

---

## 📝 License

MIT License - Feel free to use and modify!

---

## 🎓 How It Works

1. **Upload** - User selects files or ZIP archives
2. **Extract** - ZIP files are automatically extracted
3. **Convert** - Files converted to binary data
4. **Analyze** - AI examines binary signatures and content
5. **Classify** - System identifies file type and category
6. **Score** - Confidence score calculated
7. **Display** - Results shown in beautiful UI with performance metrics

---

**Ready to classify some files?** Run `.\start.ps1` and go! 🚀

