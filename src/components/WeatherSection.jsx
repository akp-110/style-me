import React, { useRef, useEffect, useState } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';

export const WeatherSection = ({
    weather,
    loadingWeather,
    location,
    setLocation,
    confirmedLocation,
    useWeather,
    setUseWeather,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    loadingSuggestions,
    handleLocationUpdate,
    handleSuggestionSelect
}) => {
    const suggestionsRef = useRef(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        function handleClickOutside(event) {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setShowSuggestions]);

    const handleLocationKeyDown = (e) => {
        if (e.key === 'Enter') handleLocationUpdate();
    };

    return (
        <section className="mb-8 text-left animate-slide-up">
            <div className="label-caps mb-3">Weather</div>

            {/* Chip row */}
            <div className="flex flex-wrap items-center gap-2">
                <button
                    onClick={() => setUseWeather(!useWeather)}
                    className={`chip-hard btn-press shadow-hard-sm ${useWeather ? 'bg-ink text-acid' : ''}`}
                    aria-pressed={useWeather}
                >
                    Weather {useWeather ? 'on' : 'off'}
                </button>

                {useWeather && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="chip-hard btn-press shadow-hard-sm"
                        aria-expanded={expanded}
                    >
                        <MapPin className="w-3 h-3" />
                        {weather && !loadingWeather
                            ? `${weather.temperature}°C · ${confirmedLocation || 'Set location'}`
                            : loadingWeather ? 'Loading…' : (confirmedLocation || 'Set location')}
                        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                )}
            </div>

            {/* Expanded editor panel */}
            {useWeather && expanded && (
                <div className="card-hard mt-3 p-4 animate-scale-in">
                    <div className="flex gap-2">
                        <div className="flex-1 relative" ref={suggestionsRef}>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                onKeyDown={handleLocationKeyDown}
                                placeholder="Enter city or zip code…"
                                autoComplete="off"
                                className="w-full border-2 border-ink px-3 py-2.5 text-sm font-medium bg-white focus:outline-none focus:ring-4 focus:ring-acid"
                            />

                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-ink shadow-hard z-50 max-h-56 overflow-y-auto">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionSelect(suggestion)}
                                            className="w-full text-left px-3 py-2.5 border-b-2 border-ink/10 last:border-b-0 hover:bg-acid/30 text-sm"
                                        >
                                            <span className="font-bold">{suggestion.name}</span>
                                            <span className="text-ink/50"> — {suggestion.country}{suggestion.state ? `, ${suggestion.state}` : ''}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {loadingSuggestions && showSuggestions && location.trim() && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-ink shadow-hard z-50 px-3 py-2.5 text-sm text-ink/60">
                                    Searching locations…
                                </div>
                            )}

                            {showSuggestions && !loadingSuggestions && location.trim() && suggestions.length === 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-ink shadow-hard z-50 px-3 py-2.5 text-sm text-ink/60">
                                    No locations found for "{location}"
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleLocationUpdate}
                            disabled={loadingWeather}
                            className="chip-hard btn-press shadow-hard-sm bg-acid self-stretch"
                        >
                            {loadingWeather ? '…' : 'Update'}
                        </button>
                    </div>

                    {weather && !loadingWeather && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 mt-3 border-2 border-ink divide-x-2 divide-y-2 sm:divide-y-0 divide-ink bg-white text-center">
                            <div className="p-2.5">
                                <div className="font-black text-lg">{weather.temperature}°C</div>
                                <div className="label-caps text-ink/50">Feels {weather.feelsLike}°</div>
                            </div>
                            <div className="p-2.5">
                                <div className="font-black text-lg capitalize">{weather.condition}</div>
                                <div className="label-caps text-ink/50 capitalize">{weather.description}</div>
                            </div>
                            <div className="p-2.5">
                                <div className="font-black text-lg">{weather.humidity}%</div>
                                <div className="label-caps text-ink/50">Humidity</div>
                            </div>
                            <div className="p-2.5">
                                <div className="font-black text-lg">{weather.windSpeed}</div>
                                <div className="label-caps text-ink/50">Wind mph</div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};
