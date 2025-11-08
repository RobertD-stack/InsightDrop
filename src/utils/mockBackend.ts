import { FileClassification } from '../types'

// Mock backend function to simulate file classification
export const mockClassifyFile = async (file: File): Promise<FileClassification> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))

  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  const mimeType = file.type || 'application/octet-stream'

  // Mock classification logic based on file extension and MIME type
  const classification = classifyByExtension(extension, mimeType, file.name)

  return {
    file_id: generateId(),
    original_filename: file.name,
    file_type: classification.fileType,
    content_category: classification.category,
    confidence_score: classification.confidence,
    mime_type: mimeType,
    encoding: classification.encoding,
    language: classification.language,
    file_size: file.size,
    processing_time_ms: Math.floor(800 + Math.random() * 400),
    metadata: classification.metadata,
    timestamp: new Date().toISOString(),
  }
}

function classifyByExtension(ext: string, mimeType: string, filename: string) {
  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(ext)) {
    return {
      fileType: ext.toUpperCase(),
      category: 'media' as const,
      confidence: 0.95 + Math.random() * 0.05,
      metadata: { width: 1920, height: 1080, colorSpace: 'RGB' }
    }
  }

  // Video files
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'mpeg'].includes(ext)) {
    return {
      fileType: ext.toUpperCase(),
      category: 'media' as const,
      confidence: 0.92 + Math.random() * 0.08,
      metadata: { duration: 180, codec: 'H.264', resolution: '1920x1080' }
    }
  }

  // Audio files
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(ext)) {
    return {
      fileType: ext.toUpperCase(),
      category: 'media' as const,
      confidence: 0.94 + Math.random() * 0.06,
      metadata: { duration: 240, bitrate: '320kbps', channels: 2 }
    }
  }

  // Structured data
  if (['csv', 'json', 'xml', 'yaml', 'yml', 'xlsx', 'xls'].includes(ext)) {
    return {
      fileType: ext.toUpperCase(),
      category: 'structured' as const,
      confidence: 0.96 + Math.random() * 0.04,
      encoding: 'UTF-8',
      metadata: { rows: 1000, columns: 15 }
    }
  }

  // Documents
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
    return {
      fileType: ext.toUpperCase(),
      category: 'text' as const,
      confidence: 0.93 + Math.random() * 0.07,
      encoding: 'UTF-8',
      language: 'en',
      metadata: { pages: 12, words: 3500 }
    }
  }

  // Code files
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'go', 'rs', 'php', 'rb'].includes(ext)) {
    return {
      fileType: ext.toUpperCase(),
      category: 'text' as const,
      confidence: 0.97 + Math.random() * 0.03,
      encoding: 'UTF-8',
      language: 'en',
      metadata: { lines: 450, language: ext }
    }
  }

  // Executables
  if (['exe', 'dll', 'so', 'dylib', 'app', 'deb', 'rpm', 'msi'].includes(ext)) {
    return {
      fileType: ext.toUpperCase(),
      category: 'executable' as const,
      confidence: 0.91 + Math.random() * 0.09,
      metadata: { platform: 'Windows', architecture: 'x64' }
    }
  }

  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)) {
    return {
      fileType: ext.toUpperCase(),
      category: 'unstructured' as const,
      confidence: 0.94 + Math.random() * 0.06,
      metadata: { compressed_size: 1024000, files_count: 24 }
    }
  }

  // HTML/Web files
  if (['html', 'htm', 'css', 'scss', 'sass', 'less'].includes(ext)) {
    return {
      fileType: ext.toUpperCase(),
      category: 'text' as const,
      confidence: 0.96 + Math.random() * 0.04,
      encoding: 'UTF-8',
      metadata: { elements: 125, scripts: 3 }
    }
  }

  // Default for unknown
  return {
    fileType: ext ? ext.toUpperCase() : 'UNKNOWN',
    category: 'unknown' as const,
    confidence: 0.50 + Math.random() * 0.3,
    encoding: 'Unknown',
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

