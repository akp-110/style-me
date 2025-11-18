import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing weather data and location
 */
export const useWeather = () => {
    const [location, setLocation] = useState('');
    const [weather, setWeather] = useState(null);
    const [loadingWeather, setLoadingWeather] = useState(false);
    const [useWeather, setUseWeather] = useState(true);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    const getMockWeather = () => ({
        temperature: 22,
        feelsLike: 21,
        condition: 'Clear',
        description: 'clear sky',
        humidity: 60,
        windSpeed: 5,
        icon: '01d'
    });

    // Fetch weather by coordinates (memoized so effect deps are stable)
    const fetchWeatherByCoords = useCallback(async (lat, lon) => {
        setLoadingWeather(true);
        try {
            // Call server-side proxy so API key stays on server
            const response = await fetch(`/api/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`);

            if (response.ok) {
                const data = await response.json();
                setWeather({
                    temperature: Math.round(data.main.temp),
                    feelsLike: Math.round(data.main.feels_like),
                    condition: data.weather[0].main,
                    description: data.weather[0].description,
                    humidity: data.main.humidity,
                    windSpeed: Math.round(data.wind.speed),
                    icon: data.weather[0].icon
                });
                setLocation(`${data.name}, ${data.sys.country}`);
            } else {
                // If proxy returns error (missing key or upstream error), fall back to mock
                console.warn('Weather proxy responded with non-OK status, using mock data');
                setWeather(getMockWeather());
                setLocation('New York, NY');
            }
        } catch (error) {
            console.error('Weather fetch error:', error);
            setWeather(getMockWeather());
            setLocation('New York, NY');
        } finally {
            setLoadingWeather(false);
        }
    }, []);

    // Get user's location on component mount
    useEffect(() => {
        if (navigator.geolocation && useWeather) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await fetchWeatherByCoords(latitude, longitude);
                },
                () => {
                    console.log('Location access denied, using default location');
                    setLocation('New York, NY');
                    setWeather(getMockWeather());
                }
            );
        }
    }, [useWeather, fetchWeatherByCoords]);

    const fetchWeatherByLocation = async (locationQuery) => {
        setLoadingWeather(true);
        try {
            const response = await fetch(`/api/weather?q=${encodeURIComponent(locationQuery)}`);

            if (response.ok) {
                const data = await response.json();
                setWeather({
                    temperature: Math.round(data.main.temp),
                    feelsLike: Math.round(data.main.feels_like),
                    condition: data.weather[0].main,
                    description: data.weather[0].description,
                    humidity: data.main.humidity,
                    windSpeed: Math.round(data.wind.speed),
                    icon: data.weather[0].icon
                });
                setLocation(`${data.name}, ${data.sys.country}`);
            } else {
                const err = await response.json().catch(() => ({}));
                alert(err.error || 'Location not found. Please try a different city or zip code.');
            }
        } catch (error) {
            console.error('Weather fetch error:', error);
            alert('Failed to fetch weather. Please try again.');
        } finally {
            setLoadingWeather(false);
        }
    };

    // Fetch location suggestions with debounce
    const fetchSuggestions = useCallback(async (query) => {
        if (!query.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setLoadingSuggestions(true);
        try {
            const response = await fetch(`/api/weather-suggestions?q=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        } finally {
            setLoadingSuggestions(false);
        }
    }, []);

    // Debounced location search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (location.trim()) {
                fetchSuggestions(location);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [location, fetchSuggestions]);

    const handleLocationUpdate = () => {
        if (location.trim()) {
            fetchWeatherByLocation(location.trim());
            setShowSuggestions(false);
        }
    };

    const handleSuggestionSelect = (suggestion) => {
        setLocation(suggestion.displayName);
        setShowSuggestions(false);
        fetchWeatherByLocation(suggestion.displayName);
    };

    return {
        location,
        setLocation,
        weather,
        loadingWeather,
        useWeather,
        setUseWeather,
        suggestions,
        showSuggestions,
        setShowSuggestions,
        loadingSuggestions,
        handleLocationUpdate,
        handleSuggestionSelect
    };
};
