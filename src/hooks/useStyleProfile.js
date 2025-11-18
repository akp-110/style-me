import { useState, useEffect } from 'react';

/**
 * Custom hook for managing style profile with localStorage persistence
 */
export const useStyleProfile = () => {
    const [styleProfile, setStyleProfile] = useState({
        preferences: [],
        colors: [],
        brands: []
    });
    const [showStyleModal, setShowStyleModal] = useState(false);
    const [newPref, setNewPref] = useState('');
    const [newColor, setNewColor] = useState('');
    const [newBrand, setNewBrand] = useState('');

    // Load style profile from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('styleProfile');
        if (saved) {
            try {
                setStyleProfile(JSON.parse(saved));
            } catch (error) {
                console.error('Error loading style profile:', error);
            }
        }
    }, []);

    // Save style profile to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('styleProfile', JSON.stringify(styleProfile));
    }, [styleProfile]);

    const addPreference = () => {
        if (newPref.trim()) {
            setStyleProfile(prev => ({
                ...prev,
                preferences: [...prev.preferences, newPref.trim()]
            }));
            setNewPref('');
        }
    };

    const addColor = () => {
        if (newColor.trim()) {
            setStyleProfile(prev => ({
                ...prev,
                colors: [...prev.colors, newColor.trim()]
            }));
            setNewColor('');
        }
    };

    const addBrand = () => {
        if (newBrand.trim()) {
            setStyleProfile(prev => ({
                ...prev,
                brands: [...prev.brands, newBrand.trim()]
            }));
            setNewBrand('');
        }
    };

    const removeItem = (category, index) => {
        setStyleProfile(prev => ({
            ...prev,
            [category]: prev[category].filter((_, i) => i !== index)
        }));
    };

    return {
        styleProfile,
        showStyleModal,
        setShowStyleModal,
        newPref,
        setNewPref,
        newColor,
        setNewColor,
        newBrand,
        setNewBrand,
        addPreference,
        addColor,
        addBrand,
        removeItem
    };
};
