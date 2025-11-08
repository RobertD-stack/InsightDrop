# AI Models Setup Guide

The application supports 3 different classification models. One works out of the box, and two require additional setup.

## 🎯 **Available Models:**

### **1. Signature Detection (Default)** ✅ Works Immediately

**What it is:**
- Binary signature/magic number detection
- File extension analysis
- Built-in Python libraries only

**Setup:** None required - works out of the box!

**Best for:**
- Fast processing
- No API keys needed
- Works offline
- Most common file types

**Accuracy:** 85-95% for standard files

---

### **2. Google Gemini (Flagship AI Model)** 🌟

**What it is:**
- Google's multimodal AI model
- Analyzes file content intelligently
- Better for ambiguous/complex files

**Setup:**

1. **Get a Free API Key:**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Click "Create API Key"
   - Copy your key

2. **Install the Package:**
   ```bash
   pip install google-generativeai
   ```

3. **Set Environment Variable:**
   
   **Windows (PowerShell):**
   ```powershell
   $env:GEMINI_API_KEY = "your-api-key-here"
   ```
   
   **Mac/Linux:**
   ```bash
   export GEMINI_API_KEY="your-api-key-here"
   ```
   
   **Or create `.env` file:**
   ```
   GEMINI_API_KEY=your-api-key-here
   ```

4. **Restart Backend:**
   ```bash
   python backend_server.py
   ```
   
   You should see: `✅ Google Gemini model initialized`

**Free Tier:**
- 60 requests/minute
- 1,500 requests/day
- More than enough for most use cases!

**Best for:**
- Text files (code, documents)
- Content analysis
- Ambiguous file types

**Accuracy:** 90-98% for text files

---

### **3. Ollama + Llama 3.2 (Open Source Local)** 🔓

**What it is:**
- Runs completely on YOUR computer
- 100% private - no data sent externally
- Meta's Llama 3.2 model (open source)
- No API keys needed

**Setup:**

1. **Install Ollama:**
   - Go to: https://ollama.com/download
   - Download for your OS (Windows/Mac/Linux)
   - Run installer

2. **Pull Llama 3.2 Model:**
   ```bash
   ollama pull llama3.2
   ```
   
   This downloads ~2GB model to your computer

3. **Install Python Package:**
   ```bash
   pip install ollama
   ```

4. **Verify Ollama is Running:**
   ```bash
   ollama list
   ```
   
   Should show `llama3.2` in the list

5. **Restart Backend:**
   ```bash
   python backend_server.py
   ```
   
   You should see: `✅ Ollama is running and available`

**Free Forever:**
- Runs locally on your machine
- No rate limits
- No API keys
- Completely private

**Best for:**
- Privacy-sensitive files
- Offline usage
- No API costs
- Text/code files

**Accuracy:** 85-95% for text files

**Note:** Requires ~4GB RAM and takes ~1-2 seconds per file (slower than other methods)

---

## 📊 **Model Comparison:**

| Feature | Signature | Gemini | Ollama |
|---------|-----------|--------|--------|
| **Setup** | None | API Key | Install |
| **Speed** | ⚡ Fast | 🚀 Very Fast | 🐌 Slow |
| **Accuracy** | 85-95% | 90-98% | 85-95% |
| **Cost** | Free | Free (60/min) | Free |
| **Privacy** | Local | Cloud | Local |
| **Offline** | ✅ Yes | ❌ No | ✅ Yes |
| **Best For** | All files | Text files | Privacy |

---

## 🚀 **Quick Start:**

### **No Setup (Signature Detection):**
```bash
python backend_server.py
npm run dev
```
✅ Works immediately!

### **With Gemini:**
```bash
export GEMINI_API_KEY="your-key"
pip install google-generativeai
python backend_server.py
```

### **With Ollama:**
```bash
ollama pull llama3.2
pip install ollama
python backend_server.py
```

---

## 🔧 **Troubleshooting:**

### **Gemini Not Working?**
- Check API key is set: `echo $env:GEMINI_API_KEY`
- Verify package installed: `pip list | grep google`
- Check free tier limits: https://ai.google.dev/pricing

### **Ollama Not Working?**
- Is Ollama running? `ollama list`
- Is model downloaded? Should see `llama3.2`
- Check Ollama logs: `ollama logs`

### **All Models Show Same Results?**
- Models enhance signature-based detection
- For binary files (images, executables), results may be similar
- Difference is most visible for text/code files

---

## 💡 **Recommendations:**

**For Hackathon/Demo:**
- Use **Signature Detection** (no setup required)

**For Production/Accuracy:**
- Use **Gemini** (best accuracy, easy setup)

**For Privacy/Offline:**
- Use **Ollama** (fully local, no cloud)

**For Maximum Accuracy:**
- Try all three and compare results!

