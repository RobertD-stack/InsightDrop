# Quick Start Guide - 5 Minutes to Running

## For Complete Beginners

### What You Need:
1. A computer (Windows, Mac, or Linux)
2. Internet connection
3. 10 minutes of time

---

## Step 1: Install Node.js (5 minutes)

### Windows:
1. Go to: https://nodejs.org/
2. Click the big green "LTS" button
3. Run the downloaded installer
4. Click "Next" through all steps
5. Restart your computer

### Mac:
1. Go to: https://nodejs.org/
2. Click the big green "LTS" button
3. Open the downloaded file
4. Follow the installation wizard
5. Restart your terminal

### Linux:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# Fedora
sudo dnf install nodejs npm
```

### Verify Installation:
Open terminal/command prompt and type:
```bash
node --version
```
You should see something like: `v18.17.0`

---

## Step 2: Download the Project (2 minutes)

### Option A: Using Git (if you have it)
```bash
git clone https://github.com/RobertD-stack/NCATFallHackathon2025.git
cd NCATFallHackathon2025
git checkout Robert
```

### Option B: Download ZIP (easier)
1. Go to: https://github.com/RobertD-stack/NCATFallHackathon2025
2. Click the green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file to your Desktop or Documents folder
5. Open terminal/command prompt
6. Navigate to the extracted folder:
   ```bash
   # Example (adjust path to where you extracted):
   cd Desktop/NCATFallHackathon2025
   ```

---

## Step 3: Install & Run (3 minutes)

In the terminal/command prompt, type these commands:

```bash
# Install dependencies (takes 1-2 minutes)
npm install

# Start the app
npm run dev
```

You'll see:
```
➜  Local:   http://localhost:3000/
```

---

## Step 4: Open in Browser

1. Open your web browser (Chrome, Firefox, Edge, Safari)
2. Type in the address bar: `localhost:3000`
3. Press Enter

**🎉 You're done! The app is running!**

---

## How to Use:

1. **Drag a file** from your computer onto the upload area
2. **Watch** as it processes (fake animation)
3. **See results** showing file type, category, confidence score

Try uploading:
- A photo (`.jpg`, `.png`)
- A video (`.mp4`)
- A document (`.pdf`, `.txt`)
- Any file on your computer!

---

## To Stop the App:

In the terminal, press: `Ctrl + C`

## To Start Again Later:

```bash
# Navigate to project folder
cd path/to/NCATFallHackathon2025

# Start the app
npm run dev
```

---

## Troubleshooting

### "Command not found" error?
- Node.js isn't installed correctly
- Restart your computer after installing Node.js
- Make sure you checked "Add to PATH" during installation

### Port 3000 already in use?
- Close any other apps using port 3000
- Or run: `npm run dev -- --port 3001`
- Then open: `localhost:3001`

### Nothing happens when I run npm run dev?
- Wait 10-20 seconds, it takes time to start
- Make sure you're in the right folder (`NCATFallHackathon2025`)
- Check that `npm install` finished successfully

### Still not working?
- See detailed instructions in `SETUP.md`
- Or ask a team member for help

---

## That's It!

You don't need:
- ❌ Cursor IDE
- ❌ Any special software
- ❌ Programming knowledge
- ❌ A backend server

You just need:
- ✅ Node.js
- ✅ A web browser
- ✅ This project folder

**Total time: ~10 minutes**

---

## Visual Guide

```
1. Install Node.js
   ↓
2. Download Project
   ↓
3. Open Terminal in Project Folder
   ↓
4. Run: npm install
   ↓
5. Run: npm run dev
   ↓
6. Open: http://localhost:3000
   ↓
7. Start Uploading Files! 🎉
```

---

## Next Steps

- Read `README.md` for more details
- Read `SETUP.md` for troubleshooting
- Start customizing the app
- Connect to a real backend (optional)

**Happy Hacking!** 🚀

