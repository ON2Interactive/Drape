import { useState, useEffect } from 'react';

const STORAGE_KEY = 'drape_user_profile';

export const useUserStore = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setProfile(JSON.parse(saved));
        }
        setLoading(false);
    }, []);

    const saveProfile = (data) => {
        const newProfile = { ...profile, ...data };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
        setProfile(newProfile);
    };

    const clearProfile = () => {
        localStorage.removeItem(STORAGE_KEY);
        setProfile(null);
    };

    const isComplete = profile?.gender && profile?.photo;

    return {
        profile,
        loading,
        saveProfile,
        clearProfile,
        isComplete
    };
};
