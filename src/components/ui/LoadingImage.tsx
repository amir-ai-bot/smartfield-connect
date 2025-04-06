
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LoadingImage({
  src,
  alt,
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1516267126728-e517143465af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  onLoad,
  onError
}: LoadingImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    setImageSrc(src);
    setRetryCount(0);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    if (retryCount < MAX_RETRIES) {
      // Try loading the image again with a cache-busting parameter
      setRetryCount(prev => prev + 1);
      setImageSrc(`${src}${src.includes('?') ? '&' : '?'}retry=${retryCount + 1}`);
    } else {
      setIsLoading(false);
      setError(true);
      setImageSrc(fallbackSrc);
      if (onError) onError();
    }
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
