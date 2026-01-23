import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, LogIn } from 'lucide-react';

export default function Header() {
    const { user, signOut, loading } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    if (loading) return null;

    return (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
            {user ? (
                <div className="flex items-center gap-3">
                    {/* My Profile Button */}
                    <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600/80 hover:bg-orange-500 backdrop-blur-sm border border-orange-500/50 rounded-full text-white transition-all hover:scale-105"
                        title="My Profile"
                    >
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium hidden sm:inline">My Profile</span>
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 hover:bg-slate-700/80 backdrop-blur-sm border border-slate-600/50 rounded-full text-white/90 hover:text-white transition-all group"
                        title="Sign out"
                    >
                        <LogOut className="w-4 h-4 group-hover:text-orange-400 transition-colors" />
                        <span className="text-sm font-medium hidden sm:inline">Logout</span>
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-semibold rounded-full transition-all hover:shadow-lg hover:shadow-orange-500/25 hover:scale-105"
                >
                    <LogIn className="w-4 h-4" />
                    <span className="text-sm">Login</span>
                </button>
            )}
        </div>
    );
}
