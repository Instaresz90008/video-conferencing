
import { useState, useMemo } from 'react';

export interface SearchableItem {
  id: string;
  label: string;
  description?: string;
  category: string;
  keywords?: string[];
  component?: string;
}

export const useSettingsSearch = (searchableItems: SearchableItem[]) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return searchableItems;
    }

    const lowercaseSearch = searchTerm.toLowerCase();
    
    return searchableItems.filter(item => {
      // Search in label
      if (item.label.toLowerCase().includes(lowercaseSearch)) {
        return true;
      }
      
      // Search in description
      if (item.description?.toLowerCase().includes(lowercaseSearch)) {
        return true;
      }
      
      // Search in category
      if (item.category.toLowerCase().includes(lowercaseSearch)) {
        return true;
      }
      
      // Search in keywords
      if (item.keywords?.some(keyword => 
        keyword.toLowerCase().includes(lowercaseSearch)
      )) {
        return true;
      }
      
      return false;
    });
  }, [searchableItems, searchTerm]);

  const groupedResults = useMemo(() => {
    const grouped = filteredItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, SearchableItem[]>);

    return grouped;
  }, [filteredItems]);

  const clearSearch = () => setSearchTerm('');

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
    groupedResults,
    clearSearch,
    hasResults: filteredItems.length > 0,
    resultCount: filteredItems.length
  };
};
