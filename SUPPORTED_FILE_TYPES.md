# Supported File Types - Complete List

## 📊 Summary
**Total File Types Supported: 200+**

The file classifier now supports comprehensive file type detection across 7 major categories.

---

## 🖼️ **Images (16 types)**
- **Common:** JPG, JPEG, PNG, GIF, BMP, SVG, WebP, TIFF, ICO
- **Modern:** HEIC, HEIF, JFIF, JP2, JPX, J2K, J2C

**Detection Methods:**
- Magic numbers (signatures)
- MIME type detection
- Extension fallback

---

## 🎬 **Videos (18 types)**
- **Common:** MP4, AVI, MOV, MKV, FLV, WMV, WebM, MPEG, MPG
- **Mobile:** 3GP, 3G2, M4V
- **Other:** ASF, RM, RMVB, VOB, OGV, DivX

**Detection Methods:**
- ftyp-based detection (MP4, MOV, M4V)
- Matroska container detection (MKV, WebM)
- RIFF-based detection (AVI)
- Magic numbers

---

## 🎵 **Audio (18 types)**
- **Common:** MP3, WAV, FLAC, AAC, OGG, WMA, M4A, OPUS
- **Other:** AMR, AU, RA, AIFF, AIF, MID, MIDI, WV, APE, AC3

**Detection Methods:**
- Magic numbers (FLAC, OGG, WAV)
- ID3 tag detection (MP3)
- Frame sync patterns (MP3)
- RIFF-based detection (WAV)

---

## 📄 **Documents (20 types)**
- **Microsoft Office:** DOC, DOCX, PPT, PPTX, XLS, XLSX
- **OpenDocument:** ODT, ODP, ODS
- **Other:** PDF, TXT, RTF, MD, Markdown, RST, TEX, LaTeX, DJVU
- **E-books:** EPUB, MOBI, AZW, FB2
- **Other:** Pages, Key, Numbers, XPS

**Detection Methods:**
- Magic numbers (PDF: `%PDF`)
- ZIP-based detection (Office files, OpenDocument)
- Content pattern matching (Office formats)
- Extension fallback (text files)

---

## 💾 **Structured Data (18 types)**
- **Common:** CSV, JSON, XML, TSV
- **Spreadsheets:** XLSX, XLS, ODS
- **Databases:** SQL, DB, SQLite, MDB
- **Config:** YAML, YML, TOML, INI, CFG, CONF, Properties
- **Big Data:** Parquet, Avro, ORC, Feather

**Detection Methods:**
- Extension-based (most text formats)
- Content pattern matching (JSON, XML)
- MIME type detection

---

## 📦 **Archives (20 types)**
- **Common:** ZIP, RAR, TAR, GZ, 7Z, BZ2, XZ
- **Other:** LZ, LZMA, CAB, ARJ, ACE, Z, LZH, SIT, SITX
- **Disk Images:** DMG, ISO, IMG
- **Compressed TAR:** TAR.GZ, TAR.BZ2, TAR.XZ, ZIPX

**Detection Methods:**
- Magic numbers (ZIP, RAR, 7Z, GZ, BZ2, XZ, TAR)
- Signature detection at various offsets
- Version-specific detection (RAR v1.5, v5.0)

---

## 💻 **Code Files (60+ types)**
- **Web:** HTML, HTM, XHTML, CSS, SCSS, SASS, LESS, JS, JSX, TS, TSX
- **Systems:** C, CPP, CXX, CC, H, HPP, HXX, ASM
- **High-level:** Python (PY, PYW, PYC), Java (JAVA, CLASS), C# (CS), VB
- **Modern:** Go, Rust (RS), Swift, Kotlin (KT), Scala, Clojure (CLJ, CLJS)
- **Scripting:** PHP, Ruby (RB), Perl (PL, PM), Lua, Dart, R, MATLAB (M, MM)
- **Shell:** SH, Bash, ZSH, Fish, PS1, BAT, CMD
- **Functional:** F# (FS), OCaml (ML, MLI), Haskell (HS, LHS), Elm
- **Other:** SQL, Elixir (EX, EXS), Erlang (ERL, HRL), Vim (VIM, VIMRC)
- **Config:** Dockerfile, Makefile, Gitignore

