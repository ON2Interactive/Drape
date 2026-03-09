import { useState, useEffect } from 'react';

const STORAGE_KEY = 'drape_favorites_collection';

export const useFavoritesStore = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setFavorites(JSON.parse(saved));
        }
        setLoading(false);
    }, []);

    const saveToStorage = (newFavorites) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
        setFavorites(newFavorites);
    };

    const addFavorite = (imageData) => {
        const newItem = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            image: imageData,
        };
        const newFavorites = [newItem, ...favorites];
        saveToStorage(newFavorites);
    };

    const removeFavorite = (id) => {
        const newFavorites = favorites.filter((item) => item.id !== id);
        saveToStorage(newFavorites);
    };

    return {
        favorites,
        loading,
        addFavorite,
        removeFavorite,
    };
};
