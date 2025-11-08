# Efficient 1000+ file generator
$testDir = "test_downloads"
Remove-Item -Recurse -Force $testDir -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $testDir | Out-Null
Set-Location $testDir

# Binary signatures
$sigs = @{
    jpg = @(0xFF,0xD8,0xFF,0xE0,0x00,0x10,0x4A,0x46,0x49,0x46)
    png = @(0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A)
    gif = @(0x47,0x49,0x46,0x38,0x39,0x61)
    pdf = @(0x25,0x50,0x44,0x46,0x2D,0x31,0x2E,0x34)
    zip = @(0x50,0x4B,0x03,0x04)
    exe = @(0x4D,0x5A,0x90,0x00)
    mp3 = @(0x49,0x44,0x33,0x03,0x00)
    mp4 = @(0x00,0x00,0x00,0x20,0x66,0x74,0x79,0x70)
}

# Create 200 JPEGs
1..200 | %{ [System.IO.File]::WriteAllBytes("photo-$_.jpg", [byte[]]$sigs.jpg) }
Write-Host "✅ 200 JPEG files"

# Create 150 PNGs
1..150 | %{ [System.IO.File]::WriteAllBytes("screenshot-$_.png", [byte[]]$sigs.png) }
Write-Host "✅ 150 PNG files"

# Create 100 GIFs
1..100 | %{ [System.IO.File]::WriteAllBytes("animation-$_.gif", [byte[]]$sigs.gif) }
Write-Host "✅ 100 GIF files"

# Create 100 PDFs
1..100 | %{ [System.IO.File]::WriteAllBytes("document-$_.pdf", [byte[]]$sigs.pdf) }
Write-Host "✅ 100 PDF files"

# Create 80 ZIPs
1..80 | %{ [System.IO.File]::WriteAllBytes("archive-$_.zip", [byte[]]$sigs.zip) }
Write-Host "✅ 80 ZIP files"

# Create 50 EXEs
1..50 | %{ [System.IO.File]::WriteAllBytes("installer-$_.exe", [byte[]]$sigs.exe) }
Write-Host "✅ 50 EXE files"

# Create 50 MP3s
1..50 | %{ [System.IO.File]::WriteAllBytes("song-$_.mp3", [byte[]]$sigs.mp3) }
Write-Host "✅ 50 MP3 files"

# Create 50 MP4s
1..50 | %{ [System.IO.File]::WriteAllBytes("video-$_.mp4", [byte[]]$sigs.mp4) }
Write-Host "✅ 50 MP4 files"

# Create 40 DOCX (ZIP-based)
1..40 | %{ [System.IO.File]::WriteAllBytes("report-$_.docx", [byte[]]$sigs.zip) }
Write-Host "✅ 40 DOCX files"

# Create 30 XLSX (ZIP-based)
1..30 | %{ [System.IO.File]::WriteAllBytes("spreadsheet-$_.xlsx", [byte[]]$sigs.zip) }
Write-Host "✅ 30 XLSX files"

# Create 80 TXT files
1..80 | %{ "Sample text content for file $_" | Out-File "note-$_.txt" -Encoding UTF8 }
Write-Host "✅ 80 TXT files"

# Create 50 JSON files
1..50 | %{ "{`"id`": $_, `"data`": `"test`"}" | Out-File "config-$_.json" -Encoding UTF8 }
Write-Host "✅ 50 JSON files"

# Create 40 CSV files
1..40 | %{ "Name,Value`nItem$_,100" | Out-File "data-$_.csv" -Encoding UTF8 }
Write-Host "✅ 40 CSV files"

$count = (Get-ChildItem).Count
Write-Host "`n🎉 Created $count files total!"
Set-Location ..

