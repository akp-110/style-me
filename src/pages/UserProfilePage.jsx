import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useOutfits } from '../hooks/useOutfits';
import { parseICSFile } from '../calendarIntegration';
import {
    ArrowLeft, User, Heart, Calendar, Images, Camera, Lock, Plus, X,
    Trash2, Upload, MapPin, Star, Loader2, Settings, Palette, Award, Lightbulb, Globe
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
                } catch {
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
            <div className="min-h-screen bg-paper flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-ink animate-spin" />
            </div>
        );
    }

    const inputClasses = "w-full border-2 border-ink px-3 py-2.5 text-sm font-medium bg-white placeholder:text-ink/40 focus:outline-none focus:ring-4 focus:ring-acid";

    return (
        <div className="min-h-screen bg-paper text-ink font-sans">
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="chip-hard btn-press shadow-hard-sm"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Style/Me</span>
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="chip-hard btn-press shadow-hard-sm bg-ink text-paper"
                    >
                        Logout
                    </button>
                </div>

                {/* Profile Header Card */}
                <div className="card-hard p-5 mb-6">
                    <div className="flex items-center gap-5">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-24 h-24 rounded-full bg-stone overflow-hidden border-[3px] border-ink">
                                {profileHook.profile.avatarUrl ? (
                                    <img
                                        src={profileHook.profile.avatarUrl}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-12 h-12 text-ink/40" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-1.5 bg-acid border-2 border-ink btn-press shadow-hard-sm"
                                title="Change avatar"
                            >
                                <Camera className="w-4 h-4" />
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
                        <div className="flex-1 min-w-0">
                            {editingName ? (
                                <div className="flex flex-wrap items-center gap-2">
                                    <input
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        className="border-2 border-ink bg-white px-3 py-2 font-serif italic text-xl focus:outline-none focus:ring-4 focus:ring-acid min-w-0 flex-1"
                                        autoFocus
                                    />
                                    <button onClick={handleNameSave} className="chip-hard btn-press shadow-hard-sm bg-acid">Save</button>
                                    <button onClick={() => setEditingName(false)} className="chip-hard btn-press shadow-hard-sm">Cancel</button>
                                </div>
                            ) : (
                                <h2
                                    className="font-serif italic text-2xl cursor-pointer hover:bg-acid/40 inline-block"
                                    onClick={() => { setEditingName(true); setTempName(profileHook.profile.displayName || ''); }}
                                    title="Click to edit"
                                >
                                    {profileHook.profile.displayName || 'Set your name'}
                                </h2>
                            )}
                            <p className="text-ink/60 text-sm truncate">{user.email}</p>
                            <p className="label-caps text-ink/40 mt-1">Member since {formatDate(user.created_at)}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const selected = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`chip-hard btn-press shadow-hard-sm whitespace-nowrap ${selected ? 'bg-ink text-acid' : ''}`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                                {tab.id === 'outfits' && outfits.length > 0 && (
                                    <span className={`px-1.5 border ${selected ? 'border-acid' : 'border-ink'} text-[10px]`}>
                                        {outfits.length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="card-hard p-5">
                    {/* Account Tab */}
                    {activeTab === 'account' && (
                        <div className="space-y-8">
                            {/* Location Section */}
                            <div>
                                <h3 className="label-caps mb-4 flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    Location & Market
                                </h3>
                                <div className="border-2 border-ink bg-stone/30 p-4 max-w-md">
                                    <label className="block text-ink/60 text-sm mb-2">Shopping Region (affects stores & currency)</label>
                                    <select
                                        value={profileHook.profile.countryCode || 'US'}
                                        onChange={handleCountryChange}
                                        disabled={profileHook.saving}
                                        className="w-full px-3 py-2.5 border-2 border-ink bg-white text-sm font-medium cursor-pointer focus:outline-none focus:ring-4 focus:ring-acid"
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
                                <h3 className="label-caps mb-4 flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    Change Password
                                </h3>
                                <div className="max-w-md space-y-4">
                                    <input
                                        type="password"
                                        placeholder="New password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className={inputClasses}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={inputClasses}
                                    />
                                    {passwordMessage && (
                                        <p className="text-sm font-bold">
                                            {passwordMessage}
                                        </p>
                                    )}
                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={profileHook.saving}
                                        className="px-6 py-3 bg-acid border-[3px] border-ink shadow-hard btn-press font-black uppercase tracking-wide text-sm w-full sm:w-auto"
                                    >
                                        {profileHook.saving ? 'Updating…' : 'Update Password'}
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
                                <h3 className="label-caps mb-2 flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Style Preferences
                                </h3>
                                <p className="text-ink/60 text-sm mb-4">Add words that describe your style (e.g., minimalist, boho, edgy)</p>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={newPref}
                                        onChange={(e) => setNewPref(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (profileHook.addStylePreference(newPref), setNewPref(''))}
                                        placeholder="e.g., minimalist"
                                        className={`flex-1 ${inputClasses}`}
                                    />
                                    <button
                                        onClick={() => { profileHook.addStylePreference(newPref); setNewPref(''); }}
                                        className="chip-hard btn-press shadow-hard-sm bg-acid self-stretch"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profileHook.profile.stylePreferences.map((pref, idx) => (
                                        <div key={idx} className="chip-hard bg-acid/60">
                                            <span>{pref}</span>
                                            <button onClick={() => profileHook.removeStylePreference(idx)} className="hover:bg-ink hover:text-acid">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Favourite Colors */}
                            <div>
                                <h3 className="label-caps mb-4 flex items-center gap-2">
                                    <Palette className="w-4 h-4" />
                                    Favourite Colours
                                </h3>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={newColor}
                                        onChange={(e) => setNewColor(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (profileHook.addFavouriteColor(newColor), setNewColor(''))}
                                        placeholder="e.g., navy blue"
                                        className={`flex-1 ${inputClasses}`}
                                    />
                                    <button
                                        onClick={() => { profileHook.addFavouriteColor(newColor); setNewColor(''); }}
                                        className="chip-hard btn-press shadow-hard-sm self-stretch"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profileHook.profile.favouriteColors.map((color, idx) => (
                                        <div key={idx} className="chip-hard">
                                            <span>{color}</span>
                                            <button onClick={() => profileHook.removeFavouriteColor(idx)} className="hover:bg-ink hover:text-acid">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Favourite Brands */}
                            <div>
                                <h3 className="label-caps mb-4 flex items-center gap-2">
                                    <Award className="w-4 h-4" />
                                    Favourite Brands
                                </h3>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={newBrand}
                                        onChange={(e) => setNewBrand(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (profileHook.addFavouriteBrand(newBrand), setNewBrand(''))}
                                        placeholder="e.g., Zara"
                                        className={`flex-1 ${inputClasses}`}
                                    />
                                    <button
                                        onClick={() => { profileHook.addFavouriteBrand(newBrand); setNewBrand(''); }}
                                        className="chip-hard btn-press shadow-hard-sm self-stretch"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profileHook.profile.favouriteBrands.map((brand, idx) => (
                                        <div key={idx} className="chip-hard">
                                            <span>{brand}</span>
                                            <button onClick={() => profileHook.removeFavouriteBrand(idx)} className="hover:bg-ink hover:text-acid">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tip */}
                            <div className="border-2 border-ink bg-acid/30 p-4">
                                <p className="text-sm flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5 flex-shrink-0" />
                                    Your style profile is used to personalise outfit suggestions and recommendations!
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Calendar Tab */}
                    {activeTab === 'calendar' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="label-caps flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    My Calendar
                                </h3>
                                <button
                                    onClick={() => calendarInputRef.current?.click()}
                                    className="chip-hard btn-press shadow-hard-sm bg-acid"
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
                            <div className="flex items-center justify-between border-2 border-ink bg-stone/30 p-4 gap-3">
                                <span className="text-sm font-medium">Use calendar context in outfit ratings</span>
                                <button
                                    onClick={() => profileHook.setUseCalendarContext(!profileHook.useCalendarContext)}
                                    className={`chip-hard btn-press shadow-hard-sm flex-shrink-0 ${profileHook.useCalendarContext ? 'bg-ink text-acid' : ''}`}
                                    aria-pressed={profileHook.useCalendarContext}
                                >
                                    {profileHook.useCalendarContext ? 'On' : 'Off'}
                                </button>
                            </div>

                            {/* Events List */}
                            {profileHook.calendarEvents.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="label-caps text-ink/50">{profileHook.calendarEvents.length} events loaded</span>
                                        <button
                                            onClick={() => { if (confirm('Clear all events?')) profileHook.clearCalendarEvents(); }}
                                            className="text-sm font-bold underline hover:bg-acid"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto space-y-2">
                                        {profileHook.calendarEvents.slice(0, 20).map((event, idx) => (
                                            <div key={idx} className="flex items-center justify-between border-2 border-ink bg-white p-3">
                                                <div>
                                                    <p className="font-bold text-sm">{event.summary}</p>
                                                    <p className="text-ink/60 text-sm">
                                                        {formatDate(event.start)}
                                                        {event.location && <span className="ml-2"><MapPin className="w-3 h-3 inline" /> {event.location}</span>}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => profileHook.removeCalendarEvent(idx)}
                                                    className="p-2 text-ink/40 hover:text-ink"
                                                    title="Remove event"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="w-12 h-12 text-ink/30 mx-auto mb-4" />
                                    <p className="text-ink/70 font-medium">No calendar events imported</p>
                                    <p className="text-ink/50 text-sm mt-2">Export from Google Calendar, Outlook, or Apple Calendar</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Outfits Tab */}
                    {activeTab === 'outfits' && (
                        <div>
                            <h3 className="label-caps mb-6 flex items-center gap-2">
                                <Images className="w-4 h-4" />
                                My Saved Outfits
                            </h3>

                            {outfitsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-ink animate-spin" />
                                </div>
                            ) : outfits.length === 0 ? (
                                <div className="text-center py-12">
                                    <Images className="w-12 h-12 text-ink/30 mx-auto mb-4" />
                                    <p className="text-ink/70 font-medium">No saved outfits yet</p>
                                    <p className="text-ink/50 text-sm mt-2">Rate some outfits and save your favourites!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {outfits.map((outfit) => (
                                        <div
                                            key={outfit.id}
                                            className="relative group overflow-hidden border-2 border-ink shadow-hard-sm bg-stone cursor-pointer"
                                            onClick={() => setSelectedImage(outfit.image_url)}
                                        >
                                            <img
                                                src={outfit.image_url}
                                                alt="Outfit"
                                                className="w-full aspect-[3/4] object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    // Fallback to a placeholder service to show it broke
                                                    e.target.src = "https://placehold.co/600x800/DDD8CF/111111?text=Image+Load+Error";
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1 text-acid">
                                                            <Star className="w-4 h-4" fill="currentColor" />
                                                            <span className="font-black">{outfit.numeric_rating || '?'}/10</span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (confirm('Delete this outfit?')) deleteOutfit(outfit.id, outfit.image_url);
                                                            }}
                                                            className="p-2 bg-white border-2 border-ink btn-press"
                                                            title="Delete outfit"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-ink" />
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
                    <div className="fixed bottom-4 right-4 chip-hard shadow-hard bg-white">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving…</span>
                    </div>
                )}
            </div>
            {/* Image Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-ink/90 flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 chip-hard btn-press shadow-hard-sm"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Full size outfit"
                            className="max-w-full max-h-[90vh] object-contain border-[3px] border-ink shadow-hard-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
