import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowRight } from 'lucide-react';

/**
 * Landing page for the password-recovery email link. Supabase redirects here
 * with a recovery token in the URL; supabase-js exchanges it for a session
 * automatically (detectSessionInUrl), so a valid link arrives "logged in"
 * and we just call updateUser with the new password.
 */
export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const { user, loading: authLoading, updatePassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await updatePassword(password);
            if (error) throw error;
            setDone(true);
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-paper text-ink font-sans flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="font-black uppercase tracking-tight leading-[0.9] text-5xl sm:text-6xl">
                        Style/Me<span className="text-acid-dim">.</span>
                    </h1>
                    <p className="label-caps text-ink/50 mt-3">AI-powered fashion feedback</p>
                </div>

                <div className="card-hard p-6 sm:p-8 animate-scale-in">
                    <h2 className="text-xl font-black uppercase tracking-tight mb-6 text-center">
                        Set a new password
                    </h2>

                    {authLoading ? (
                        <div className="flex justify-center py-6">
                            <div className="w-6 h-6 border-[3px] border-ink border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : !user ? (
                        // No recovery session — link expired, already used, or opened directly.
                        <div className="text-center space-y-4">
                            <p className="text-sm text-ink/70">
                                This reset link is invalid or has expired. Request a fresh one
                                from the sign-in page.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="chip-hard btn-press shadow-hard-sm"
                            >
                                Back to sign in
                            </button>
                        </div>
                    ) : done ? (
                        <div className="p-3 border-2 border-ink bg-acid/40 text-sm font-bold text-center">
                            Password updated — taking you home…
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="New password"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-3 py-3 border-2 border-ink bg-white text-sm font-medium placeholder:text-ink/40 focus:outline-none focus:ring-4 focus:ring-acid"
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
                                <input
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    placeholder="Confirm new password"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-3 py-3 border-2 border-ink bg-white text-sm font-medium placeholder:text-ink/40 focus:outline-none focus:ring-4 focus:ring-acid"
                                />
                            </div>

                            {error && (
                                <div className="p-3 border-2 border-ink bg-white text-sm font-bold">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-acid border-[3px] border-ink shadow-hard btn-press font-black uppercase tracking-wide flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-[3px] border-ink border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Update password
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
