import React, { useState, useEffect } from 'react'
import FileUploader from './components/FileUploader'
import ResultsDisplay from './components/ResultsDisplay'
import Header from './components/Header'
import { FileData, TimingData } from './types'
import { generatePDFSummary } from './utils/pdfGenerator'

function App() {
  const [results, setResults] = useState<FileData[]>([])
  const [processing, setProcessing] = useState(false)
  const [selectedModel, setSelectedModel] = useState('signature-based')
  const [branchName, setBranchName] = useState<string>('loading...')
  const [cumulativeTiming, setCumulativeTiming] = useState<TimingData>({
    totalTime: 0,
    classificationTime: 0,
    decodeTime: 0,
    filesProcessed: 0,
    avgPerFile: 0
  })

  // Fetch current git branch name
  useEffect(() => {
    fetch('http://localhost:5000/api/branch')
      .then(res => res.json())
      .then(data => setBranchName(data.branch))
      .catch(() => setBranchName('unknown'))
  }, [])

  const handleFilesProcessed = (newResults: FileData[], timing?: TimingData) => {
    // Only add results if there are any
    if (newResults.length > 0) {
      setResults(prev => [...newResults, ...prev])
    }
    
    // Accumulate timing data
    if (timing) {
      setCumulativeTiming(prev => {
        // Check if this is a special update for realElapsedTime only
        const isRealTimeUpdate = timing.filesProcessed === 0 && timing.realElapsedTime !== undefined
        
        if (isRealTimeUpdate) {
          // Just update the realElapsedTime, keep everything else
          console.log('📊 Final Timing Update (Real Elapsed Time):')
          console.log(`  Total Real Elapsed: ${timing.realElapsedTime.toFixed(3)}s`)
          return {
            ...prev,
            realElapsedTime: timing.realElapsedTime
          }
        }
        
        // Normal batch timing update
        const newTotalFiles = prev.filesProcessed + timing.filesProcessed
        const newTotalTime = prev.totalTime + timing.totalTime
        const newClassificationTime = prev.classificationTime + timing.classificationTime
        const newDecodeTime = prev.decodeTime + timing.decodeTime
        const newAvgPerFile = newTotalFiles > 0 ? newClassificationTime / newTotalFiles : 0
        
        const updated = {
          totalTime: newTotalTime,
          classificationTime: newClassificationTime,
          decodeTime: newDecodeTime,
          filesProcessed: newTotalFiles,
          avgPerFile: newAvgPerFile,
          realElapsedTime: prev.realElapsedTime // Keep existing realElapsedTime
        }
        
        console.log('📊 Batch Timing Update:')
        console.log(`  Batch: +${timing.filesProcessed} files, +${timing.classificationTime.toFixed(3)}s`)
        console.log(`  Cumulative: ${newTotalFiles} files, ${newClassificationTime.toFixed(3)}s backend`)
        console.log(`  Average per file: ${(newAvgPerFile * 1000).toFixed(2)}ms`)
        
        return updated
      })
    }
  }

  const clearResults = () => {
    setResults([])
    setCumulativeTiming({
      totalTime: 0,
      classificationTime: 0,
      decodeTime: 0,
      filesProcessed: 0,
      avgPerFile: 0
    })
  }

  const downloadPDFSummary = () => {
    try {
      const pdf = generatePDFSummary(results, cumulativeTiming)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      pdf.save(`file-classification-summary-${timestamp}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF summary')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Detection Model Selection */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Detection Model</h3>
                <p className="text-sm text-gray-400">Choose the file type detection method</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-300 font-medium">Model:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={processing}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="signature-based" className="bg-slate-800">
                    Signature-Based (Current) - Magic Bytes Detection
                  </option>
                  <option value="magika-ai" className="bg-slate-800">
                    Google Magika (AI) - Deep Learning Model (~99% accuracy)
                  </option>
                </select>
                <div className="px-3 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    {selectedModel === 'magika-ai' ? (
                      <>
                        <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" />
                        </svg>
                        <span className="text-xs text-purple-300 font-medium">AI Model</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs text-green-300 font-medium">Rule-Based</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Model Information */}
            {selectedModel === 'magika-ai' ? (
              <div className="mt-4 p-4 bg-purple-500/10 border border-purple-400/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-purple-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-purple-300 mb-2">Google Magika - AI-Powered Detection</h4>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• Deep learning model trained on 100M+ files</li>
                      <li>• ~99% accuracy across 200+ content types</li>
                      <li>• 5ms inference time per file</li>
                      <li>• Used by Gmail, Drive, and VirusTotal</li>
                      <li>• Requires installation: <code className="bg-black/30 px-1 rounded">pip install magika</code></li>
                    </ul>
                    <a 
                      href="https://github.com/google/magika" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mt-2"
                    >
                      <span>View on GitHub</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-400/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-green-300 mb-2">Signature-Based Detection (Active)</h4>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• Binary magic bytes pattern matching</li>
                      <li>• Python-magic library fallback</li>
                      <li>• 95-100% accuracy for files with clear signatures</li>
                      <li>• Extremely fast (~0.15ms per file)</li>
                      <li>• No external dependencies required</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upload Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <FileUploader 
              onFilesProcessed={handleFilesProcessed}
              processing={processing}
              setProcessing={setProcessing}
              selectedModel={selectedModel}
            />
          </div>

          {/* Results Section */}
          {results.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Uploaded Files ({results.length})
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={downloadPDFSummary}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors border border-blue-400/30 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF Summary
                  </button>
                  <button
                    onClick={clearResults}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors border border-red-400/30"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <ResultsDisplay results={results} />
            </div>
          )}

          {/* Info Section */}
          {results.length === 0 && !processing && (
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">
                AI File Classification System
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-gray-300">
                <div className="space-y-2">
                  <div className="text-3xl">📁</div>
                  <h4 className="font-semibold text-white">Upload Files</h4>
                  <p className="text-sm">
                    Drag and drop or click to upload any file type. Our AI will classify each file automatically.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl">📦</div>
                  <h4 className="font-semibold text-white">ZIP Extraction</h4>
                  <p className="text-sm">
                    Upload ZIP files to automatically extract and classify every file within every folder.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl">🤖</div>
                  <h4 className="font-semibold text-white">AI Classification</h4>
                  <p className="text-sm">
                    AI analyzes binary signatures and content to identify file types with confidence scores.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Branch Name Display - Bottom Right */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-2xl border border-white/20">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10.9,2.1c-4.6,0.5-8.3,4.2-8.8,8.7c-0.5,4.7,2.2,8.9,6.3,10.5C8.7,21.4,9,21.2,9,20.8v-1.6c0,0-0.4,0.1-0.9,0.1 c-1.4,0-2-1.2-2.1-1.9c-0.1-0.4-0.3-0.7-0.6-1C5.1,16.3,5,16.3,5,16.2C5,16,5.3,16,5.4,16c0.6,0,1.1,0.7,1.3,1c0.5,0.8,1.1,1,1.4,1 c0.4,0,0.7-0.1,0.9-0.2c0.1-0.7,0.4-1.4,1-1.8c-2.3-0.5-4-1.8-4-4c0-1.1,0.5-2.2,1.2-3C7.1,8.8,7,8.3,7,7.6C7,7.2,7,6.6,7.3,6 c0,0,1.4,0,2.8,1.3C10.6,7.1,11.3,7,12,7s1.4,0.1,2,0.3C15.3,6,16.8,6,16.8,6C17,6.6,17,7.2,17,7.6c0,0.8-0.1,1.2-0.2,1.4 c0.7,0.8,1.2,1.8,1.2,3c0,2.2-1.7,3.5-4,4c0.6,0.5,1,1.4,1,2.3v2.6c0,0.3,0.3,0.6,0.7,0.5c3.7-1.5,6.3-5.1,6.3-9.3 C22,6.1,16.9,1.4,10.9,2.1z"/>
            </svg>
            <span className="text-sm font-semibold text-white">Branch:</span>
            <span className="text-sm font-mono text-white bg-black/30 px-2 py-0.5 rounded">
              {branchName}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

