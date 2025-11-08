// React import needed for JSX transform
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File as FileIcon, Loader2 } from 'lucide-react'
import { FileData } from '../types'
import JSZip from 'jszip'

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

  const classifyFile = async (filename: string, binaryData: Uint8Array): Promise<any> => {
    try {
      // Convert Uint8Array to base64 safely (handles large files including EXEs)
      const base64 = await uint8ArrayToBase64(binaryData)
      
      const response = await fetch('http://localhost:5000/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename,
          binaryData: base64
        })
      })

      if (!response.ok) {
        throw new Error(`Classification failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.result
    } catch (error) {
      console.error('Classification error:', error)
      return null
    }
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

  const analyzeZipFile = async (file: File, zipFileName: string): Promise<FileData[]> => {
    const results: FileData[] = []
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(arrayBuffer)
      
      // Get all file entries
      const fileEntries = Object.entries(zip.files)
      let processedCount = 0
      
      for (const [path, zipEntry] of fileEntries) {
        // Skip directories
        if (zipEntry.dir) continue
        
        // Update progress for zip extraction
        processedCount++
        const progress = Math.floor((processedCount / fileEntries.length) * 100)
        setUploadProgress(prev => ({ 
          ...prev, 
          [zipFileName]: Math.min(progress, 95) 
        }))
        
        // Extract file as binary
        const binaryData = await zipEntry.async('uint8array')
        
        // Parse folder path
        const pathParts = path.split('/')
        const filename = pathParts[pathParts.length - 1]
        const folderPath = pathParts.slice(0, -1).join('/')
        
        // Classify the extracted file
        const classification = await classifyFile(filename, binaryData)
        
        results.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          filename: filename,
          size: binaryData.length,
          type: getMimeType(filename),
          timestamp: new Date().toISOString(),
          isFromZip: true,
          zipSource: zipFileName,
          folderPath: folderPath || undefined,
          // Add classification results
          ...(classification && {
            filetype: classification.filetype,
            content_category: classification.content_category,
            confidence_score: classification.confidence_score,
            mime_type: classification.mime_type,
            encoding: classification.encoding,
            language: classification.language,
            metadata: classification.metadata
          })
        })
      }
      
      setUploadProgress(prev => ({ ...prev, [zipFileName]: 100 }))
    } catch (error) {
      console.error('Error analyzing zip:', error)
    }
    
    return results
  }

  const processFiles = async (files: File[]) => {
    setProcessing(true)
    const results: FileData[] = []

    for (const file of files) {
      // Show upload progress
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
      
      // Check if it's a zip file
      const isZipFile = file.name.toLowerCase().endsWith('.zip') || 
                        file.type === 'application/zip' ||
                        file.type === 'application/x-zip-compressed'
      
      if (isZipFile) {
        // Extract and analyze all files inside the zip
        setUploadProgress(prev => ({ ...prev, [file.name]: 10 }))
        const zipFiles = await analyzeZipFile(file, file.name)
        results.push(...zipFiles)
        
        // Small delay to show completion
        await new Promise(resolve => setTimeout(resolve, 200))
      } else {
        // Regular file - convert to binary and classify
        setUploadProgress(prev => ({ ...prev, [file.name]: 30 }))
        
        const binaryData = await convertFileToBinary(file)
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 60 }))
        
        // Classify file using AI
        const classification = await classifyFile(file.name, binaryData)
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
        
        // Create result object with classification
        const result: FileData = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          filename: file.name,
          size: file.size,
          type: file.type || getMimeType(file.name),
          timestamp: new Date().toISOString(),
          // Add classification results
          ...(classification && {
            filetype: classification.filetype,
            content_category: classification.content_category,
            confidence_score: classification.confidence_score,
            mime_type: classification.mime_type,
            encoding: classification.encoding,
            language: classification.language,
            metadata: classification.metadata
          })
        }
        
        results.push(result)
        
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      setUploadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[file.name]
        return newProgress
      })
    }

    onFilesProcessed(results)
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

