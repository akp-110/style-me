import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, Sparkles, TrendingUp, Flame, Smile, X, RefreshCw, Star, Zap, Wand2, MapPin, Cloud, Droplets, Wind, CloudRain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('balanced');
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [useWeather, setUseWeather] = useState(true);
  const fileInputRef = useRef(null);

  // Diagnostic: check whether Vite injected the OpenWeather key (presence only)
  useEffect(() => {
    try {
      const hasKey = !!import.meta?.env?.VITE_OPENWEATHER_API_KEY;
      console.log('VITE_OPENWEATHER_API_KEY present:', hasKey);
    } catch {
      console.log('Vite env not available in this runtime');
    }
  }, []);

  const modes = {
    professional: {
      icon: TrendingUp,
      label: 'Professional',
      emoji: '👔',
      color: 'indigo',
      gradient: 'from-indigo-600 via-indigo-500 to-slate-500',
      glow: 'glow-muted',
      bgGradient: 'from-indigo-900/30 to-slate-900/20',
      borderColor: 'border-indigo-600',
      dotColor: 'bg-indigo-600'
    },
    balanced: {
      icon: Sparkles,
      label: 'Balanced',
      emoji: '✨',
      color: 'slate',
      gradient: 'from-slate-700 via-slate-600 to-emerald-500',
      glow: 'glow-sage',
      bgGradient: 'from-slate-900/25 to-emerald-900/10',
      borderColor: 'border-slate-500',
      dotColor: 'bg-emerald-500'
    },
    hype: {
      icon: Flame,
      label: 'Hype Mode',
      emoji: '🔥',
      color: 'amber',
      gradient: 'from-amber-500 via-amber-400 to-rose-400',
      glow: 'glow-gold',
      bgGradient: 'from-amber-900/20 to-rose-900/10',
      borderColor: 'border-amber-500',
      dotColor: 'bg-amber-500'
    },
    roast: {
      icon: Smile,
      label: 'Roast Mode',
      emoji: '😈',
      color: 'rose',
      gradient: 'from-rose-500 via-rose-400 to-amber-400',
      glow: 'glow-muted',
      bgGradient: 'from-rose-900/18 to-amber-900/8',
      borderColor: 'border-rose-500',
      dotColor: 'bg-rose-500'
    }
  };

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

  const getMockWeather = () => ({
    temperature: 72,
    feelsLike: 70,
    condition: 'Clear',
    description: 'clear sky',
    humidity: 60,
    windSpeed: 5,
    icon: '01d'
  });

  const handleLocationUpdate = () => {
    if (location.trim()) {
      fetchWeatherByLocation(location.trim());
    }
  };

  const handleLocationKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLocationUpdate();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setRating(null);
    }
  };

  const clearPhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setRating(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getModePrompt = () => {
    const prompts = {
      professional: "You are a professional fashion consultant. Be constructive, polite, and focus on workplace appropriateness.",
      balanced: "You are a friendly fashion advisor. Be honest but encouraging, offering helpful suggestions.",
      hype: "You are the user's biggest fan! Be enthusiastic and supportive. Find the positives in everything!",
      roast: "You are a witty fashion critic. Be funny and honest with playful roasting, but never cruel. Keep it lighthearted!"
    };
    return prompts[mode];
  };

  const buildPromptWithWeather = () => {
    const basePrompt = getModePrompt();

    let weatherContext = '';
    if (useWeather && weather) {
      weatherContext = `

**Current Weather Context:**
Location: ${location}
Temperature: ${weather.temperature}°C (feels like ${weather.feelsLike}°C)
Conditions: ${weather.description}
Humidity: ${weather.humidity}%
Wind: ${weather.windSpeed} mph

Please consider these weather conditions when evaluating if this outfit is appropriate.`;
    }

    return `${basePrompt}${weatherContext}

Rate this outfit and provide feedback. Structure your response as:

**Overall Rating: X/10** ⭐

**Breakdown:**
- Style: X/10
${useWeather && weather ? '- Weather Appropriateness: X/10' : '- Versatility: X/10'}
- Occasion Fit: X/10

**What Works:**
[2-3 specific positive points]

**Suggestions:**
[2-3 specific improvements]

${useWeather && weather ? '**Weather Check:**\n[Comment on how well this outfit matches current conditions]' : ''}

${mode === 'roast' ? '\n**The Roast:**\n[Your wittiest observation]' : ''}

Be specific and helpful!`;
  };

  const getRating = async () => {
    if (!photo) {
      alert('Please upload a photo first!');
      return;
    }

    setLoading(true);
    setRating(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1];

        const fullPrompt = buildPromptWithWeather();

        // Call your backend API
        const response = await fetch('/api/rate-outfit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image,
            mode: mode,
            prompt: fullPrompt
          })
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error?.message || data.error || 'API request failed');
        }

        if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
          throw new Error('Invalid API response: missing or empty content');
        }

        const textBlock = data.content[0];
        if (textBlock.type !== 'text' || !textBlock.text) {
          throw new Error('Invalid API response: expected text content');
        }

        const ratingText = textBlock.text;
        setRating(ratingText);
        setLoading(false);
      };

      reader.onerror = () => {
        setLoading(false);
        throw new Error('Failed to read image file');
      };

      reader.readAsDataURL(photo);
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to get rating: ${error.message}`);
      setLoading(false);
    }
  };

  const currentMode = modes[mode];

  return (
    <div className="min-h-screen animated-gradient relative overflow-hidden font-sans text-center">
      {/* Floating background particles */}
      <div className="particle particle-1 floating"></div>
      <div className="particle particle-2 floating-delayed"></div>
      <div className="particle particle-3 floating-slow"></div>
      <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl floating"></div>
      <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-pink-400/20 rounded-full blur-3xl floating-delayed"></div>

      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10"></div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-start min-h-screen">
        <div className="max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-14 animate-slide-down">
            <div className="inline-block mb-8 relative group">
              <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full group-hover:blur-2xl transition-all duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/18 to-pink-400/18 blur-xl rounded-full animate-pulse-slow"></div>
              <span className="relative text-6xl sm:text-8xl lg:text-[12rem] floating inline-block transform group-hover:scale-105 transition-transform duration-500">
                👗
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black mb-6 relative">
              <span className="gradient-text bg-clip-text text-transparent inline-block">
                Claude Rates My Outfit
              </span>
            </h1>
            <p className="text-white/95 text-base sm:text-xl lg:text-3xl max-w-3xl mx-auto font-semibold drop-shadow-2xl mb-6 leading-relaxed">
              Get honest, AI-powered fashion feedback {useWeather && 'with real-time weather context'}
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <Star className="w-6 h-6 text-yellow-300 animate-pulse" fill="currentColor" />
              <span className="text-white/90 text-base font-medium">Powered by Claude Sonnet 4.5</span>
              <Star className="w-6 h-6 text-yellow-300 animate-pulse" fill="currentColor" />
            </div>
          </div>

          {/* Weather Section */}
<div className="glass-strong rounded-[2.5rem] shadow-2xl p-8 sm:p-10 mb-10 animate-slide-up border-2 border-white/60 backdrop-blur-xl text-left">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-3xl sm:text-4xl font-black text-gray-800 flex items-center gap-4">
      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
        <Cloud className="w-7 h-7 text-gray" />
      </div>
      <span>Weather</span>
    </h2>

    {/* Toggle Switch */}
    <label className="flex items-center gap-4 cursor-pointer select-none">
      <span className="text-base text-gray-700 font-semibold">
        Include in rating
      </span>

      <div
        onClick={() => setUseWeather(!useWeather)}
        className={`
          relative w-14 h-8 flex items-center rounded-full p-1 transition-all
          ${useWeather ? "bg-blue-500" : "bg-gray-300"}
        `}
      >
        <div
          className={`
            w-6 h-6 bg-white rounded-full shadow-md transform transition-all
            ${useWeather ? "translate-x-6" : "translate-x-0"}
          `}
        />
      </div>
    </label>
  </div>


            {useWeather && (
              <>
                {/* Location Input */}
                <div className="mb-6">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyPress={handleLocationKeyPress}
                        placeholder="Enter city or zip code..."
                        className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-medium text-gray-800 placeholder-black-500"
                      />
                    </div>
                    <button
                      onClick={handleLocationUpdate}
                      disabled={loadingWeather}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-gray rounded-2xl font-bold text-lg hover:shadow-xl disabled:opacity-50 transition-all hover:scale-105 disabled:hover:scale-100"
                    >
                      {loadingWeather ? 'Loading...' : 'Update'}
                    </button>
                  </div>
                </div>

                {/* Weather Display */}
                {weather && !loadingWeather && (
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-4 sm:gap-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-100">
                    <div className="text-center">
                      <div className="text-4xl font-black text-gray-800 mb-1">
                        {weather.temperature}°C
                      </div>
                      <div className="text-sm text-gray-600 font-semibold">Temperature</div>
                      <div className="text-xs text-gray-500 mt-1">Feels like {weather.feelsLike}°C</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-2xl text-gray-800 mb-1">
                        <CloudRain className="w-6 h-6" />
                        <span className="font-black">{weather.condition}</span>
                      </div>
                      <div className="text-sm text-gray-600 font-semibold capitalize">{weather.description}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-2xl text-gray-800 mb-1">
                        <Droplets className="w-6 h-6" />
                        <span className="font-black">{weather.humidity}%</span>
                      </div>
                      <div className="text-sm text-gray-600 font-semibold">Humidity</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-2xl text-gray-800 mb-1">
                        <Wind className="w-6 h-6" />
                        <span className="font-black">{weather.windSpeed} mph</span>
                      </div>
                      <div className="text-sm text-gray-600 font-semibold">Wind Speed</div>
                    </div>
                  </div>
                )}

                {loadingWeather && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-base text-gray-600 font-semibold">Fetching weather data...</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mode Selector */}
          <div className="glass-strong rounded-[2.5rem] shadow-2xl p-8 sm:p-10 mb-10 animate-slide-up border-2 border-white/60 backdrop-blur-xl text-left">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-800 mb-10 text-center flex items-center justify-center gap-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <span>Choose Your Vibe</span>
            </h2>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-4 sm:gap-6">
              {Object.entries(modes).map(([key, { label, emoji, gradient, glow, dotColor }]) => {
                const hoverBorderClass =
                  key === 'professional' ? 'hover:border-blue-500' :
                  key === 'balanced' ? 'hover:border-purple-500' :
                  key === 'hype' ? 'hover:border-orange-500' :
                  'hover:border-red-500';

                return (
                <button
                  key={key}
                  onClick={() => {
                    setMode(key);
                    setRating(null);
                  }}
                  className={`group relative p-4 sm:p-6 lg:p-10 rounded-[2rem] border-2 transition-all duration-500 transform hover:scale-[1.04] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-opacity-50 focus:ring-offset-2 ${
                    mode === key
                      ? `bg-gradient-to-br ${gradient} text-white shadow-2xl ${glow} scale-[1.07] border-transparent`
                      : `border-gray-200/60 bg-white/90 hover:bg-white ${hoverBorderClass} text-gray-700 hover:shadow-xl`
                  }`}
                >
                  {mode === key && (
                    <>
                      <div className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl animate-bounce-slow z-20">
                        <div className={`w-5 h-5 ${dotColor} rounded-full`}></div>
                      </div>
                      <div className="absolute inset-0 bg-white/30 rounded-[2rem] blur-2xl -z-10 animate-pulse-slow"></div>
                    </>
                  )}
                  <div className={`text-4xl sm:text-6xl mb-5 transition-all duration-500 ${
                    mode === key
                      ? 'scale-125 rotate-12 drop-shadow-2xl'
                      : 'group-hover:scale-110 group-hover:rotate-6'
                  }`}>
                    {emoji}
                  </div>
                  <div className={`mode-label font-black text-base xs:text-lg text-lg sm:text-xl text-center break-words whitespace-normal${
                    mode === key ? 'text-white drop-shadow-lg' : 'text-gray-800'
                  }`}>
                    {label}
                  </div>
                  {mode !== key && (
                    <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>
                  )}
                </button>
                );
              })}
            </div>
          </div>

          {/* Upload Section */}
          <div className="glass-strong rounded-[2.5rem] shadow-2xl p-6 sm:p-10 mb-10 animate-slide-up border-2 border-white/60 backdrop-blur-xl text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {!photoPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-4 border-dashed border-white/50 rounded-[2rem] p-12 sm:p-24 text-center cursor-pointer hover:border-white/80 hover:bg-white/10 transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]"></div>
                <div className="relative z-10">
                  <div className="flex justify-center mb-10">
                    <div className="p-6 sm:p-8 bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-3xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 backdrop-blur-md shadow-md border-2 border-white/30">
                      <Upload className="w-20 h-20 sm:w-24 sm:h-24 text-white mx-auto drop-shadow-lg" />
                    </div>
                  </div>
                  <p className="text-3xl sm:text-4xl font-black text-gray-900 sm:text-white mb-4 drop-shadow-2xl">
                    Upload Your Outfit Photo
                  </p>
                  <p className="text-gray-900 sm:text-white/90 text-lg sm:text-xl mb-3 font-medium">
                    Click to select or drag & drop an image
                  </p>
                  <p className="text-gray-700 sm:text-white/70 text-sm sm:text-base">
                    Supports JPG, PNG, and other image formats
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-scale-in">
                <div className="relative group">
                  <div className="absolute -inset-6 bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-[2.5rem] blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow"></div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-[2rem]"></div>
                    <img
                      src={photoPreview}
                      alt="Your outfit"
                      className="w-full max-h-[360px] sm:max-h-[700px] object-contain rounded-[2rem] shadow-md sm:shadow-2xl border-4 border-white/60 backdrop-blur-sm"
                    />
                    <button
                      onClick={clearPhoto}
                      className="absolute top-8 right-8 p-4 btn-soft rounded-2xl shadow-md hover:scale-110 hover:rotate-90 transition-all duration-300 border border-white/10"
                      aria-label="Remove photo"
                    >
                      <X className="w-7 h-7 text-gray-100" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-5">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-3 px-6 sm:py-6 sm:px-10 btn-soft font-black text-lg sm:text-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 border border-transparent hover:border-indigo-500 shadow-md"
                  >
                    <RefreshCw className="w-7 h-7" />
                    <span>Change Photo</span>
                  </button>
                  <button
                    onClick={getRating}
                    disabled={loading}
                    className={`flex-1 py-3 px-6 sm:py-6 sm:px-10 bg-gradient-to-r ${currentMode.gradient} text-white rounded-2xl font-black text-xl sm:text-2xl hover:shadow-2xl transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 transform hover:scale-[1.05] hover:-translate-y-1 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-2 disabled:hover:scale-100 disabled:hover:translate-y-0 ${currentMode.glow} border-2 border-white/40 shadow-2xl`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                        <span>Analyzing Your Style...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-8 h-8" />
                        <span>Rate My Outfit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Rating Display */}
          {rating && (
            <div className="glass-strong rounded-[2.5rem] shadow-2xl p-10 sm:p-14 mb-10 border-2 border-white/60 backdrop-blur-xl animate-scale-in text-left">
              <div className="flex items-center gap-8 mb-12 pb-10 border-b-4 border-gradient-to-r from-purple-200 to-pink-200">
                <div className="text-7xl sm:text-8xl animate-bounce-slow relative">
                  <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full"></div>
                  <span className="relative">{currentMode.emoji}</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-4xl sm:text-5xl font-black text-gray-800 mb-3 flex items-center gap-3">
                    <Wand2 className="w-8 h-8 text-purple-600" />
                    <span>Claude's Verdict</span>
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${currentMode.dotColor} animate-pulse shadow-lg`}></div>
                    <p className="text-lg text-gray-600 font-bold">
                      {currentMode.label} Mode {useWeather && weather && '• Weather-Aware'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="prose prose-lg sm:prose-xl max-w-none prose-headings:text-gray-800 prose-headings:font-black prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700">
                <ReactMarkdown
                  components={{
                    h2: (props) => (
                      <h2 className="text-4xl font-black text-gray-800 mt-10 mb-6 pb-3 border-b-4 border-gradient-to-r from-purple-200 to-pink-200" {...props} />
                    ),
                    h3: (props) => (
                      <h3 className="text-3xl font-bold text-gray-800 mt-8 mb-4" {...props} />
                    ),
                    p: (props) => (
                      <p className="mb-6 text-gray-700 leading-9 text-xl" {...props} />
                    ),
                    ul: (props) => (
                      <ul className="list-disc list-outside mb-8 space-y-4 ml-6 text-xl" {...props} />
                    ),
                    li: (props) => (
                      <li className="text-gray-700 leading-9 marker:text-purple-500 marker:font-bold" {...props} />
                    ),
                    strong: (props) => (
                      <strong className="font-black text-gray-900 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1.5 rounded-lg shadow-sm" {...props} />
                    ),
                  }}
                >
                  {rating}
                </ReactMarkdown>
              </div>
              <div className="mt-12 p-8 bg-gradient-to-r from-purple-100/90 to-pink-100/90 rounded-3xl border-2 border-purple-200/60 backdrop-blur-sm shadow-xl">
                <p className="text-center text-gray-700 font-black text-lg flex items-center justify-center gap-3">
                  <span className="text-3xl">💡</span>
                  <span>
                    {useWeather && weather
                      ? 'Weather-aware rating provided! Try different modes for more perspectives!'
                      : 'Try different modes for completely different perspectives!'}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-20 mb-10 animate-fade-in">
            <p className="text-white/95 text-lg sm:text-xl mb-4 font-bold drop-shadow-2xl">
              Powered by <span className="font-black text-white text-xl">Claude Sonnet 4.5</span> × Anthropic API {useWeather && '× OpenWeather'}
            </p>
            <p className="text-white/80 text-base sm:text-lg">
              #ClaudeRatesMyOutfit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
