import React, { useState } from 'react'
import FileUploader from './components/FileUploader'
import ResultsDisplay from './components/ResultsDisplay'
import Header from './components/Header'
import { FileData } from './types'
import { generatePDFSummary } from './utils/pdfGenerator'

function App() {
  const [results, setResults] = useState<FileData[]>([])
  const [processing, setProcessing] = useState(false)
  const [selectedModel, setSelectedModel] = useState('signature-based')

  const handleFilesProcessed = (newResults: FileData[]) => {
    setResults(prev => [...newResults, ...prev])
  }

  const clearResults = () => {
    setResults([])
  }

  const downloadPDFSummary = () => {
    try {
      const pdf = generatePDFSummary(results)
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
    </div>
  )
}

export default App

