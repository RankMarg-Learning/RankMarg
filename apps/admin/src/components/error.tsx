import { RefreshCcwIcon } from 'lucide-react'
import React from 'react'

const ErrorCTA = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="text-red-500 text-lg font-medium mb-2">
          Error loading data
        </div>  
        <div className="text-gray-600 text-sm text-center">
          {message || 'Something went wrong while loading your practice results.'}
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors flex items-center gap-2"
        >
            <RefreshCcwIcon className="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>
  )
}

export default ErrorCTA