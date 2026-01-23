import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useOutfits } from '../hooks/useOutfits';
import { parseICSFile } from '../calendarIntegration';
import {
    ArrowLeft, User, Heart, Calendar, Images, Camera, Lock, Plus, X,
    Trash2, Upload, MapPin, Star, Loader2, ImageOff, Settings, Palette, Award, Lightbulb, Globe
} from 'lucide-react';

export default function UserProfilePage() {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const profileHook = useProfile();
    const { outfits, loading: outfitsLoading, deleteOutfit } = useOutfits();

    const [activeTab, setActiveTab] = useState('account');
    const [newPref, setNewPref] = useState('');
    const [newColor, setNewColor] = useState('');
    const [newBrand, setNewBrand] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [editingName, setEditingName] = useState(false);
    const [tempName, setTempName] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    const avatarInputRef = useRef(null);
    const calendarInputRef = useRef(null);

    // Redirect if not logged in - must be in useEffect
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Show nothing while redirecting
    if (!user) {
        return null;
    }

    const tabs = [
        { id: 'account', label: 'Account', icon: User },
        { id: 'style', label: 'Style Profile', icon: Heart },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'outfits', label: 'My Outfits', icon: Images }
    ];

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                await profileHook.uploadAvatar(file);
            } catch (err) {
                alert('Failed to upload avatar: ' + err.message);
            }
        }
    };

    const handleNameSave = async () => {
        if (tempName.trim()) {
            await profileHook.saveProfile({ displayName: tempName.trim() });
        }
        setEditingName(false);
    };

    const handlePasswordChange = async () => {
        if (newPassword.length < 6) {
            setPasswordMessage('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage('Passwords do not match');
            return;
        }
        try {
            await profileHook.changePassword(newPassword);
            setPasswordMessage('Password changed successfully!');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordMessage('Error: ' + err.message);
        }
    };

    const handleCountryChange = async (e) => {
        const newCountry = e.target.value;
        await profileHook.saveProfile({ countryCode: newCountry });
    };

    const handleCalendarUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const events = parseICSFile(reader.result);
                    await profileHook.setCalendarEvents(events);
                    alert(`Successfully loaded ${events.length} events!`);
                } catch (error) {
                    alert('Error parsing calendar file.');
                }
            };
            reader.readAsText(file);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    if (profileHook.loading) {
        return (
            <div className="min-h-screen animated-gradient flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen animated-gradient relative overflow-hidden font-sans">
            {/* Background */}
            <div className="particle particle-1 floating"></div>
            <div className="particle particle-2 floating-delayed"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10"></div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Style/Me</span>
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700/80 text-white rounded-full transition-all"
                    >
                        Logout
                    </button>
                </div>

                {/* Profile Header Card */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 mb-6">
                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-slate-700 overflow-hidden border-4 border-orange-500/30">
                                {profileHook.profile.avatarUrl ? (
                                    <img
                                        src={profileHook.profile.avatarUrl}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-12 h-12 text-slate-400" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2 bg-orange-600 rounded-full hover:bg-orange-500 transition-colors"
                            >
                                <Camera className="w-4 h-4 text-white" />
                            </button>
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                            />
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            {editingName ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-xl font-bold"
                                        autoFocus
                                    />
                                    <button onClick={handleNameSave} className="text-green-400 hover:text-green-300">Save</button>
                                    <button onClick={() => setEditingName(false)} className="text-slate-400 hover:text-white">Cancel</button>
                                </div>
                            ) : (
                                <h2
                                    className="text-2xl font-bold text-white cursor-pointer hover:text-orange-400 transition-colors"
                                    onClick={() => { setEditingName(true); setTempName(profileHook.profile.displayName || ''); }}
                                    title="Click to edit"
                                >
                                    {profileHook.profile.displayName || 'Set your name'}
                                </h2>
                            )}
                            <p className="text-slate-400">{user.email}</p>
                            <p className="text-slate-500 text-sm">Member since {formatDate(user.created_at)}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/80'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{tab.label}</span>
                                {tab.id === 'outfits' && outfits.length > 0 && (
                                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                                        {outfits.length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6">
                    {/* Account Tab */}
                    {activeTab === 'account' && (
                        <div className="space-y-8">
                            {/* Location Section */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Globe className="w-5 h-5" />
                                    Location & Market
                                </h3>
                                <div className="bg-slate-800/50 rounded-xl p-4 max-w-md">
                                    <label className="block text-slate-400 text-sm mb-2">Shopping Region (affects stores & currency)</label>
                                    <select
                                        value={profileHook.profile.countryCode || 'US'}
                                        onChange={handleCountryChange}
                                        disabled={profileHook.saving}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white appearance-none cursor-pointer hover:bg-slate-700/80 transition-colors focus:ring-2 focus:ring-orange-500 outline-none"
                                    >
                                        <option value="US">🇺🇸 United States (USD)</option>
                                        <option value="GB">🇬🇧 United Kingdom (GBP)</option>
                                        <option value="CA">🇨🇦 Canada (CAD)</option>
                                        <option value="AU">🇦🇺 Australia (AUD)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Password Section */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Lock className="w-5 h-5" />
                                    Change Password
                                </h3>
                                <div className="max-w-md space-y-4">
                                    <input
                                        type="password"
                                        placeholder="New password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400"
                                    />
                                    {passwordMessage && (
                                        <p className={`text-sm ${passwordMessage.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                                            {passwordMessage}
                                        </p>
                                    )}
                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={profileHook.saving}
                                        className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50 w-full sm:w-auto"
                                    >
                                        {profileHook.saving ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Style Profile Tab */}
                    {activeTab === 'style' && (
                        <div className="space-y-8">
                            {/* Style Preferences */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    Style Preferences
                                </h3>
                                <p className="text-slate-400 text-sm mb-4">Add words that describe your style (e.g., minimalist, boho, edgy)</p>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={newPref}
                                        onChange={(e) => setNewPref(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (profileHook.addStylePreference(newPref), setNewPref(''))}
                                        placeholder="e.g., minimalist"
                                        className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400"
                                    />
                                    <button
                                        onClick={() => { profileHook.addStylePreference(newPref); setNewPref(''); }}
                                        className="px-4 py-2 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-500"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profileHook.profile.stylePreferences.map((pref, idx) => (
                                        <div key={idx} className="bg-orange-600/20 text-orange-300 px-4 py-2 rounded-full flex items-center gap-2">
                                            <span>{pref}</span>
                                            <button onClick={() => profileHook.removeStylePreference(idx)} className="hover:text-white">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Favourite Colors */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Palette className="w-5 h-5" />
                                    Favourite Colours
                                </h3>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={newColor}
                                        onChange={(e) => setNewColor(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (profileHook.addFavouriteColor(newColor), setNewColor(''))}
                                        placeholder="e.g., navy blue"
                                        className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400"
                                    />
                                    <button
                                        onClick={() => { profileHook.addFavouriteColor(newColor); setNewColor(''); }}
                                        className="px-4 py-2 bg-slate-600 text-white rounded-xl font-semibold hover:bg-slate-500"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profileHook.profile.favouriteColors.map((color, idx) => (
                                        <div key={idx} className="bg-slate-700 text-slate-200 px-4 py-2 rounded-full flex items-center gap-2">
                                            <span>{color}</span>
                                            <button onClick={() => profileHook.removeFavouriteColor(idx)} className="hover:text-white">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Favourite Brands */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5" />
                                    Favourite Brands
                                </h3>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={newBrand}
                                        onChange={(e) => setNewBrand(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (profileHook.addFavouriteBrand(newBrand), setNewBrand(''))}
                                        placeholder="e.g., Zara"
                                        className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400"
                                    />
                                    <button
                                        onClick={() => { profileHook.addFavouriteBrand(newBrand); setNewBrand(''); }}
                                        className="px-4 py-2 bg-slate-600 text-white rounded-xl font-semibold hover:bg-slate-500"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profileHook.profile.favouriteBrands.map((brand, idx) => (
                                        <div key={idx} className="bg-slate-700 text-slate-200 px-4 py-2 rounded-full flex items-center gap-2">
                                            <span>{brand}</span>
                                            <button onClick={() => profileHook.removeFavouriteBrand(idx)} className="hover:text-white">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tip */}
                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4">
                                <p className="text-orange-300 text-sm flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5" />
                                    Your style profile is used to personalise outfit suggestions and recommendations!
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Calendar Tab */}
                    {activeTab === 'calendar' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    My Calendar
                                </h3>
                                <button
                                    onClick={() => calendarInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-semibold"
                                >
                                    <Upload className="w-4 h-4" />
                                    Import .ics
                                </button>
                                <input
                                    ref={calendarInputRef}
                                    type="file"
                                    accept=".ics"
                                    onChange={handleCalendarUpload}
                                    className="hidden"
                                />
                            </div>

                            {/* Calendar Toggle */}
                            <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4">
                                <span className="text-white">Use calendar context in outfit ratings</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={profileHook.useCalendarContext}
                                        onChange={(e) => profileHook.setUseCalendarContext(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-600 peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                </label>
                            </div>

                            {/* Events List */}
                            {profileHook.calendarEvents.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">{profileHook.calendarEvents.length} events loaded</span>
                                        <button
                                            onClick={() => { if (confirm('Clear all events?')) profileHook.clearCalendarEvents(); }}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto space-y-2">
                                        {profileHook.calendarEvents.slice(0, 20).map((event, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3">
                                                <div>
                                                    <p className="text-white font-medium">{event.summary}</p>
                                                    <p className="text-slate-400 text-sm">
                                                        {formatDate(event.start)}
                                                        {event.location && <span className="ml-2"><MapPin className="w-3 h-3 inline" /> {event.location}</span>}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => profileHook.removeCalendarEvent(idx)}
                                                    className="p-2 text-slate-400 hover:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                    <p className="text-slate-400">No calendar events imported</p>
                                    <p className="text-slate-500 text-sm mt-2">Export from Google Calendar, Outlook, or Apple Calendar</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Outfits Tab */}
                    {activeTab === 'outfits' && (
                        <div>
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Images className="w-5 h-5" />
                                My Saved Outfits
                            </h3>

                            {outfitsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                                </div>
                            ) : outfits.length === 0 ? (
                                <div className="text-center py-12">
                                    <Images className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                    <p className="text-slate-400">No saved outfits yet</p>
                                    <p className="text-slate-500 text-sm mt-2">Rate some outfits and save your favourites!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {outfits.map((outfit) => (
                                        <div
                                            key={outfit.id}
                                            className="relative group rounded-2xl overflow-hidden bg-slate-800 cursor-pointer"
                                            onClick={() => setSelectedImage(outfit.image_url)}
                                        >
                                            <img
                                                src={outfit.image_url}
                                                alt="Outfit"
                                                className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-110"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    // Fallback to a placeholder service to show it broke
                                                    e.target.src = "https://placehold.co/600x800/1e293b/ef4444?text=Image+Load+Error";
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1 text-amber-400">
                                                            <Star className="w-4 h-4" fill="currentColor" />
                                                            <span className="font-bold">{outfit.numeric_rating || '?'}/10</span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (confirm('Delete this outfit?')) deleteOutfit(outfit.id, outfit.image_url);
                                                            }}
                                                            className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition-transform hover:scale-110"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                    <p className="text-white text-xs mt-2 line-clamp-2">{outfit.social_summary}</p>
                                                    <p className="text-white/50 text-[10px] mt-1 text-center font-mono">Click to enlarge</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Saving Indicator */}
                {profileHook.saving && (
                    <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                    </div>
                )}
            </div>
            {/* Image Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Full size outfit"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
