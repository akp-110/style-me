import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for managing user profile data with Supabase persistence
 */
export const useProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        displayName: '',
        avatarUrl: '',
        stylePreferences: [],
        favouriteColors: [],
        favouriteBrands: [],
        countryCode: 'US', // Default to US
        calendarEvents: [],
        useCalendarContext: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Load profile from Supabase
    const loadProfile = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                // PGRST116 = no rows returned (new user)
                throw fetchError;
            }

            if (data) {
                setProfile({
                    displayName: data.display_name || '',
                    avatarUrl: data.avatar_url || '',
                    stylePreferences: data.style_preferences || [],
                    favouriteColors: data.favourite_colors || [],
                    favouriteBrands: data.favourite_brands || [],
                    countryCode: data.country_code || 'US',
                    calendarEvents: data.calendar_events || [],
                    useCalendarContext: data.use_calendar_context ?? true
                });
            }
        } catch (err) {
            console.error('Error loading profile:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Save profile to Supabase
    const saveProfile = useCallback(async (updates) => {
        if (!user) return;

        try {
            setSaving(true);
            setError(null);

            const profileData = {
                user_id: user.id,
                display_name: updates.displayName ?? profile.displayName,
                avatar_url: updates.avatarUrl ?? profile.avatarUrl,
                style_preferences: updates.stylePreferences ?? profile.stylePreferences,
                favourite_colors: updates.favouriteColors ?? profile.favouriteColors,
                favourite_brands: updates.favouriteBrands ?? profile.favouriteBrands,
                country_code: updates.countryCode ?? profile.countryCode,
                calendar_events: updates.calendarEvents ?? profile.calendarEvents,
                use_calendar_context: updates.useCalendarContext ?? profile.useCalendarContext
            };

            const { error: upsertError } = await supabase
                .from('user_profiles')
                .upsert(profileData, { onConflict: 'user_id' });

            if (upsertError) throw upsertError;

            // Update local state
            setProfile(prev => ({ ...prev, ...updates }));
        } catch (err) {
            console.error('Error saving profile:', err);
            setError(err.message);
            throw err;
        } finally {
            setSaving(false);
        }
    }, [user, profile]);

    // Upload avatar
    const uploadAvatar = useCallback(async (file) => {
        if (!user) return null;

        try {
            setSaving(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            // Upload to storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            // Update profile with new avatar URL
            await saveProfile({ avatarUrl: publicUrl });
            return publicUrl;
        } catch (err) {
            console.error('Error uploading avatar:', err);
            setError(err.message);
            throw err;
        } finally {
            setSaving(false);
        }
    }, [user, saveProfile]);

    // Change password
    const changePassword = useCallback(async (newPassword) => {
        try {
            setSaving(true);
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });
            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Error changing password:', err);
            setError(err.message);
            throw err;
        } finally {
            setSaving(false);
        }
    }, []);

    // Style profile helpers
    const addStylePreference = useCallback(async (pref) => {
        if (!pref.trim()) return;
        const updated = [...profile.stylePreferences, pref.trim()];
        await saveProfile({ stylePreferences: updated });
    }, [profile.stylePreferences, saveProfile]);

    const removeStylePreference = useCallback(async (index) => {
        const updated = profile.stylePreferences.filter((_, i) => i !== index);
        await saveProfile({ stylePreferences: updated });
    }, [profile.stylePreferences, saveProfile]);

    const addFavouriteColor = useCallback(async (color) => {
        if (!color.trim()) return;
        const updated = [...profile.favouriteColors, color.trim()];
        await saveProfile({ favouriteColors: updated });
    }, [profile.favouriteColors, saveProfile]);

    const removeFavouriteColor = useCallback(async (index) => {
        const updated = profile.favouriteColors.filter((_, i) => i !== index);
        await saveProfile({ favouriteColors: updated });
    }, [profile.favouriteColors, saveProfile]);

    const addFavouriteBrand = useCallback(async (brand) => {
        if (!brand.trim()) return;
        const updated = [...profile.favouriteBrands, brand.trim()];
        await saveProfile({ favouriteBrands: updated });
    }, [profile.favouriteBrands, saveProfile]);

    const removeFavouriteBrand = useCallback(async (index) => {
        const updated = profile.favouriteBrands.filter((_, i) => i !== index);
        await saveProfile({ favouriteBrands: updated });
    }, [profile.favouriteBrands, saveProfile]);

    // Calendar helpers
    const setCalendarEvents = useCallback(async (events) => {
        await saveProfile({ calendarEvents: events });
    }, [saveProfile]);

    const removeCalendarEvent = useCallback(async (index) => {
        const updated = profile.calendarEvents.filter((_, i) => i !== index);
        await saveProfile({ calendarEvents: updated });
    }, [profile.calendarEvents, saveProfile]);

    const clearCalendarEvents = useCallback(async () => {
        await saveProfile({ calendarEvents: [] });
    }, [saveProfile]);

    const setUseCalendarContext = useCallback(async (value) => {
        await saveProfile({ useCalendarContext: value });
    }, [saveProfile]);

    // Load profile on mount
    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    return {
        profile,
        loading,
        saving,
        error,
        loadProfile,
        saveProfile,
        uploadAvatar,
        changePassword,
        // Style profile
        addStylePreference,
        removeStylePreference,
        addFavouriteColor,
        removeFavouriteColor,
        addFavouriteBrand,
        removeFavouriteBrand,
        // Calendar
        calendarEvents: profile.calendarEvents,
        useCalendarContext: profile.useCalendarContext,
        setCalendarEvents,
        removeCalendarEvent,
        clearCalendarEvents,
        setUseCalendarContext
    };
};
