import { useState, useEffect } from "react";
import type { ListingWithUser } from "@shared/schema";

const CACHE_KEY = "scroll_sold_feed_cache";
const CACHE_TIMESTAMP_KEY = "scroll_sold_feed_timestamp";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheData {
  listings: ListingWithUser[];
  timestamp: number;
}

export function useOfflineCache() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedListings, setCachedListings] = useState<ListingWithUser[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cached data on mount
    loadCachedData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCachedData = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cached && timestamp) {
        const cacheAge = Date.now() - parseInt(timestamp);
        
        if (cacheAge < CACHE_DURATION) {
          const parsedData: ListingWithUser[] = JSON.parse(cached);
          setCachedListings(parsedData);
        } else {
          // Cache expired, clear it
          clearCache();
        }
      }
    } catch (error) {
      console.error("Error loading cached data:", error);
      clearCache();
    }
  };

  const cacheListings = (listings: ListingWithUser[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(listings));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      setCachedListings(listings);
    } catch (error) {
      console.error("Error caching listings:", error);
    }
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    setCachedListings([]);
  };

  const getCachedListings = (): ListingWithUser[] => {
    return cachedListings;
  };

  const hasCachedData = (): boolean => {
    return cachedListings.length > 0;
  };

  const getCacheAge = (): number => {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return 0;
    return Date.now() - parseInt(timestamp);
  };

  const isCacheValid = (): boolean => {
    return getCacheAge() < CACHE_DURATION;
  };

  return {
    isOnline,
    cachedListings,
    cacheListings,
    clearCache,
    getCachedListings,
    hasCachedData,
    getCacheAge,
    isCacheValid,
  };
}