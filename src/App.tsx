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
    setResults(prev => [...newResults, ...prev])
    
    // Accumulate timing data
    if (timing) {
      setCumulativeTiming(prev => {
        const newTotalFiles = prev.filesProcessed + timing.filesProcessed
        const newTotalTime = prev.totalTime + timing.totalTime
        const newClassificationTime = prev.classificationTime + timing.classificationTime
        const newDecodeTime = prev.decodeTime + timing.decodeTime
        const newAvgPerFile = newTotalFiles > 0 ? newClassificationTime / newTotalFiles : 0
        
        // If this update includes real elapsed time, use it
        const realElapsedTime = timing.realElapsedTime 
          ? timing.realElapsedTime 
          : prev.realElapsedTime
        
        const updated = {
          totalTime: newTotalTime,
          classificationTime: newClassificationTime,
          decodeTime: newDecodeTime,
          filesProcessed: newTotalFiles,
          avgPerFile: newAvgPerFile,
          realElapsedTime: realElapsedTime
        }
        
        console.log('📊 Timing Update:')
        console.log(`  Batch: +${timing.filesProcessed} files, +${timing.classificationTime.toFixed(3)}s`)
        console.log(`  Cumulative: ${newTotalFiles} files, ${newClassificationTime.toFixed(3)}s backend`)
        console.log(`  Real Elapsed: ${realElapsedTime?.toFixed(3) || 'N/A'}s`)
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
          {/* Model Selection */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">AI Model Selection</h3>
                <p className="text-sm text-gray-400">Choose the classification model to use</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-300 font-medium">Model:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={processing}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="signature-based" className="bg-slate-800">Signature-Based (Fast)</option>
                  <option value="magic-library" className="bg-slate-800">Magic Library (Accurate)</option>
                  <option value="hybrid" className="bg-slate-800">Hybrid (Balanced)</option>
                  <option value="ml-enhanced" className="bg-slate-800">ML-Enhanced (Experimental)</option>
                </select>
                <div className="px-3 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                  <span className="text-xs text-blue-300 font-medium">Current: {selectedModel}</span>
                </div>
              </div>
            </div>
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

