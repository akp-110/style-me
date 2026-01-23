import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export function useOutfits() {
    const [outfits, setOutfits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // Fetch user's outfits
    const fetchOutfits = useCallback(async () => {
        if (!user) {
            setOutfits([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('saved_outfits')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setOutfits(data || []);
        } catch (err) {
            console.error('Error fetching outfits:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Save a new outfit
    const saveOutfit = async ({ photoDataUrl, ratingText, socialSummary, advisorMode, numericRating }) => {
        if (!user) {
            throw new Error('Must be logged in to save outfits');
        }

        setLoading(true);
        setError(null);

        try {
            // Upload photo to Supabase Storage
            const fileName = `${user.id}/${Date.now()}.jpg`;
            const base64Data = photoDataUrl.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('outfit-images')
                .upload(fileName, blob, {
                    contentType: 'image/jpeg',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('outfit-images')
                .getPublicUrl(fileName);

            // Save outfit record
            const { data, error: insertError } = await supabase
                .from('saved_outfits')
                .insert({
                    user_id: user.id,
                    image_url: publicUrl,
                    rating_text: ratingText,
                    social_summary: socialSummary,
                    advisor_mode: advisorMode,
                    numeric_rating: numericRating
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Add to local state
            setOutfits(prev => [data, ...prev]);
            return data;
        } catch (err) {
            console.error('Error saving outfit:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete an outfit
    const deleteOutfit = async (outfitId, imageUrl) => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            // Delete from storage
            const fileName = imageUrl.split('/').slice(-2).join('/');
            await supabase.storage.from('outfit-images').remove([fileName]);

            // Delete record
            const { error: deleteError } = await supabase
                .from('saved_outfits')
                .delete()
                .eq('id', outfitId)
                .eq('user_id', user.id);

            if (deleteError) throw deleteError;

            // Remove from local state
            setOutfits(prev => prev.filter(o => o.id !== outfitId));
        } catch (err) {
            console.error('Error deleting outfit:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Fetch outfits when user changes
    useEffect(() => {
        fetchOutfits();
    }, [fetchOutfits]);

    return {
        outfits,
        loading,
        error,
        saveOutfit,
        deleteOutfit,
        fetchOutfits
    };
}
