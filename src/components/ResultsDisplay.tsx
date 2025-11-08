import { useState } from 'react'
import { FileData } from '../types'
import { File, Binary, ChevronDown, ChevronUp, Archive, Folder } from 'lucide-react'

interface ResultsDisplayProps {
  results: FileData[]
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString()
}

const bytesToHex = (bytes: Uint8Array, maxBytes: number = 256): string => {
  const limit = Math.min(bytes.length, maxBytes)
  let hex = ''
  for (let i = 0; i < limit; i++) {
    const byte = bytes[i].toString(16).padStart(2, '0').toUpperCase()
    hex += byte + ' '
    if ((i + 1) % 16 === 0) hex += '\n'
  }
  if (bytes.length > maxBytes) {
    hex += `\n... (${bytes.length - maxBytes} more bytes)`
  }
  return hex.trim()
}

const FileCard = ({ file }: { file: FileData }) => {
  const [expanded, setExpanded] = useState(false)

  // Calculate statistics once
  const getStats = () => {
    let sum = 0
    let min = 255
    let max = 0
    for (let i = 0; i < file.binaryData.length; i++) {
      const byte = file.binaryData[i]
      sum += byte
      if (byte < min) min = byte
      if (byte > max) max = byte
    }
    return {
      avg: (sum / file.binaryData.length).toFixed(2),
      min,
      max
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg ${file.isFromZip ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'}`}>
            {file.isFromZip ? <Archive className="w-5 h-5" /> : <File className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-white truncate" title={file.filename}>
                {file.filename}
              </h3>
              {file.isFromZip && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  <Archive className="w-3 h-3 mr-1" />
                  From ZIP
                </span>
              )}
            </div>
            {file.isFromZip && file.zipSource && (
              <p className="text-xs text-gray-500 mb-1">
                Source: {file.zipSource}
              </p>
            )}
            {file.folderPath && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                <Folder className="w-3 h-3" />
                {file.folderPath}
              </p>
            )}
            <p className="text-sm text-gray-400">
              {formatFileSize(file.size)} • {formatTimestamp(file.timestamp)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide">MIME Type</p>
          <p className="text-sm font-semibold text-white truncate" title={file.type}>
            {file.type}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Binary Size</p>
          <p className="text-sm font-semibold text-white">
            {file.binaryData.length} bytes
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide">First Bytes</p>
          <p className="text-sm font-mono text-green-400">
            {bytesToHex(file.binaryData, 8)}
          </p>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
      >
        <Binary className="w-4 h-4" />
        <span>{expanded ? 'Hide' : 'Show'} Binary Data</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Hexadecimal Representation (first 256 bytes)
          </p>
          <div className="bg-black/30 rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs font-mono text-green-400 whitespace-pre">
              {bytesToHex(file.binaryData, 256)}
            </pre>
          </div>
          
          <div className="mt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Binary Statistics
            </p>
            {(() => {
              const stats = getStats()
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Total Bytes:</span>{' '}
                    <span className="text-gray-300 font-medium">{file.binaryData.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Avg Value:</span>{' '}
                    <span className="text-gray-300 font-medium">{stats.avg}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Min Value:</span>{' '}
                    <span className="text-gray-300 font-medium">{stats.min}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Max Value:</span>{' '}
                    <span className="text-gray-300 font-medium">{stats.max}</span>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

const ResultsDisplay = ({ results }: ResultsDisplayProps) => {
  return (
    <div className="space-y-4">
      {results.map((file) => (
        <FileCard key={file.id} file={file} />
      ))}
    </div>
  )
}

export default ResultsDisplay

