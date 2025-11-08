export interface FileData {
  id: string
  filename: string
  size: number
  type: string
  binaryData: Uint8Array
  timestamp: string
  isFromZip?: boolean
  zipSource?: string
  folderPath?: string
}

