import jsPDF from 'jspdf'
import { FileData } from '../types'

export const generatePDFSummary = (files: FileData[]) => {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.text('File Classification Summary Report', 20, 20)
  
  // Date
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30)
  
  // Summary Statistics
  doc.setFontSize(14)
  doc.text('Summary Statistics', 20, 45)
  
  doc.setFontSize(10)
  const totalFiles = files.length
  const totalSize = files.reduce((sum, f) => sum + f.size, 0)
  const avgConfidence = files.filter(f => f.confidence_score).reduce((sum, f) => sum + (f.confidence_score || 0), 0) / files.filter(f => f.confidence_score).length
  
  // Categories breakdown
  const categories: { [key: string]: number } = {}
  files.forEach(f => {
    const cat = f.content_category || 'unknown'
    categories[cat] = (categories[cat] || 0) + 1
  })
  
  // ZIP files info
  const filesFromZip = files.filter(f => f.isFromZip).length
  const zipSources = [...new Set(files.filter(f => f.zipSource).map(f => f.zipSource))]
  
  let yPos = 55
  doc.text(`Total Files: ${totalFiles}`, 20, yPos)
  yPos += 7
  doc.text(`Total Size: ${formatBytes(totalSize)}`, 20, yPos)
  yPos += 7
  doc.text(`Average Confidence: ${(avgConfidence * 100).toFixed(1)}%`, 20, yPos)
  yPos += 7
  doc.text(`Files from ZIP: ${filesFromZip}`, 20, yPos)
  yPos += 7
  if (zipSources.length > 0) {
    doc.text(`ZIP Sources: ${zipSources.join(', ')}`, 20, yPos)
    yPos += 7
  }
  
  yPos += 10
  doc.text('Category Breakdown:', 20, yPos)
  yPos += 7
  Object.entries(categories).forEach(([cat, count]) => {
    doc.text(`  ${cat}: ${count} files (${((count / totalFiles) * 100).toFixed(1)}%)`, 25, yPos)
    yPos += 6
  })
  
  // File Details
  yPos += 10
  if (yPos > 250) {
    doc.addPage()
    yPos = 20
  }
  
  doc.setFontSize(14)
  doc.text('File Details', 20, yPos)
  yPos += 10
  
  doc.setFontSize(8)
  
  // Add files (limit to first 100 for space, or show all if fewer)
  const displayFiles = files.slice(0, 100)
  const hasMore = files.length > 100
  
  displayFiles.forEach((file, index) => {
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }
    
    // File entry
    doc.setFont(undefined, 'bold')
    doc.text(`${index + 1}. ${file.filename}`, 20, yPos)
    yPos += 5
    
    doc.setFont(undefined, 'normal')
    doc.text(`   Type: ${file.filetype || 'Unknown'} | Category: ${file.content_category || 'Unknown'} | Confidence: ${file.confidence_score ? (file.confidence_score * 100).toFixed(1) : 'N/A'}%`, 20, yPos)
    yPos += 5
    doc.text(`   Size: ${formatBytes(file.size)} | MIME: ${file.mime_type || file.type || 'Unknown'}`, 20, yPos)
    yPos += 5
    
    if (file.isFromZip) {
      doc.text(`   From ZIP: ${file.zipSource}${file.folderPath ? ` / ${file.folderPath}` : ''}`, 20, yPos)
      yPos += 5
    }
    
    yPos += 3
  })
  
  if (hasMore) {
    yPos += 5
    doc.setFont(undefined, 'italic')
    doc.text(`... and ${files.length - 100} more files (showing first 100 only)`, 20, yPos)
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' })
  }
  
  return doc
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

