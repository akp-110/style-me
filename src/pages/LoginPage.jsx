import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    // 'login' | 'signup' | 'reset'
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const { signIn, signUp, resetPassword } = useAuth();
    const navigate = useNavigate();

    const isLogin = mode === 'login';
    const isReset = mode === 'reset';

    const switchMode = (next) => {
        setMode(next);
        setError('');
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (isReset) {
                const { error } = await resetPassword(email);
                if (error) throw error;
                setMessage('Check your email for the password reset link!');
            } else if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) throw error;
                navigate('/');
            } else {
                const { error } = await signUp(email, password);
                if (error) throw error;
                setMessage('Check your email for the confirmation link!');
            }
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

                {/* Login Card */}
                <div className="card-hard p-6 sm:p-8 animate-scale-in">
                    <h2 className="text-xl font-black uppercase tracking-tight mb-6 text-center">
                        {isReset ? 'Reset password' : isLogin ? 'Welcome back' : 'Create account'}
                    </h2>

                    {isReset && (
                        <p className="text-sm text-ink/60 mb-4 text-center">
                            Enter your email and we'll send you a link to set a new password.
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                required
                                className="w-full pl-10 pr-3 py-3 border-2 border-ink bg-white text-sm font-medium placeholder:text-ink/40 focus:outline-none focus:ring-4 focus:ring-acid"
                            />
                        </div>

                        {/* Password Input (hidden in reset mode) */}
                        {!isReset && (
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-3 py-3 border-2 border-ink bg-white text-sm font-medium placeholder:text-ink/40 focus:outline-none focus:ring-4 focus:ring-acid"
                                />
                            </div>
                        )}

                        {/* Forgot password link (login mode only) */}
                        {isLogin && (
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() => switchMode('reset')}
                                    className="text-sm text-ink/60 hover:text-ink underline"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 border-2 border-ink bg-white text-sm font-bold">
                                {error}
                            </div>
                        )}

                        {/* Success Message */}
                        {message && (
                            <div className="p-3 border-2 border-ink bg-acid/40 text-sm font-bold">
                                {message}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-acid border-[3px] border-ink shadow-hard btn-press font-black uppercase tracking-wide flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-[3px] border-ink border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {isReset ? 'Send reset link' : isLogin ? 'Sign in' : 'Create account'}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Mode toggle */}
                    <div className="mt-6 text-center">
                        {isReset ? (
                            <button
                                onClick={() => switchMode('login')}
                                className="text-sm text-ink/60 hover:text-ink transition-colors"
                            >
                                Remembered it? <span className="font-bold underline">Sign in</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => switchMode(isLogin ? 'signup' : 'login')}
                                className="text-sm text-ink/60 hover:text-ink transition-colors"
                            >
                                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                                <span className="font-bold underline">
                                    {isLogin ? 'Sign up' : 'Sign in'}
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="chip-hard btn-press shadow-hard-sm"
                    >
                        ← Back to Style/Me
                    </button>
                </div>
            </div>
        </div>
    );
}
