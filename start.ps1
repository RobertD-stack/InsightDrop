# AI File Classifier - Startup Script
# Starts both backend and frontend servers automatically

Write-Host ""
Write-Host "=========================================="
Write-Host "  AI FILE CLASSIFIER - STARTUP SCRIPT"
Write-Host "=========================================="
Write-Host ""

# Refresh PATH to ensure Python is accessible
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Check if Python is available
Write-Host "Checking dependencies..."
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python: $pythonVersion"
} catch {
    Write-Host "❌ Python not found! Please install Python 3.8 or higher."
    Write-Host "   Download from: https://www.python.org/downloads/"
    pause
    exit 1
}

# Check if Node is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion"
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js."
    Write-Host "   Download from: https://nodejs.org/"
    pause
    exit 1
}

Write-Host ""
Write-Host "Starting servers..."
Write-Host ""

# Kill any existing processes on the ports
Write-Host "Cleaning up old processes..."
$backendPID = (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess
if ($backendPID) {
    Stop-Process -Id $backendPID -Force -ErrorAction SilentlyContinue
    Write-Host "  Stopped old backend server"
}

$frontendPID = (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess
if ($frontendPID) {
    Stop-Process -Id $frontendPID -Force -ErrorAction SilentlyContinue
    Write-Host "  Stopped old frontend server"
}

Start-Sleep -Seconds 1

# Start Backend (Python/Flask)
Write-Host ""
Write-Host "🐍 Starting Backend Server (Python/Flask)..."
$backendJob = Start-Process python -ArgumentList "backend_server.py" -WindowStyle Normal -PassThru
Write-Host "   Backend starting on http://localhost:5000"
Start-Sleep -Seconds 3

# Start Frontend (React/Vite)
Write-Host ""
Write-Host "⚛️  Starting Frontend Server (React/Vite)..."
$frontendJob = Start-Process npm -ArgumentList "run dev" -WindowStyle Normal -PassThru
Write-Host "   Frontend starting on http://localhost:3000"
Start-Sleep -Seconds 5

# Verify servers are running
Write-Host ""
Write-Host "Verifying servers..."

try {
    $backendHealth = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -TimeoutSec 5 -UseBasicParsing 2>$null
    if ($backendHealth.StatusCode -eq 200) {
        Write-Host "✅ Backend is running and healthy"
    }
} catch {
    Write-Host "⚠️  Backend may still be starting..."
}

try {
    $frontendHealth = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing 2>$null
    if ($frontendHealth.StatusCode -eq 200) {
        Write-Host "✅ Frontend is running"
    }
} catch {
    Write-Host "⚠️  Frontend may still be starting..."
}

Write-Host ""
Write-Host "=========================================="
Write-Host "  🚀 APPLICATION READY!"
Write-Host "=========================================="
Write-Host ""
Write-Host "Backend (API):    http://localhost:5000"
Write-Host "Frontend (UI):    http://localhost:3000"
Write-Host ""
Write-Host "📦 Test file: downloads-test-pack.zip (5,000 files)"
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers"
Write-Host "=========================================="
Write-Host ""

# Open browser automatically
Start-Sleep -Seconds 2
Write-Host "Opening browser..."
Start-Process "http://localhost:3000"

# Keep script running
Write-Host ""
Write-Host "Servers are running. Press Ctrl+C to stop."
Write-Host ""

# Wait for user to press Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host ""
    Write-Host "Shutting down servers..."
    if ($backendJob -and !$backendJob.HasExited) {
        Stop-Process -Id $backendJob.Id -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Backend stopped"
    }
    if ($frontendJob -and !$frontendJob.HasExited) {
        Stop-Process -Id $frontendJob.Id -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Frontend stopped"
    }
    Write-Host ""
    Write-Host "All servers stopped. Goodbye!"
    Write-Host ""
}

