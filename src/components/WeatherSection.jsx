import React, { useRef, useEffect } from 'react';
import { Cloud, MapPin, CloudRain, Droplets, Wind } from 'lucide-react';

export const WeatherSection = ({
    weather,
    loadingWeather,
    location,
    setLocation,
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

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setShowSuggestions]);

    const handleLocationKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLocationUpdate();
        }
    };

    return (
        <div className="glass-strong rounded-[2.5rem] shadow-2xl p-8 sm:p-10 mb-10 animate-slide-up border-2 border-white/40 backdrop-blur-xl text-left">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 xs:gap-6 mb-8">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-800 flex items-center gap-4">
                    <div className="p-2 bg-gradient-to-br from-slate-900 to-orange-950 rounded-xl">
                        <Cloud className="w-7 h-7 text-amber-50" />
                    </div>
                    <span>Weather</span>
                </h2>

                {/* Toggle Switch and Update Button */}
                <div className="flex items-center gap-4 xs:gap-6 w-full xs:w-auto">
                    <label className="flex items-center gap-2 xs:gap-4 cursor-pointer select-none whitespace-nowrap">
                        <span className="text-xs xs:text-base text-slate-700 font-semibold">
                            Include in rating
                        </span>

                        <div
                            onClick={() => setUseWeather(!useWeather)}
                            className={`
                relative w-12 xs:w-14 h-7 xs:h-8 flex items-center rounded-full p-1 transition-all flex-shrink-0
                ${useWeather ? "bg-orange-600" : "bg-slate-400"}
              `}
                        >
                            <div
                                className={`
                  w-5 xs:w-6 h-5 xs:h-6 bg-white rounded-full shadow-md transform transition-all
                  ${useWeather ? "translate-x-5 xs:translate-x-6" : "translate-x-0"}
                `}
                            />
                        </div>
                    </label>

                    <button
                        onClick={handleLocationUpdate}
                        disabled={loadingWeather}
                        className="px-4 xs:px-6 py-2 xs:py-2.5 bg-gradient-to-r from-slate-900 to-orange-950 text-amber-50 rounded-xl xs:rounded-2xl font-semibold text-sm xs:text-base hover:shadow-xl disabled:opacity-50 transition-all hover:scale-105 disabled:hover:scale-100 flex-shrink-0"
                    >
                        {loadingWeather ? 'Loading...' : 'Update'}
                    </button>
                </div>
            </div>

            {useWeather && (
                <>
                    {/* Location Input with Autocomplete */}
                    <div className="mb-6">
                        <div className="flex gap-3">
                            <div className="flex-1 relative" ref={suggestionsRef}>
                                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 xs:w-6 h-5 xs:h-6 text-slate-400 z-10" />
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    onKeyPress={handleLocationKeyPress}
                                    placeholder="Enter city or zip code..."
                                    className="w-full pl-12 xs:pl-14 pr-4 py-5 xs:py-4 text-base xs:text-lg border-2 border-slate-300 rounded-2xl focus:border-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-600/20 transition-all font-medium text-slate-800 placeholder-slate-500"
                                    autoComplete="off"
                                />

                                {/* Autocomplete Dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto">
                                        {suggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSuggestionSelect(suggestion)}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors duration-200 text-slate-800 hover:text-orange-600 font-medium"
                                            >
                                                <div className="font-semibold">{suggestion.name}</div>
                                                <div className="text-sm text-slate-500">{suggestion.country}{suggestion.state ? `, ${suggestion.state}` : ''}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Loading indicator */}
                                {loadingSuggestions && showSuggestions && location.trim() && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl z-50 px-4 py-3">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-600 border-t-transparent"></div>
                                            <span className="text-sm">Searching locations...</span>
                                        </div>
                                    </div>
                                )}

                                {/* No results message */}
                                {showSuggestions && !loadingSuggestions && location.trim() && suggestions.length === 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl z-50 px-4 py-3">
                                        <span className="text-sm text-slate-500">No locations found for "{location}"</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Weather Display */}
                    {weather && !loadingWeather && (
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-4 sm:gap-6 bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl border-2 border-slate-200">
                            <div className="text-center">
                                <div className="text-4xl font-black text-slate-800 mb-1">
                                    {weather.temperature}°C
                                </div>
                                <div className="text-sm text-slate-600 font-semibold">Temperature</div>
                                <div className="text-xs text-slate-500 mt-1">Feels like {weather.feelsLike}°C</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-2xl text-slate-800 mb-1">
                                    <CloudRain className="w-6 h-6" />
                                    <span className="font-black">{weather.condition}</span>
                                </div>
                                <div className="text-sm text-slate-600 font-semibold capitalize">{weather.description}</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-2xl text-slate-800 mb-1">
                                    <Droplets className="w-6 h-6" />
                                    <span className="font-black">{weather.humidity}%</span>
                                </div>
                                <div className="text-sm text-slate-600 font-semibold">Humidity</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-2xl text-slate-800 mb-1">
                                    <Wind className="w-6 h-6" />
                                    <span className="font-black">{weather.windSpeed} mph</span>
                                </div>
                                <div className="text-sm text-slate-600 font-semibold">Wind Speed</div>
                            </div>
                        </div>
                    )}

                    {loadingWeather && (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent mx-auto mb-4"></div>
                            <p className="text-base text-slate-600 font-semibold">Fetching weather data...</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
