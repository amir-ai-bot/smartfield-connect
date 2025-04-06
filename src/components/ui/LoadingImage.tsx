
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface LoadingImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const LoadingImage: React.FC<LoadingImageProps> = ({ 
  src, 
  alt, 
  className, 
  fallbackSrc = '', 
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };
  
  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <svg 
            className="w-8 h-8 text-gray-300" 
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}
      
      <img 
        src={hasError ? fallbackSrc || 'https://via.placeholder.com/150?text=Image+Error' : src} 
        alt={alt} 
        className={cn("object-cover w-full h-full", isLoading && "opacity-0")} 
        onLoad={handleLoad} 
        onError={handleError} 
        {...props} 
      />
    </div>
  );
};
