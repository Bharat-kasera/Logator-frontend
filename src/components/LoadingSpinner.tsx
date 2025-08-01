import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'orange' | 'green' | 'blue' | 'gray';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'lg',
  color = 'orange',
  message = 'Loading...',
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    orange: 'text-orange-500',
    green: 'text-green-500',
    blue: 'text-blue-500',
    gray: 'text-gray-500'
  };

  const containerClasses = fullScreen 
    ? "min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center"
    : "flex items-center justify-center p-8";

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <div className="relative">
          {/* Main spinner */}
          <svg
            className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} mx-auto`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          
          {/* Pulsing background circle */}
          <div 
            className={`absolute inset-0 ${sizeClasses[size]} mx-auto rounded-full bg-gradient-to-r from-orange-200 to-orange-300 opacity-20 animate-pulse`}
            style={{ animationDelay: '0.5s' }}
          />
        </div>
        
        {message && (
          <div className="mt-4 space-y-2">
            <p className="text-gray-700 font-medium">{message}</p>
            <div className="flex justify-center space-x-1">
              <div className={`h-1 w-1 ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
              <div className={`h-1 w-1 ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
              <div className={`h-1 w-1 ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;