import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, Loader2 } from 'lucide-react'
import { FileClassification } from '../types'
import { mockClassifyFile } from '../utils/mockBackend'

interface FileUploaderProps {
  onFilesProcessed: (results: FileClassification[]) => void
  processing: boolean
  setProcessing: (processing: boolean) => void
}

const FileUploader = ({ onFilesProcessed, processing, setProcessing }: FileUploaderProps) => {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  const processFiles = async (files: File[]) => {
    setProcessing(true)
    const results: FileClassification[] = []

    for (const file of files) {
      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
      
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setUploadProgress(prev => ({ ...prev, [file.name]: i }))
      }

      // Mock classification
      const result = await mockClassifyFile(file)
      results.push(result)
      
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
            <File className="w-16 h-16 text-gray-400" />
          )}
          
          <div className="space-y-2">
            <p className="text-xl font-semibold text-white">
              {processing 
                ? 'Processing files...' 
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
          <h3 className="text-sm font-semibold text-white">Processing...</h3>
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

