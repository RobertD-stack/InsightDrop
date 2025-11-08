import React, { useState } from 'react'
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

const FileCard = ({ file }: { file: FileData }) => {
  const [expanded, setExpanded] = useState(false)

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide">File Type</p>
          <p className="text-sm font-semibold text-white">
            {file.filetype || file.type || 'Unknown'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Category</p>
          <p className="text-sm font-semibold text-white capitalize">
            {file.content_category || 'Unknown'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Confidence</p>
          <p className={`text-sm font-bold ${
            file.confidence_score !== null && file.confidence_score !== undefined ? 
              file.confidence_score >= 0.9 ? 'text-green-400' :
              file.confidence_score >= 0.7 ? 'text-yellow-400' :
              file.confidence_score >= 0.5 ? 'text-orange-400' :
              'text-red-400'
            : 'text-gray-400'
          }`}>
            {file.confidence_score !== null && file.confidence_score !== undefined 
              ? `${(file.confidence_score * 100).toFixed(1)}%` 
              : 'N/A'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide">File Size</p>
          <p className="text-sm font-semibold text-white">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>

      {/* PII Detection Alert */}
      {file.metadata?.pii_detection?.has_pii && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-red-400 font-bold">⚠️ PII DETECTED</span>
            <span className="text-xs text-red-300">
              {file.metadata.pii_detection.total_count} instance(s) found
            </span>
          </div>
          <div className="mt-2 text-xs text-red-200">
            <p className="font-semibold">Types found:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {file.metadata.pii_detection.pii_types_found.map((type: string) => (
                <li key={type} className="capitalize">
                  {type.replace(/_/g, ' ')} 
                  {file.metadata.pii_detection.by_type?.[type] && (
                    <span className="text-red-300">
                      {' '}({file.metadata.pii_detection.by_type[type].count} found)
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {file.metadata && Object.keys(file.metadata).length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Binary className="w-4 h-4" />
            <span>{expanded ? 'Hide' : 'Show'} Classification Details</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
                Classification Metadata
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {file.mime_type && (
                  <div className="bg-black/20 rounded-lg p-3">
                    <span className="text-xs text-gray-500">MIME Type:</span>
                    <p className="text-sm text-white font-medium mt-1">{file.mime_type}</p>
                  </div>
                )}
                {file.encoding && (
                  <div className="bg-black/20 rounded-lg p-3">
                    <span className="text-xs text-gray-500">Encoding:</span>
                    <p className="text-sm text-white font-medium mt-1">{file.encoding}</p>
                  </div>
                )}
                {file.language && (
                  <div className="bg-black/20 rounded-lg p-3">
                    <span className="text-xs text-gray-500">Language:</span>
                    <p className="text-sm text-white font-medium mt-1">{file.language}</p>
                  </div>
                )}
                {/* PII Detection Details */}
                {file.metadata.pii_detection && (
                  <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3 md:col-span-2">
                    <span className="text-xs text-red-400 font-semibold uppercase">PII Detection (Stretch Goal)</span>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-white">
                        <span className="text-gray-400">Status:</span>{' '}
                        <span className={file.metadata.pii_detection.has_pii ? 'text-red-400 font-bold' : 'text-green-400'}>
                          {file.metadata.pii_detection.has_pii ? 'PII Found' : 'No PII Detected'}
                        </span>
                      </p>
                      {file.metadata.pii_detection.has_pii && (
                        <>
                          <p className="text-sm text-white">
                            <span className="text-gray-400">Total Detections:</span>{' '}
                            <span className="text-red-400 font-bold">{file.metadata.pii_detection.total_count}</span>
                          </p>
                          <p className="text-sm text-white">
                            <span className="text-gray-400">High Confidence:</span>{' '}
                            <span className="text-yellow-400">{file.metadata.pii_detection.high_confidence_count}</span>
                          </p>
                          {file.metadata.pii_detection.by_type && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-400 mb-1">Breakdown by Type:</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {Object.entries(file.metadata.pii_detection.by_type).map(([type, data]: [string, any]) => (
                                  <div key={type} className="bg-black/30 rounded p-2">
                                    <span className="text-red-300 capitalize">{type.replace(/_/g, ' ')}:</span>
                                    <span className="text-white ml-1">{data.count}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
                {Object.entries(file.metadata)
                  .filter(([key]) => key !== 'pii_detection' && key !== 'file_size' && key !== 'filename' && key !== 'analyzed_at' && key !== 'extension')
                  .map(([key, value]) => (
                    <div key={key} className="bg-black/20 rounded-lg p-3">
                      <span className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <p className="text-sm text-white font-medium mt-1">{String(value)}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
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

