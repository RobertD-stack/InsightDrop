import jsPDF from 'jspdf'
import { FileData, TimingData } from '../types'

export const generatePDFSummary = (files: FileData[], timing?: TimingData) => {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.text('File Classification Summary Report', 20, 20)
  
  // Date and Model Info
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30)
  
  // Get the AI model used (from first file with model info)
  const modelUsed = files.find(f => f.aiModel)?.aiModel || 'Not specified'
  doc.text(`AI Model: ${modelUsed}`, 20, 37)
  doc.setFontSize(9)
  doc.setFont(undefined, 'italic')
  doc.text(`(All files classified using this model)`, 20, 42)
  doc.setFont(undefined, 'normal')
  
  // Summary Statistics
  doc.setFontSize(14)
  doc.text('Summary Statistics', 20, 50)
  
  doc.setFontSize(10)
  const totalFiles = files.length
  const totalSize = files.reduce((sum, f) => sum + f.size, 0)
  const filesWithConfidence = files.filter(f => f.confidence_score)
  const avgConfidence = filesWithConfidence.length > 0 
    ? filesWithConfidence.reduce((sum, f) => sum + (f.confidence_score || 0), 0) / filesWithConfidence.length
    : 0
  
  // Calculate REAL accuracy using filename extension as ground truth
  const calculateAccuracy = (file: FileData): boolean => {
    const extension = file.filename.split('.').pop()?.toLowerCase()
    const predictedType = file.filetype?.toLowerCase()
    
    if (!extension || !predictedType) return false
    
    // Direct match
    if (predictedType === extension) return true
    
    // Handle common aliases
    const aliases: { [key: string]: string[] } = {
      'jpg': ['jpeg', 'jpg'],
      'jpeg': ['jpeg', 'jpg'],
      'htm': ['html', 'htm'],
      'html': ['html', 'htm'],
      'js': ['javascript', 'js'],
      'ts': ['typescript', 'ts'],
      'py': ['python', 'py'],
    }
    
    if (aliases[extension]?.includes(predictedType)) return true
    if (aliases[predictedType]?.includes(extension)) return true
    
    return false
  }
  
  const correctPredictions = files.filter(calculateAccuracy).length
  const overallAccuracy = totalFiles > 0 ? correctPredictions / totalFiles : 0
  
  // Categories breakdown
  const categories: { [key: string]: number } = {}
  files.forEach(f => {
    const cat = f.content_category || 'unknown'
    categories[cat] = (categories[cat] || 0) + 1
  })
  
  // File type breakdown - GROUP BY ACTUAL EXTENSION (ground truth)
  const filetypeStats: { [key: string]: { 
    count: number, 
    totalConfidence: number, 
    avgConfidence: number,
    correctCount: number,
    accuracy: number
  } } = {}
  
  files.forEach(f => {
    // Use ACTUAL extension as the key, not AI prediction
    let actualType = f.filename.split('.').pop()?.toLowerCase() || 'unknown'
    
    // Normalize aliases to consistent names
    const normalizeType = (type: string): string => {
      if (type === 'jpeg') return 'jpg'
      if (type === 'htm') return 'html'
      return type
    }
    
    actualType = normalizeType(actualType)
    
    if (!filetypeStats[actualType]) {
      filetypeStats[actualType] = { 
        count: 0, 
        totalConfidence: 0, 
        avgConfidence: 0,
        correctCount: 0,
        accuracy: 0
      }
    }
    filetypeStats[actualType].count++
    
    // Add confidence score
    if (f.confidence_score) {
      filetypeStats[actualType].totalConfidence += f.confidence_score
    }
    
    // Check if AI prediction matches actual extension
    if (calculateAccuracy(f)) {
      filetypeStats[actualType].correctCount++
    }
  })
  
  // Calculate averages for each file type
  Object.keys(filetypeStats).forEach(type => {
    const stats = filetypeStats[type]
    stats.avgConfidence = stats.count > 0 ? stats.totalConfidence / stats.count : 0
    stats.accuracy = stats.count > 0 ? stats.correctCount / stats.count : 0
  })
  
  // Sort file types by count (descending)
  // Since we're grouping by actual extension, all types in the table exist by definition
  const sortedFiletypes = Object.entries(filetypeStats)
    .filter(([type]) => type !== 'unknown')  // Exclude unknown types
    .sort((a, b) => b[1].count - a[1].count)
  
  // ZIP files info
  const filesFromZip = files.filter(f => f.isFromZip).length
  const zipSources = [...new Set(files.filter(f => f.zipSource).map(f => f.zipSource))]
  
  let yPos = 60
  doc.text(`Total Files Analyzed: ${totalFiles}`, 20, yPos)
  yPos += 7
  doc.text(`Total Size: ${formatBytes(totalSize)}`, 20, yPos)
  yPos += 7
  doc.text(`Correct Predictions: ${correctPredictions} / ${totalFiles}`, 20, yPos)
  yPos += 12
  
  // Performance Metrics Section
  if (timing && timing.filesProcessed > 0) {
    doc.setFont(undefined, 'bold')
    doc.setFontSize(12)
    doc.setTextColor(0, 102, 204) // Blue color for performance section
    doc.text('⏱ Performance Metrics', 20, yPos)
    doc.setTextColor(0, 0, 0) // Reset to black
    yPos += 8
    
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    
    // Show files processed from timing data
    doc.text(`Files Processed: ${timing.filesProcessed}`, 20, yPos)
    yPos += 10
    
    // Real elapsed time (if available)
    if (timing.realElapsedTime) {
      doc.setFont(undefined, 'bold')
      doc.text('Actual End-to-End Time (measured in browser):', 20, yPos)
      doc.setFont(undefined, 'normal')
      yPos += 6
      doc.text(`  Total Elapsed Time: ${timing.realElapsedTime.toFixed(3)}s`, 20, yPos)
      yPos += 6
      const realAvgPerFile = timing.realElapsedTime / timing.filesProcessed
      doc.text(`  Average per File: ${(realAvgPerFile * 1000).toFixed(2)}ms`, 20, yPos)
      yPos += 6
      const realThroughput = timing.filesProcessed / timing.realElapsedTime
      doc.text(`  Throughput: ${realThroughput.toFixed(2)} files/second`, 20, yPos)
      yPos += 10
      
      doc.setFontSize(8)
      doc.setFont(undefined, 'italic')
      doc.text(`(Includes frontend processing, network transfer, and all batches)`, 20, yPos)
      doc.setFont(undefined, 'normal')
      doc.setFontSize(10)
      yPos += 10
    }
    
    // Backend classification time breakdown
    doc.setFont(undefined, 'bold')
    doc.text('Backend Classification Time (backend only):', 20, yPos)
    doc.setFont(undefined, 'normal')
    yPos += 6
    doc.text(`  Classification Time: ${timing.classificationTime.toFixed(3)}s`, 20, yPos)
    yPos += 6
    doc.text(`  Base64 Decode Time: ${timing.decodeTime.toFixed(3)}s`, 20, yPos)
    yPos += 6
    doc.text(`  Average per File: ${(timing.avgPerFile * 1000).toFixed(2)}ms`, 20, yPos)
    yPos += 6
    
    const backendThroughput = timing.classificationTime > 0 ? timing.filesProcessed / timing.classificationTime : 0
    doc.text(`  Throughput: ${backendThroughput.toFixed(2)} files/second`, 20, yPos)
    yPos += 6
    
    doc.setFontSize(8)
    doc.setFont(undefined, 'italic')
    doc.text(`(Backend AI classification only, excludes network and frontend overhead)`, 20, yPos)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    yPos += 10
  }
  
  // Highlight overall accuracy (vs filename extension)
  doc.setFont(undefined, 'bold')
  doc.setFontSize(12)
  doc.text(`Overall Average Accuracy: ${(overallAccuracy * 100).toFixed(2)}%`, 20, yPos)
  doc.setFontSize(9)
  doc.setFont(undefined, 'italic')
  yPos += 6
  doc.text(`(Based on comparison with filename extensions)`, 20, yPos)
  yPos += 8
  
  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)
  doc.text(`Average AI Confidence Score: ${(avgConfidence * 100).toFixed(2)}%`, 20, yPos)
  yPos += 10
  
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
  
  // Accuracy Metrics per File Type
  yPos += 10
  if (yPos > 230) {
    doc.addPage()
    yPos = 20
  }
  
  doc.setFontSize(14)
  doc.text('Accuracy Metrics by File Type', 20, yPos)
  yPos += 8
  
  doc.setFontSize(9)
  doc.setFont(undefined, 'italic')
  doc.text('(Accuracy = correct predictions vs file extension | Confidence = AI certainty)', 20, yPos)
  yPos += 10
  
  doc.setFont(undefined, 'normal')
  doc.setFontSize(8)
  
  // Table header
  doc.setFont(undefined, 'bold')
  doc.text('File Type', 22, yPos)
  doc.text('Accuracy', 60, yPos)
  doc.text('Confidence', 95, yPos)
  doc.text('Correct', 130, yPos)
  doc.text('Total', 158, yPos)
  doc.text('Grade', 178, yPos)
  yPos += 6
  
  // Draw line under header
  doc.setDrawColor(200, 200, 200)
  doc.line(20, yPos - 2, 195, yPos - 2)
  
  doc.setFont(undefined, 'normal')
  
  // Show top file types by count
  const topFiletypes = sortedFiletypes.slice(0, 25)  // Top 25 file types
  topFiletypes.forEach(([type, stats]) => {
    if (yPos > 275) {
      doc.addPage()
      yPos = 20
      // Repeat header on new page
      doc.setFont(undefined, 'bold')
      doc.text('File Type', 22, yPos)
      doc.text('Accuracy', 60, yPos)
      doc.text('Confidence', 95, yPos)
      doc.text('Correct', 130, yPos)
      doc.text('Total', 158, yPos)
      doc.text('Grade', 178, yPos)
      yPos += 6
      doc.line(20, yPos - 2, 195, yPos - 2)
      doc.setFont(undefined, 'normal')
    }
    
    const accuracy = stats.accuracy * 100
    const confidence = stats.avgConfidence * 100
    const gradeLabel = accuracy >= 95 ? 'A+' : accuracy >= 90 ? 'A' : accuracy >= 85 ? 'B+' : accuracy >= 80 ? 'B' : accuracy >= 75 ? 'C+' : accuracy >= 70 ? 'C' : accuracy >= 60 ? 'D' : 'F'
    
    doc.text(type.toUpperCase(), 22, yPos)
    doc.text(`${accuracy.toFixed(1)}%`, 60, yPos)
    doc.text(`${confidence.toFixed(1)}%`, 95, yPos)
    doc.text(`${stats.correctCount}`, 130, yPos)
    doc.text(`${stats.count}`, 158, yPos)
    doc.text(gradeLabel, 178, yPos)
    yPos += 5.5
  })
  
  if (sortedFiletypes.length > 25) {
    yPos += 3
    doc.setFont(undefined, 'italic')
    doc.text(`... and ${sortedFiletypes.length - 25} more file types`, 22, yPos)
    yPos += 7
    doc.setFont(undefined, 'normal')
  }
  
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

