# Setup Instructions - AI File Classifier

## Prerequisites

Before you begin, make sure you have the following installed on your computer:

### Required Software:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - This includes npm (Node Package Manager)
   - To check if installed: Open terminal/command prompt and run:
     ```bash
     node --version
     npm --version
     ```

2. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/
   - To check if installed:
     ```bash
     git --version
     ```

3. **A Code Editor** (optional, for viewing/editing code)
   - VS Code: https://code.visualstudio.com/
   - Sublime Text: https://www.sublimetext.com/
   - Notepad++: https://notepad-plus-plus.org/
   - Or any text editor you prefer

4. **A Web Browser**
   - Chrome, Firefox, Edge, Safari, etc.

---

## Step-by-Step Installation

### Step 1: Clone the Repository

Open your terminal/command prompt and run:

```bash
# Clone the repository
git clone https://github.com/RobertD-stack/NCATFallHackathon2025.git

# Navigate into the project directory
cd NCATFallHackathon2025

# Switch to the Robert branch (where the frontend code is)
git checkout Robert
```

**Alternative (if you don't have Git):**
- Download the repository as a ZIP file from GitHub
- Extract the ZIP file to a folder
- Open terminal/command prompt in that folder

### Step 2: Install Dependencies

In the project directory, run:

```bash
npm install
```

This will:
- Download all required packages
- Take 1-3 minutes depending on your internet speed
- Create a `node_modules` folder with all dependencies

**Expected output:**
```
added 283 packages, and audited 284 packages in 54s
```

### Step 3: Start the Development Server

Run:

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 4: Open in Browser

1. Open your web browser
2. Go to: **http://localhost:3000**
3. You should see the AI File Classifier application!

---

## Using the Application

1. **Upload Files:**
   - Drag and drop any file onto the upload area
   - OR click "Select Files" to browse

2. **View Results:**
   - Watch the progress bar as files are processed
   - See detailed classification results below

3. **Test with Different Files:**
   - Try images, videos, documents, code files, etc.
   - The app supports 70+ file types

---

## Common Issues & Solutions

### Issue 1: "node: command not found"
**Solution:** Node.js is not installed
- Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### Issue 2: "npm: command not found"
**Solution:** npm comes with Node.js
- Reinstall Node.js
- Make sure to check "Add to PATH" during installation

### Issue 3: Port 3000 is already in use
**Solution:** Another application is using port 3000
```bash
# Option A: Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill

# Option B: Use a different port
npm run dev -- --port 3001
```

### Issue 4: "EACCES: permission denied"
**Solution:** Run with appropriate permissions
```bash
# Mac/Linux:
sudo npm install

# Windows:
# Run Command Prompt as Administrator
```

### Issue 5: Dependencies won't install
**Solution:** Clear npm cache
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## Available Commands

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter to check code quality
npm run lint
```

---

## Project Structure

```
NCATFallHackathon2025/
├── src/                          # Source code
│   ├── components/               # React components
│   │   ├── Header.tsx           # App header
│   │   ├── FileUploader.tsx     # File upload UI
│   │   └── ResultsDisplay.tsx   # Results display
│   ├── utils/
│   │   └── mockBackend.ts       # Mock classification logic
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── types.ts                 # TypeScript types
├── public/                       # Static assets
├── index.html                   # HTML entry point
├── package.json                 # Dependencies & scripts
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS config
└── README.md                    # Project documentation
```

---

## Building for Production

To create an optimized production build:

```bash
# Build the application
npm run build

# The output will be in the 'dist' folder
# You can deploy this folder to any static hosting service
```

### Deployment Options:

1. **Netlify** (Free)
   - Drag and drop the `dist` folder to https://app.netlify.com/drop

2. **Vercel** (Free)
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **GitHub Pages** (Free)
   ```bash
   npm run build
   # Push the 'dist' folder to gh-pages branch
   ```

4. **Any Web Server**
   - Just upload the `dist` folder contents

---

## System Requirements

**Minimum:**
- OS: Windows 7+, macOS 10.12+, or Linux
- RAM: 2GB
- Storage: 500MB for project + dependencies
- Browser: Any modern browser (Chrome, Firefox, Edge, Safari)

**Recommended:**
- OS: Windows 10+, macOS 10.15+, or modern Linux
- RAM: 4GB+
- Storage: 1GB
- Browser: Latest Chrome or Firefox

---

## Development Environment Setup (Optional)

If you want to edit the code:

### VS Code Extensions (Recommended):

1. **ESLint** - Code quality
2. **Prettier** - Code formatting
3. **Tailwind CSS IntelliSense** - CSS autocomplete
4. **ES7+ React/Redux/React-Native snippets** - React shortcuts

Install via VS Code Extensions marketplace.

### Configure VS Code:

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## Getting Help

If you encounter issues:

1. **Check the error message** in the terminal
2. **Search GitHub Issues**: https://github.com/RobertD-stack/NCATFallHackathon2025/issues
3. **Read the main README.md** for more information
4. **Ask for help** from team members

---

## Next Steps

- ✅ You now have the frontend running!
- 🔄 Try uploading different file types
- 🎨 Customize the UI if needed
- 🔌 Ready to connect to a backend when available

---

## Quick Start Summary

For experienced developers, here's the TL;DR:

```bash
# Clone and setup
git clone https://github.com/RobertD-stack/NCATFallHackathon2025.git
cd NCATFallHackathon2025
git checkout Robert

# Install and run
npm install
npm run dev

# Open http://localhost:3000
```

---

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Dropzone** - File uploads
- **Lucide React** - Icons

No additional tools or IDEs required!

