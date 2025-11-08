import { FileSearch } from 'lucide-react'

const Header = () => {
  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <FileSearch className="w-8 h-8 text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                AI File Classifier
              </h1>
              <p className="text-sm text-gray-400">
                NCAT Fall Hackathon 2025
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Powered by</p>
              <p className="text-sm font-semibold text-primary-400">
                The A Team
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

