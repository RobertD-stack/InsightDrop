# AI File Classifier - Frontend

A modern, responsive web application for automatically identifying and classifying digital files using AI.

## NCAT Fall Hackathon 2025

---

## 🚀 Quick Start

**New to the project?** Choose your guide:

- 📘 **[QUICKSTART.md](QUICKSTART.md)** - Complete beginner? Start here! (5 minutes)
- 📗 **[SETUP.md](SETUP.md)** - Detailed setup instructions with troubleshooting
- 📕 **README.md** - You are here! (Technical overview)

**TL;DR for developers:**
```bash
git clone https://github.com/RobertD-stack/NCATFallHackathon2025.git
cd NCATFallHackathon2025
git checkout Robert
npm install
npm run dev
# Open http://localhost:3000
```

> **Note:** This project works with **any code editor or IDE** (VS Code, Sublime, Notepad++, etc.). You don't need Cursor or any special tools - just Node.js and a browser!

---

### Features

- 🎯 **Drag & Drop Upload** - Easy file upload interface
- 🤖 **AI-Powered Classification** - Automatic file type detection
- 📊 **Detailed Metadata** - File type, category, confidence score, MIME type, encoding, and more
- ⚡ **Real-time Processing** - See results as files are processed
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 🔄 **Batch Processing** - Upload and process multiple files at once

### Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Dropzone** - File upload
- **Lucide React** - Icons

### Getting Started

#### Prerequisites

- Node.js 18+ and npm

#### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

#### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Project Structure

```
src/
├── components/
│   ├── Header.tsx          # App header with branding
│   ├── FileUploader.tsx    # File upload component
│   └── ResultsDisplay.tsx  # Results visualization
├── utils/
│   └── mockBackend.ts      # Mock classification logic
├── types.ts                # TypeScript interfaces
├── App.tsx                 # Main app component
├── main.tsx               # Entry point
└── index.css              # Global styles
```

### Mock Backend

Currently using mock data to simulate backend processing. The mock backend (`src/utils/mockBackend.ts`) classifies files based on:

- File extensions
- MIME types
- Binary signatures (to be implemented with real backend)

### Connecting to Real Backend

To connect to a real backend API, modify the `mockClassifyFile` function in `src/utils/mockBackend.ts`:

```typescript
export const classifyFile = async (file: File): Promise<FileClassification> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('http://your-backend-url/api/classify', {
    method: 'POST',
    body: formData,
  })

  return await response.json()
}
```

### File Categories

- **Media** - Images, videos, audio files
- **Structured** - CSV, JSON, XML, databases
- **Text** - Documents, code files, plain text
- **Executable** - Binary executables, applications
- **Unstructured** - Archives, unknown formats

### Contributing

This project was created for the NCAT Fall Hackathon 2025.

### License

MIT

