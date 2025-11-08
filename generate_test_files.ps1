# Efficient 5000+ file generator
$testDir = "test_downloads"
$fullPath = Join-Path $PWD $testDir

# Clean and create directory
Remove-Item -Recurse -Force $fullPath -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $fullPath | Out-Null

# Binary signatures
$jpegSig = [byte[]]@(0xFF,0xD8,0xFF,0xE0,0x00,0x10,0x4A,0x46,0x49,0x46)
$pngSig = [byte[]]@(0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A)
$gifSig = [byte[]]@(0x47,0x49,0x46,0x38,0x39,0x61)
$pdfSig = [byte[]]@(0x25,0x50,0x44,0x46,0x2D,0x31,0x2E,0x34)
$zipSig = [byte[]]@(0x50,0x4B,0x03,0x04)
$exeSig = [byte[]]@(0x4D,0x5A,0x90,0x00)
$mp3Sig = [byte[]]@(0x49,0x44,0x33,0x03,0x00)
$mp4Sig = [byte[]]@(0x00,0x00,0x00,0x20,0x66,0x74,0x79,0x70)

Write-Host "Generating 5000 test files...`n"

# Create 1000 JPEGs
1..1000 | ForEach-Object { 
    [System.IO.File]::WriteAllBytes("$fullPath\photo-$_.jpg", $jpegSig) 
}
Write-Host "✅ 1000 JPEG files"

# Create 800 PNGs
1..800 | ForEach-Object { 
    [System.IO.File]::WriteAllBytes("$fullPath\screenshot-$_.png", $pngSig) 
}
Write-Host "✅ 800 PNG files"

# Create 500 GIFs
1..500 | ForEach-Object { 
    [System.IO.File]::WriteAllBytes("$fullPath\animation-$_.gif", $gifSig) 
}
Write-Host "✅ 500 GIF files"

# Create 600 PDFs
1..600 | ForEach-Object { 
    [System.IO.File]::WriteAllBytes("$fullPath\document-$_.pdf", $pdfSig) 
}
Write-Host "✅ 600 PDF files"

# Create 300 ZIPs
1..300 | ForEach-Object { 
    [System.IO.File]::WriteAllBytes("$fullPath\archive-$_.zip", $zipSig) 
}
Write-Host "✅ 300 ZIP files"

# Create 200 EXEs
1..200 | ForEach-Object { 
    [System.IO.File]::WriteAllBytes("$fullPath\installer-$_.exe", $exeSig) 
}
Write-Host "✅ 200 EXE files"

# Create 250 MP3s
1..250 | ForEach-Object { 
    [System.IO.File]::WriteAllBytes("$fullPath\song-$_.mp3", $mp3Sig) 
}
Write-Host "✅ 250 MP3 files"

# Create 250 MP4s
1..250 | ForEach-Object { 
    [System.IO.File]::WriteAllBytes("$fullPath\video-$_.mp4", $mp4Sig) 
}
Write-Host "✅ 250 MP4 files"

# Create 300 DOCX (ZIP-based)
1..300 | ForEach-Object { 
    [System.IO.File]::WriteAllBytes("$fullPath\report-$_.docx", $zipSig) 
}
Write-Host "✅ 300 DOCX files"

# Create 200 XLSX (ZIP-based)
1..200 | ForEach-Object { 
    [System.IO.File]::WriteAllBytes("$fullPath\spreadsheet-$_.xlsx", $zipSig) 
}
Write-Host "✅ 200 XLSX files"

# Create 300 TXT files
1..300 | ForEach-Object { 
    "Sample text content for file $_" | Out-File "$fullPath\note-$_.txt" -Encoding UTF8 
}
Write-Host "✅ 300 TXT files"

# Create 200 JSON files
1..200 | ForEach-Object { 
    "{`"id`": $_, `"data`": `"test`"}" | Out-File "$fullPath\config-$_.json" -Encoding UTF8 
}
Write-Host "✅ 200 JSON files"

# Create 100 CSV files
1..100 | ForEach-Object { 
    "Name,Value`nItem$_,100" | Out-File "$fullPath\data-$_.csv" -Encoding UTF8 
}
Write-Host "✅ 100 CSV files"

$count = (Get-ChildItem $fullPath).Count
Write-Host "`n🎉 Created $count files total!"
