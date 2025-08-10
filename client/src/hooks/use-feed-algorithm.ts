import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import type { Listing } from '@shared/schema';

interface UserInteraction {
  listingId: number;
  type: 'view' | 'like' | 'save' | 'share' | 'skip';
  timestamp: number;
  duration?: number; // time spent viewing in milliseconds
  category: string;
}

interface FeedPreferences {
  categoryWeights: Record<string, number>; // homes: 0.4, cars: 0.3, boats: 0.3
  priceRangePreference: { min: number; max: number };
  locationPreference: string[];
  engagementScore: number;
}

export function useFeedAlgorithm() {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [preferences, setPreferences] = useState<FeedPreferences>({
    categoryWeights: { homes: 0.33, cars: 0.33, boats: 0.34 },
    priceRangePreference: { min: 0, max: 10000000 },
    locationPreference: [],
    engagementScore: 1.0
  });

  // Load preferences from localStorage
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`feed_preferences_${user.id}`);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
      
      const storedInteractions = localStorage.getItem(`interactions_${user.id}`);
      if (storedInteractions) {
        setInteractions(JSON.parse(storedInteractions));
      }
    }
  }, [user]);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences: FeedPreferences) => {
    if (user) {
      localStorage.setItem(`feed_preferences_${user.id}`, JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    }
  }, [user]);

  // Track user interaction
  const trackInteraction = useCallback((interaction: Omit<UserInteraction, 'timestamp'>) => {
    const newInteraction = {
      ...interaction,
      timestamp: Date.now()
    };
    
    if (user) {
      // Get current interactions from localStorage to avoid state dependency
      const currentInteractions = JSON.parse(localStorage.getItem(`interactions_${user.id}`) || '[]');
      const updatedInteractions = [...currentInteractions, newInteraction].slice(-1000); // Keep only last 1000
      
      localStorage.setItem(`interactions_${user.id}`, JSON.stringify(updatedInteractions));
      setInteractions(updatedInteractions);
      
      // Update preferences based on interactions
      updatePreferencesFromInteractions(updatedInteractions);
    }
  }, [user, updatePreferencesFromInteractions]);

  // Update preferences based on user behavior
  const updatePreferencesFromInteractions = useCallback((userInteractions: UserInteraction[]) => {
    const recentInteractions = userInteractions.filter(
      interaction => Date.now() - interaction.timestamp < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    );

    if (recentInteractions.length === 0) return;

    // Calculate category weights based on engagement
    const categoryEngagement: Record<string, { total: number; positive: number }> = {
      homes: { total: 0, positive: 0 },
      cars: { total: 0, positive: 0 },
      boats: { total: 0, positive: 0 }
    };

    recentInteractions.forEach(interaction => {
      const category = interaction.category;
      if (categoryEngagement[category]) {
        categoryEngagement[category].total++;
        if (['like', 'save', 'share'].includes(interaction.type)) {
          categoryEngagement[category].positive++;
        }
        // Long view duration also counts as positive
        if (interaction.type === 'view' && interaction.duration && interaction.duration > 5000) {
          categoryEngagement[category].positive += 0.5;
        }
      }
    });

    // Calculate new weights
    const totalInteractions = recentInteractions.length;
    const currentPrefs = JSON.parse(localStorage.getItem(`feed_preferences_${user?.id}`) || '{}');
    const currentWeights = currentPrefs.categoryWeights || { homes: 0.33, cars: 0.33, boats: 0.34 };
    const newCategoryWeights = { ...currentWeights };

    Object.keys(categoryEngagement).forEach(category => {
      const { total, positive } = categoryEngagement[category];
      if (total > 0) {
        const engagementRate = positive / total;
        const frequency = total / totalInteractions;
        // Combine engagement rate and frequency
        newCategoryWeights[category] = Math.max(0.1, Math.min(0.8, engagementRate * 0.7 + frequency * 0.3));
      }
    });

    // Normalize weights to sum to 1
    const weightSum = Object.values(newCategoryWeights).reduce((sum, weight) => sum + weight, 0);
    Object.keys(newCategoryWeights).forEach(category => {
      newCategoryWeights[category] = newCategoryWeights[category] / weightSum;
    });

    const updatedPreferences = {
      categoryWeights: newCategoryWeights,
      priceRangePreference: currentPrefs.priceRangePreference || { min: 0, max: 10000000 },
      locationPreference: currentPrefs.locationPreference || [],
      engagementScore: currentPrefs.engagementScore || 1.0
    };

    if (user) {
      localStorage.setItem(`feed_preferences_${user.id}`, JSON.stringify(updatedPreferences));
      setPreferences(updatedPreferences);
    }
  }, [user]);

  // Personalized feed algorithm
  const personalizeListings = useCallback((listings: Listing[]): Listing[] => {
    if (!user || listings.length === 0) return listings;

    const currentPrefs = preferences;
    const storedInteractions = JSON.parse(localStorage.getItem(`interactions_${user.id}`) || '[]');
    
    const scoredListings = listings.map(listing => {
      let score = 1.0;

      // Category preference weight
      const categoryWeight = currentPrefs.categoryWeights[listing.category] || 0.33;
      score *= (1 + categoryWeight);

      // Price preference (prefer listings in user's typical price range)
      const userInteractedListings = storedInteractions
        .filter((i: UserInteraction) => i.type === 'like' || i.type === 'save')
        .map((i: UserInteraction) => listings.find(l => l.id === i.listingId))
        .filter(Boolean) as Listing[];

      if (userInteractedListings.length > 0) {
        const avgPrice = userInteractedListings.reduce((sum, l) => sum + l.price, 0) / userInteractedListings.length;
        const priceDistance = Math.abs(listing.price - avgPrice) / avgPrice;
        score *= Math.max(0.5, 1 - priceDistance * 0.5);
      }

      // Recency boost for newer listings
      if (listing.createdAt) {
        const daysSinceCreated = (Date.now() - new Date(listing.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreated < 7) {
          score *= 1.2; // Boost recent listings
        }
      }

      // Diversity penalty (avoid showing too many similar listings in a row)
      const recentViews = storedInteractions
        .filter((i: UserInteraction) => i.type === 'view' && Date.now() - i.timestamp < 60000) // Last minute
        .slice(-5); // Last 5 views

      const sameCategoryRecent = recentViews.filter((i: UserInteraction) => i.category === listing.category).length;
      if (sameCategoryRecent >= 3) {
        score *= 0.7; // Reduce score for too much of same category
      }

      return { listing, score };
    });

    // Sort by score and add some randomization
    return scoredListings
      .sort((a, b) => {
        // Add slight randomization to avoid deterministic ordering
        const randomFactor = (Math.random() - 0.5) * 0.1;
        return (b.score - a.score) + randomFactor;
      })
      .map(item => item.listing);
  }, [user, preferences]);

  return {
    personalizeListings,
    trackInteraction,
    preferences,
    updatePreferences: savePreferences,
    interactions
  };
}