import { useState } from 'react'
import FileUploader from './components/FileUploader'
import ResultsDisplay from './components/ResultsDisplay'
import Header from './components/Header'
import { FileData } from './types'

function App() {
  const [results, setResults] = useState<FileData[]>([])
  const [processing, setProcessing] = useState(false)

  const handleFilesProcessed = (newResults: FileData[]) => {
    setResults(prev => [...newResults, ...prev])
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Upload Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <FileUploader 
              onFilesProcessed={handleFilesProcessed}
              processing={processing}
              setProcessing={setProcessing}
            />
          </div>

          {/* Results Section */}
          {results.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Uploaded Files ({results.length})
                </h2>
                <button
                  onClick={clearResults}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors border border-red-400/30"
                >
                  Clear All
                </button>
              </div>
              <ResultsDisplay results={results} />
            </div>
          )}

          {/* Info Section */}
          {results.length === 0 && !processing && (
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">
                File to Binary Converter
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-gray-300">
                <div className="space-y-2">
                  <div className="text-3xl">📁</div>
                  <h4 className="font-semibold text-white">Upload Files</h4>
                  <p className="text-sm">
                    Drag and drop or click to upload any file type. All files will be converted to binary data.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl">🔢</div>
                  <h4 className="font-semibold text-white">Binary Conversion</h4>
                  <p className="text-sm">
                    Files are read as binary data (ArrayBuffer) and displayed as hexadecimal bytes.
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

