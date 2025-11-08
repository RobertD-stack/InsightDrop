export interface FileData {
  id: string
  filename: string
  size: number
  type: string
  timestamp: string
  isFromZip?: boolean
  zipSource?: string
  folderPath?: string
  // AI Classification Results
  filetype?: string
  content_category?: string
  confidence_score?: number
  mime_type?: string
  encoding?: string
  language?: string
  metadata?: Record<string, any>
  processing?: boolean
  error?: string
  aiModel?: string  // Which AI model was used for classification
}

export interface TimingData {
  totalTime: number
  classificationTime: number
  decodeTime: number
  filesProcessed: number
  avgPerFile: number
  realElapsedTime?: number  // Actual wall-clock time from frontend
}

