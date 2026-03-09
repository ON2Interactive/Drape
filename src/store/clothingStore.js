import { useState, useEffect } from 'react';

// Simple store using a custom hook for local state management
// This can be expanded to use context or a dedicated library if needed
const STORAGE_KEY = 'drape_clothing_collection';

export const useClothingStore = () => {
    const [collection, setCollection] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setCollection(JSON.parse(saved));
        }
        setLoading(false);
    }, []);

    const saveToStorage = (newCollection) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newCollection));
        setCollection(newCollection);
    };

    const addItem = (item) => {
        const newItem = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            ...item,
        };
        const newCollection = [...collection, newItem];
        saveToStorage(newCollection);
    };

    const removeItem = (id) => {
        const newCollection = collection.filter((item) => item.id !== id);
        saveToStorage(newCollection);
    };

    const updateItem = (id, updates) => {
        const newCollection = collection.map((item) =>
            item.id === id ? { ...item, ...updates } : item
        );
        saveToStorage(newCollection);
    };

    return {
        collection,
        loading,
        addItem,
        removeItem,
        updateItem,
    };
};
