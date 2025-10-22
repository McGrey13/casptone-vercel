import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ 
  message = "An error occurred", 
  onRetry = null,
  className = "",
  showIcon = true 
}) => {
  return (
    <div className={`flex items-center justify-center h-64 ${className}`}>
      <div className="text-center">
        {showIcon && (
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
        )}
        <p className="text-red-600 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
