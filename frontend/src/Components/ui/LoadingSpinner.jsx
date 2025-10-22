import React from 'react';
import { RefreshCw } from 'lucide-react';

const LoadingSpinner = ({ 
  message = "Loading...", 
  size = "default",
  className = "",
  showIcon = true 
}) => {
  const sizeClasses = {
    small: "h-6 w-6",
    default: "h-8 w-8", 
    large: "h-12 w-12"
  };

  const containerClasses = {
    small: "h-32",
    default: "h-64",
    large: "h-80"
  };

  return (
    <div className={`flex items-center justify-center ${containerClasses[size]} ${className}`}>
      <div className="text-center">
        {showIcon && (
          <RefreshCw className={`${sizeClasses[size]} animate-spin mx-auto mb-4 text-blue-600`} />
        )}
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
