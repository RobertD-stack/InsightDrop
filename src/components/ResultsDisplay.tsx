import { FileClassification } from '../types'
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  Database, 
  Code, 
  File,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface ResultsDisplayProps {
  results: FileClassification[]
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'media':
      return <Image className="w-5 h-5" />
    case 'structured':
      return <Database className="w-5 h-5" />
    case 'text':
      return <FileText className="w-5 h-5" />
    case 'executable':
      return <Code className="w-5 h-5" />
    default:
      return <File className="w-5 h-5" />
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'media':
      return 'bg-purple-500/20 text-purple-300 border-purple-400/30'
    case 'structured':
      return 'bg-blue-500/20 text-blue-300 border-blue-400/30'
    case 'text':
      return 'bg-green-500/20 text-green-300 border-green-400/30'
    case 'executable':
      return 'bg-red-500/20 text-red-300 border-red-400/30'
    case 'unstructured':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
  }
}

const getConfidenceColor = (score: number) => {
  if (score >= 0.9) return 'text-green-400'
  if (score >= 0.7) return 'text-yellow-400'
  return 'text-orange-400'
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const ResultsDisplay = ({ results }: ResultsDisplayProps) => {
  return (
    <div className="space-y-4">
      {results.map((result) => (
        <div
          key={result.file_id}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.01]"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div className={`p-2 rounded-lg ${getCategoryColor(result.content_category)}`}>
                {getCategoryIcon(result.content_category)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white truncate">
                  {result.original_filename}
                </h3>
                <p className="text-sm text-gray-400">
                  {formatFileSize(result.file_size)} • {result.processing_time_ms}ms
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {result.confidence_score >= 0.8 ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">File Type</p>
              <p className="text-sm font-semibold text-white">{result.file_type}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Category</p>
              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(result.content_category)}`}>
                {getCategoryIcon(result.content_category)}
                <span className="capitalize">{result.content_category}</span>
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Confidence</p>
              <p className={`text-sm font-bold ${getConfidenceColor(result.confidence_score)}`}>
                {(result.confidence_score * 100).toFixed(1)}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">MIME Type</p>
              <p className="text-sm text-gray-300 truncate" title={result.mime_type}>
                {result.mime_type}
              </p>
            </div>
          </div>

          {/* Optional Metadata */}
          {(result.encoding || result.language) && (
            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
              {result.encoding && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-500">Encoding:</span>
                  <span className="text-gray-300 font-medium">{result.encoding}</span>
                </div>
              )}
              {result.language && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-500">Language:</span>
                  <span className="text-gray-300 font-medium">{result.language}</span>
                </div>
              )}
            </div>
          )}

          {/* Additional Metadata */}
          {result.metadata && Object.keys(result.metadata).length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Additional Metadata</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(result.metadata).map(([key, value]) => (
                  <div key={key} className="text-xs">
                    <span className="text-gray-500">{key}:</span>{' '}
                    <span className="text-gray-300">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ResultsDisplay

