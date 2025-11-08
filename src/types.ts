export interface FileClassification {
  file_id: string
  original_filename: string
  file_type: string
  content_category: 'structured' | 'unstructured' | 'media' | 'executable' | 'text' | 'unknown'
  confidence_score: number
  mime_type: string
  encoding?: string
  language?: string
  file_size: number
  processing_time_ms: number
  metadata?: Record<string, any>
  timestamp: string
}

export interface UploadProgress {
  filename: string
  progress: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
}

