import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import {
    OUTFIT_BUCKET, attachSignedOutfitUrls, deletePrivateOutfit, persistPrivateOutfit
} from '../lib/outfitStorage';

export function useOutfits() {
    const [outfits, setOutfits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

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
            const signed = await attachSignedOutfitUrls(data || [], supabase.storage.from(OUTFIT_BUCKET));
            setOutfits(signed);
        } catch (err) {
            console.error('Error fetching outfits');
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const saveOutfit = async ({ photoDataUrl, ratingText, socialSummary, advisorMode, numericRating }) => {
        if (!user) throw new Error('Must be logged in to save outfits');
        setLoading(true);
        setError(null);
        try {
            const saved = await persistPrivateOutfit({
                storage: supabase.storage.from(OUTFIT_BUCKET),
                userId: user.id,
                photoDataUrl,
                record: {
                    rating_text: ratingText,
                    social_summary: socialSummary,
                    advisor_mode: advisorMode,
                    numeric_rating: numericRating
                },
                insertRecord: async record => {
                    const { data, error: insertError } = await supabase
                        .from('saved_outfits')
                        .insert(record)
                        .select()
                        .single();
                    if (insertError) throw insertError;
                    return data;
                }
            });
            setOutfits(previous => [saved, ...previous]);
            return saved;
        } catch (err) {
            console.error('Error saving outfit');
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteOutfit = async (outfitId, imagePath) => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            await deletePrivateOutfit({
                outfitId,
                imagePath,
                storage: supabase.storage.from(OUTFIT_BUCKET),
                deleteRecord: async id => {
                    const { error: deleteError } = await supabase
                        .from('saved_outfits')
                        .delete()
                        .eq('id', id)
                        .eq('user_id', user.id);
                    if (deleteError) throw deleteError;
                }
            });
            setOutfits(previous => previous.filter(outfit => outfit.id !== outfitId));
        } catch (err) {
            console.error('Error deleting outfit');
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOutfits(); }, [fetchOutfits]);
    return { outfits, loading, error, saveOutfit, deleteOutfit, fetchOutfits };
}
