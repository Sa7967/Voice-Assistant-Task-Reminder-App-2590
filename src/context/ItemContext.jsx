import React, { createContext, useContext, useState, useEffect } from 'react';

const ItemContext = createContext();

export const useItem = () => {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error('useItem must be used within an ItemProvider');
  }
  return context;
};

export const ItemProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Load items from localStorage
    const savedItems = localStorage.getItem('voiceAssistantItems');
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems);
        setItems(parsedItems);
      } catch (error) {
        console.error('Error loading items:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save items to localStorage
    localStorage.setItem('voiceAssistantItems', JSON.stringify(items));
  }, [items]);

  const addItem = (item) => {
    setItems(prev => [...prev, item]);
  };

  const deleteItem = (itemId) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const findItem = (searchTerm) => {
    const term = searchTerm.toLowerCase();
    return items.find(item => 
      item.name.toLowerCase().includes(term) ||
      item.location.toLowerCase().includes(term)
    );
  };

  const value = {
    items,
    addItem,
    deleteItem,
    findItem
  };

  return (
    <ItemContext.Provider value={value}>
      {children}
    </ItemContext.Provider>
  );
};