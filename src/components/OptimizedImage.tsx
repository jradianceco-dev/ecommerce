/**
 * Optimized Image Component
 * 
 * Handles image loading, error states, and lazy loading
 * Improves performance and user experience
 */

"use client";

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { Loader2, Image as ImageIcon, RefreshCw } from 'lucide-react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  showLoading?: boolean;
  retryOnError?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/placeholder-image.png',
  showLoading = true,
  retryOnError = true,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    setHasError(false);
  };

  // Force reload on retry by appending query param
  const imageSrc = retryCount > 0 ? `${src}?retry=${retryCount}` : src;

  return (
    <div className={`relative ${className}`}>
      {/* Loading state */}
      {isLoading && showLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-radiance-goldColor" />
        </div>
      )}

      {/* Error state */}
      {hasError && retryOnError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4 text-center">
          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 mb-2">Failed to load image</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1 text-xs text-radiance-goldColor hover:underline"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      ) : hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      ) : null}

      {/* Actual image */}
      <Image
        {...props}
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
}

/**
 * Product Image Component (specialized for product images)
 */
export function ProductImage({
  src,
  alt,
  className = '',
  ...props
}: Omit<OptimizedImageProps, 'fallbackSrc' | 'showLoading' | 'retryOnError'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      fallbackSrc="/placeholder-product.png"
      showLoading={true}
      retryOnError={true}
      {...props}
    />
  );
}

/**
 * Avatar Image Component (specialized for user avatars)
 */
export function AvatarImage({
  src,
  alt,
  className = '',
  ...props
}: Omit<OptimizedImageProps, 'fallbackSrc' | 'showLoading' | 'retryOnError'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      fallbackSrc="/placeholder-avatar.png"
      showLoading={false}
      retryOnError={false}
      {...props}
    />
  );
}
