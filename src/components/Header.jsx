import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, LogIn } from 'lucide-react';

export default function Header() {
    const { user, signOut, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) return null;

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    if (!user) {
        return (
            <button onClick={() => navigate('/login')} className="chip-hard btn-press shadow-hard-sm bg-acid">
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <button onClick={() => navigate('/profile')} className="chip-hard btn-press shadow-hard-sm" title="My Profile">
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Profile</span>
            </button>
            <button onClick={handleSignOut} className="chip-hard btn-press shadow-hard-sm bg-ink text-paper" title="Sign out">
                <LogOut className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