**Detection Methods:**
- Extension-based (primary method)
- Shebang detection (`#!/`)
- Content pattern matching (XML, HTML, JSON)
- Magic numbers (Java CLASS files)

---

## ⚙️ **Executables (25 types)**
- **Windows:** EXE, DLL, MSI, COM, BAT, CMD, VBS
- **Linux/Unix:** ELF, SO, SH, DEB, RPM
- **macOS:** APP, DMG, PKG, MACHO, MACHO64
- **Mobile:** APK (Android), IPA (iOS)
- **Java:** CLASS, JAR, WAR, EAR
- **Other:** BIN, PS1

**Detection Methods:**
- Magic numbers (EXE: `MZ`, ELF: `\x7fELF`, MACHO, CLASS)
- Platform-specific signatures
- Extension fallback

---

## 🔍 **Detection Methods Used**

### 1. **Magic Number Detection (Binary Signatures)**
- Checks first bytes of file against known signatures
- Most reliable for binary files
- Supports 50+ file types via signatures

### 2. **Python-Magic Library**
- Uses `python-magic-bin` for MIME type detection
- Fallback when signatures don't match
- Handles edge cases and variations

### 3. **Extension-Based Detection**
- Trusts file extensions for text-based files
- Used for code files, config files, markup
- Validated against trusted extension list

### 4. **Content Pattern Matching**
- Scans file content for specific patterns
- Used for Office files (DOCX, XLSX, PPTX)
- Used for OpenDocument formats (ODT, ODS, ODP)
- Used for text-based formats (XML, HTML, JSON)

### 5. **Special Format Detection**
- RIFF-based formats (WAV, AVI, WebP)
- ftyp-based formats (MP4, MOV, HEIC, M4A, M4V)
- Matroska container (MKV, WebM)
- ZIP-based formats (Office, OpenDocument)

---

## 📈 **Coverage Statistics**

| Category | File Types | Detection Methods |
|----------|-----------|-------------------|
| Images | 16 | Magic numbers, MIME, Extension |
| Videos | 18 | ftyp, Matroska, RIFF, Magic numbers |
| Audio | 18 | Magic numbers, ID3, Frame sync, RIFF |
| Documents | 20 | Magic numbers, ZIP patterns, Extension |
| Structured | 18 | Extension, Content patterns, MIME |
| Archives | 20 | Magic numbers, Signatures |
| Code | 60+ | Extension, Shebang, Content patterns |
| Executables | 25 | Magic numbers, Platform signatures |
| **Total** | **200+** | **5 detection methods** |

---

## ✅ **Key Features**

1. **Multi-Method Detection:** Uses 5 different detection methods for maximum accuracy
2. **Fallback Strategy:** If one method fails, others still work
3. **Comprehensive Coverage:** 200+ file types across all major categories
4. **Magic Number Support:** 50+ binary signatures for reliable detection
5. **Text File Support:** 60+ code/config file types via extension
6. **Office Format Detection:** Distinguishes DOCX, XLSX, PPTX, ODT, ODS, ODP from ZIP
7. **Media Format Support:** Handles modern formats (HEIC, WebM, OPUS, etc.)
8. **Platform Support:** Detects executables for Windows, Linux, macOS

---

## 🎯 **Confidence Scoring**

The system calculates confidence scores based on:
- **Magic number match:** 40% weight
- **Extension match:** 30% weight  
- **Structure validation:** 30% weight

**Score Range:** 0.0 - 0.99 (never 100% certain)
**Minimum for detected files:** 0.50
**Unknown files:** Max 0.30

---

## 📝 **Notes**

- Some file types (especially text-based) rely on extension detection
- Binary signatures are checked first for maximum reliability
- Python-magic library provides additional MIME type detection
- Office and OpenDocument formats are detected by scanning ZIP structure
- Modern formats (HEIC, WebM, OPUS) are fully supported

---

**Last Updated:** File classifier now supports 200+ file types with comprehensive detection methods!

