import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File as FileIcon, Loader2 } from 'lucide-react'
import { FileData } from '../types'

interface FileUploaderProps {
  onFilesProcessed: (results: FileData[]) => void
  processing: boolean
  setProcessing: (processing: boolean) => void
}

const FileUploader = ({ onFilesProcessed, processing, setProcessing }: FileUploaderProps) => {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  const convertFileToBinary = async (file: File): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer
        resolve(new Uint8Array(arrayBuffer))
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  const uint8ArrayToBase64 = async (bytes: Uint8Array): Promise<string> => {
    // Use browser's native FileReader for robust base64 encoding
    // This handles files of any size including large EXE files without crashing
    return new Promise((resolve, reject) => {
      // Create a new Uint8Array to ensure standard ArrayBuffer type
      const safeBytes = new Uint8Array(bytes)
      const blob = new Blob([safeBytes])
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        // Remove the data URL prefix (e.g., "data:application/octet-stream;base64,")
        const base64 = dataUrl.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const getMimeType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      // Documents
      'txt': 'text/plain',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'csv': 'text/csv',
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      // Media
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'mp4': 'video/mp4',
      'avi': 'video/x-msvideo',
      // Archives
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
      // Code
      'js': 'text/javascript',
      'ts': 'text/typescript',
      'py': 'text/x-python',
      'java': 'text/x-java',
      'cpp': 'text/x-c++src',
      'html': 'text/html',
      'css': 'text/css',
      'json': 'application/json',
      'xml': 'application/xml',
    }
    return mimeTypes[ext || ''] || 'application/octet-stream'
  }

  const classifyZipServerSide = async (file: File, zipFileName: string): Promise<FileData[]> => {
    // Server-side ZIP processing - fast for large ZIPs!
    try {
      console.log(`Starting ZIP processing for: ${zipFileName} (${(file.size / 1024 / 1024).toFixed(2)} MB)`)
      
      const arrayBuffer = await file.arrayBuffer()
      console.log('ZIP file loaded into memory, converting to base64...')
      
      const base64 = await uint8ArrayToBase64(new Uint8Array(arrayBuffer))
      console.log(`Base64 conversion complete (${base64.length} chars), sending to server...`)
      
      setUploadProgress(prev => ({ ...prev, [zipFileName]: 50 }))
      
      const response = await fetch('http://localhost:5000/api/classify-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipData: base64 })
      })

      console.log(`Server responded with status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server error response:', errorText)
        throw new Error(`ZIP classification failed: ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log(`Successfully processed ZIP: ${data.total_processed} files`)
      
      setUploadProgress(prev => ({ ...prev, [zipFileName]: 100 }))
      
      // Convert results to FileData format
      const formattedResults = data.results.map((result: any) => {
        const pathParts = result.original_path?.split('/') || [result.metadata?.filename || 'unknown']
        const filename = pathParts[pathParts.length - 1]
        const folderPath = pathParts.slice(0, -1).join('/')
        
        return {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          filename: filename,
          size: result.metadata?.file_size || 0,
          type: getMimeType(filename),
          timestamp: new Date().toISOString(),
          isFromZip: true,
          zipSource: zipFileName,
          folderPath: folderPath || undefined,
          filetype: result.filetype,
          content_category: result.content_category,
          confidence_score: result.confidence_score,
          mime_type: result.mime_type,
          encoding: result.encoding,
          language: result.language,
          metadata: result.metadata
        }
      })
      
      console.log(`Formatted ${formattedResults.length} results for display`)
      return formattedResults
    } catch (error) {
      console.error('❌ Error with server-side ZIP processing:', error)
      alert(`Failed to process ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return []
    }
  }

  const analyzeZipFile = async (file: File, zipFileName: string): Promise<void> => {
    // Use server-side processing for all ZIPs (much faster!)
    try {
      setUploadProgress(prev => ({ ...prev, [zipFileName]: 10 }))
      
      const results = await classifyZipServerSide(file, zipFileName)
      
      // Progressive results - show immediately!
      if (results.length > 0) {
        onFilesProcessed(results)
      }
      
      setUploadProgress(prev => ({ ...prev, [zipFileName]: 100 }))
    } catch (error) {
      console.error('Error analyzing zip:', error)
    }
  }

  const processFiles = async (files: File[]) => {
    setProcessing(true)
    const BATCH_SIZE = 10  // Process 10 files per batch

    // Separate ZIP files from regular files
    const zipFiles = files.filter(f => 
      f.name.toLowerCase().endsWith('.zip') || 
      f.type === 'application/zip' ||
      f.type === 'application/x-zip-compressed'
    )
    const regularFiles = files.filter(f => !zipFiles.includes(f))

    // Process ZIP files (server-side extraction and classification)
    for (const zipFile of zipFiles) {
      setUploadProgress(prev => ({ ...prev, [zipFile.name]: 0 }))
      
      // Server-side processing - returns results automatically
      await analyzeZipFile(zipFile, zipFile.name)
      
      setUploadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[zipFile.name]
        return newProgress
      })
    }

    // Process regular files in batches with progressive results
    for (let i = 0; i < regularFiles.length; i += BATCH_SIZE) {
      const batch = regularFiles.slice(i, i + BATCH_SIZE)
      
      // Show progress for each file in batch
      batch.forEach(file => {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
      })
      
      // Convert all files in batch to binary
      const batchData = await Promise.all(
        batch.map(async file => {
          setUploadProgress(prev => ({ ...prev, [file.name]: 50 }))
          const binaryData = await convertFileToBinary(file)
          return { file, binaryData }
        })
      )
      
      // Prepare for batch classification
      const filesToClassify = batchData.map(({ file, binaryData }) => ({
        filename: file.name,
        binaryData: binaryData,
        size: file.size,
        type: file.type || getMimeType(file.name)
      }))
      
      // Convert to base64 and classify batch
      const filesData = await Promise.all(
        filesToClassify.map(async f => ({
          filename: f.filename,
          binaryData: await uint8ArrayToBase64(f.binaryData)
        }))
      )
      
      batch.forEach(file => {
        setUploadProgress(prev => ({ ...prev, [file.name]: 80 }))
      })
      
      try {
        const response = await fetch('http://localhost:5000/api/classify-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files: filesData })
        })

        if (response.ok) {
          const data = await response.json()
          
          // Convert to FileData format
          const batchResults = data.results.map((result: any, index: number) => ({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            filename: filesToClassify[index].filename,
            size: filesToClassify[index].size,
            type: filesToClassify[index].type,
            timestamp: new Date().toISOString(),
            filetype: result.filetype,
            content_category: result.content_category,
            confidence_score: result.confidence_score,
            mime_type: result.mime_type,
            encoding: result.encoding,
            language: result.language,
            metadata: result.metadata
          }))
          
          // Progressive results - show this batch immediately!
          onFilesProcessed(batchResults)
        }
      } catch (error) {
        console.error('Batch classification error:', error)
      }
      
      // Clear progress for this batch
      batch.forEach(file => {
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[file.name]
          return newProgress
        })
      })
    }

    setProcessing(false)
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFiles(acceptedFiles)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: processing,
  })

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          relative border-3 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragActive 
            ? 'border-primary-400 bg-primary-500/10 scale-105' 
            : 'border-gray-400/50 hover:border-primary-400/70 bg-white/5 hover:bg-white/10'
          }
          ${processing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {processing ? (
            <Loader2 className="w-16 h-16 text-primary-400 animate-spin" />
          ) : isDragActive ? (
            <Upload className="w-16 h-16 text-primary-400 animate-bounce" />
          ) : (
            <FileIcon className="w-16 h-16 text-gray-400" />
          )}
          
          <div className="space-y-2">
            <p className="text-xl font-semibold text-white">
              {processing 
                ? 'Classifying files with AI...' 
                : isDragActive
                ? 'Drop files here...'
                : 'Drag & drop files here'
              }
            </p>
            <p className="text-sm text-gray-400">
              or click to browse • All file types supported
            </p>
          </div>

          {!processing && (
            <button
              type="button"
              className="mt-4 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              Select Files
            </button>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Classifying files...</h3>
          {Object.entries(uploadProgress).map(([filename, progress]) => (
            <div key={filename} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300 truncate max-w-md">{filename}</span>
                <span className="text-primary-400">{progress}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUploader

