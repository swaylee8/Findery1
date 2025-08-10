import { useState, useEffect, useCallback, useRef } from 'react';
import type { Listing } from '@shared/schema';

interface SmartLoadingOptions {
  preloadCount: number; // How many items to preload ahead/behind
  bufferSize: number; // Total buffer size around current position
  threshold: number; // When to start loading more (distance from edge)
}

export function useSmartLoading(
  listings: Listing[],
  currentIndex: number,
  options: SmartLoadingOptions = {
    preloadCount: 3,
    bufferSize: 10,
    threshold: 2
  }
) {
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(new Set());
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const loadingQueue = useRef<Set<number>>(new Set());

  // Preload images for better performance
  const preloadImage = useCallback((url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      if (imageCache.current.has(url)) {
        resolve(imageCache.current.get(url)!);
        return;
      }

      const img = new Image();
      img.onload = () => {
        imageCache.current.set(url, img);
        setPreloadedImages(prev => new Set(prev).add(url));
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }, []);

  // Calculate which indices should be loaded
  const calculateLoadIndices = useCallback((centerIndex: number) => {
    const { preloadCount, bufferSize } = options;
    const totalItems = listings.length;
    
    const start = Math.max(0, centerIndex - preloadCount);
    const end = Math.min(totalItems - 1, centerIndex + preloadCount);
    
    const indices = new Set<number>();
    for (let i = start; i <= end; i++) {
      indices.add(i);
    }
    
    return indices;
  }, [listings.length, options]);

  // Load content for specific indices
  const loadIndices = useCallback(async (indices: Set<number>) => {
    const toLoad = Array.from(indices).filter(index => {
      return !loadedIndices.has(index) && 
             !loadingQueue.current.has(index) && 
             index >= 0 && 
             index < listings.length;
    });

    if (toLoad.length === 0) return;

    // Add to loading queue
    toLoad.forEach(index => loadingQueue.current.add(index));

    // Load images in parallel but with priority for closer items
    const loadPromises = toLoad
      .sort((a, b) => Math.abs(a - currentIndex) - Math.abs(b - currentIndex))
      .map(async (index) => {
        const listing = listings[index];
        if (!listing?.images?.length) return index;

        try {
          // Load primary image
          await preloadImage(listing.images[0]);
          
          // Load additional images with lower priority
          if (listing.images.length > 1) {
            // Don't await these, let them load in background
            listing.images.slice(1, 3).forEach(img => {
              setTimeout(() => preloadImage(img), 100 * Math.abs(index - currentIndex));
            });
          }

          return index;
        } catch (error) {
          console.warn(`Failed to preload image for listing ${listing.id}:`, error);
          return index;
        }
      });

    // Wait for all loads to complete
    const loadedIndexes = await Promise.allSettled(loadPromises);
    
    // Update loaded indices
    setLoadedIndices(prev => {
      const newSet = new Set(prev);
      loadedIndexes.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          newSet.add(toLoad[i]);
        }
        loadingQueue.current.delete(toLoad[i]);
      });
      return newSet;
    });
  }, [loadedIndices, listings, currentIndex, preloadImage]);

  // Smart loading effect
  useEffect(() => {
    const indicesToLoad = calculateLoadIndices(currentIndex);
    loadIndices(indicesToLoad);
  }, [currentIndex, calculateLoadIndices, loadIndices]);

  // Cleanup old entries when buffer gets too large
  useEffect(() => {
    const { bufferSize } = options;
    
    if (loadedIndices.size > bufferSize * 2) {
      const sortedLoaded = Array.from(loadedIndices).sort((a, b) => 
        Math.abs(a - currentIndex) - Math.abs(b - currentIndex)
      );
      
      // Keep only the closest items
      const toKeep = new Set(sortedLoaded.slice(0, bufferSize));
      const toRemove = sortedLoaded.slice(bufferSize);
      
      // Remove images from cache for far items
      toRemove.forEach(index => {
        if (index >= 0 && index < listings.length) {
          const listing = listings[index];
          listing.images?.forEach(imgUrl => {
            if (imageCache.current.has(imgUrl)) {
              // Don't remove immediately, keep for a bit in case user scrolls back
              setTimeout(() => {
                if (Math.abs(index - currentIndex) > bufferSize) {
                  imageCache.current.delete(imgUrl);
                  setPreloadedImages(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(imgUrl);
                    return newSet;
                  });
                }
              }, 10000); // 10 second grace period
            }
          });
        }
      });
      
      setLoadedIndices(toKeep);
    }
  }, [loadedIndices, currentIndex, options, listings]);

  // Check if content should be loaded immediately vs lazy
  const shouldLoadEagerly = useCallback((index: number) => {
    return Math.abs(index - currentIndex) <= 1; // Current and adjacent items
  }, [currentIndex]);

  // Check if image is preloaded
  const isImagePreloaded = useCallback((url: string) => {
    return preloadedImages.has(url);
  }, [preloadedImages]);

  // Get loading priority for an index
  const getLoadingPriority = useCallback((index: number) => {
    const distance = Math.abs(index - currentIndex);
    if (distance === 0) return 'immediate';
    if (distance === 1) return 'high';
    if (distance <= 3) return 'medium';
    return 'low';
  }, [currentIndex]);

  return {
    isContentLoaded: (index: number) => loadedIndices.has(index),
    shouldLoadEagerly,
    isImagePreloaded,
    getLoadingPriority,
    preloadedCount: preloadedImages.size,
    loadedCount: loadedIndices.size
  };
}