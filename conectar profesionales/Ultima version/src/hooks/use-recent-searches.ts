import { useState, useEffect } from "react";

export interface RecentSearch {
  id: string;
  query: string;
  timestamp: number;
  type?: 'user' | 'general';
}

const STORAGE_KEY = 'hsocial_recent_searches';
const MAX_RECENT_SEARCHES = 10;

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentSearches(parsed);
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);

  // Save recent searches to localStorage
  const saveToStorage = (searches: RecentSearch[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  };

  // Add a new search to recent searches
  const addSearch = (query: string, type: 'user' | 'general' = 'general') => {
    if (!query.trim()) return;

    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: Date.now(),
      type
    };

    setRecentSearches(prev => {
      // Remove existing search with same query (case insensitive)
      const filtered = prev.filter(
        search => search.query.toLowerCase() !== query.toLowerCase()
      );
      
      // Add new search at the beginning and limit to MAX_RECENT_SEARCHES
      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      saveToStorage(updated);
      return updated;
    });
  };

  // Remove a specific search
  const removeSearch = (id: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(search => search.id !== id);
      saveToStorage(updated);
      return updated;
    });
  };

  // Clear all recent searches
  const clearAllSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  return {
    recentSearches,
    addSearch,
    removeSearch,
    clearAllSearches
  };
}