import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, Sparkles, TrendingUp, Flame, Smile, X, RefreshCw, Star, Zap, Wand2, MapPin, Cloud, Droplets, Wind, CloudRain, Heart, Settings, Plus, Trash2, Calendar, Upload as UploadIcon, Briefcase, Palette, Award, Lightbulb, CheckCircle2, Eye, Scale, Sun, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { parseICSFile, getUpcomingEvents, formatEventForPrompt } from './calendarIntegration';
import AlexandraAshfordImage from './assets/Alexandra_Ashford.png';
import MargotLeclercImage from './assets/Margot_Leclerc.jpg';
import KaiChenImage from './assets/Kai_Chen.jpg';
import MarcusStoneImage from './assets/Marcus_Stone.jpg';

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
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [styleProfile, setStyleProfile] = useState({
    preferences: [],
    colors: [],
    brands: []
  });
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [newPref, setNewPref] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [useCalendarContext, setUseCalendarContext] = useState(true);
  const fileInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const calendarInputRef = useRef(null);

  // Load style profile from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('styleProfile');
    if (saved) {
      try {
        setStyleProfile(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading style profile:', error);
      }
    }

    // Load calendar events from localStorage
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      try {
        setCalendarEvents(JSON.parse(savedEvents));
      } catch (error) {
        console.error('Error loading calendar events:', error);
      }
    }
  }, []);

  // Save style profile to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('styleProfile', JSON.stringify(styleProfile));
  }, [styleProfile]);

  // Save calendar events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  const modes = {
    professional: {
      icon: Eye,
      label: 'Alexandra Ashford',
      persona: 'Understated Sophistication',
      bio: 'Museum curator & style theorist analyzing cultural context',
      image: AlexandraAshfordImage,
      color: 'slate',
      gradient: 'from-slate-700 via-slate-800 to-gray-900',
      glow: 'glow-muted',
      bgGradient: 'from-slate-800/40 to-slate-700/20',
      borderColor: 'border-slate-600',
      dotColor: 'bg-slate-800'
    },
    balanced: {
      icon: Scale,
      label: 'Margot Leclerc',
      persona: 'Thoughtful, Elegant, and Refined',
      bio: 'Parisian consultant elevating style with warmth',
      image: MargotLeclercImage,
      color: 'orange',
      gradient: 'from-slate-900 via-orange-950 to-slate-900',
      glow: 'glow-sage',
      bgGradient: 'from-orange-800/30 to-emerald-800/15',
      borderColor: 'border-orange-600',
      dotColor: 'bg-orange-900'
    },
    hype: {
      icon: Sun,
      label: 'Kai Chen',
      persona: 'Authenticity, Energy and Enthusiam',
      bio: 'Fashion journalist celebrating boldness & expression',
      image: KaiChenImage,
      color: 'green',
      gradient: 'from-teal-800 via-emerald-800 to-green-900',
      glow: 'glow-gold',
      bgGradient: 'from-teal-800/25 to-green-800/15',
      borderColor: 'border-green-900',
      dotColor: 'bg-green-900'
    },
    roast: {
      icon: MessageCircle,
      label: 'Marcus Stone',
      persona: 'Truthful and Straightforward',
      bio: 'Fashion critic with witty, sharp observations',
      image: MarcusStoneImage,
      color: 'indigo',
      gradient: 'from-violet-950 via-inidgo-900 to-blue-950',
      glow: 'glow-muted',
      bgGradient: 'from-indigo-900/35 to-indigo-800/18',
      borderColor: 'border-blue-500',
      dotColor: 'bg-indigo-900'
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

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionSelect = (suggestion) => {
    setLocation(suggestion.displayName);
    setShowSuggestions(false);
    // Fetch weather for selected location
    fetchWeatherByLocation(suggestion.displayName);
  };

  const getMockWeather = () => ({
    temperature: 22,
    feelsLike: 21,
    condition: 'Clear',
    description: 'clear sky',
    humidity: 60,
    windSpeed: 5,
    icon: '01d'
  });

  const handleLocationUpdate = () => {
    if (location.trim()) {
      fetchWeatherByLocation(location.trim());
      setShowSuggestions(false);
    }
  };

  const handleLocationKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLocationUpdate();
    }
  };

  // Style Profile Handlers
  const addPreference = () => {
    if (newPref.trim()) {
      setStyleProfile(prev => ({
        ...prev,
        preferences: [...prev.preferences, newPref.trim()]
      }));
      setNewPref('');
    }
  };

  const addColor = () => {
    if (newColor.trim()) {
      setStyleProfile(prev => ({
        ...prev,
        colors: [...prev.colors, newColor.trim()]
      }));
      setNewColor('');
    }
  };

  const addBrand = () => {
    if (newBrand.trim()) {
      setStyleProfile(prev => ({
        ...prev,
        brands: [...prev.brands, newBrand.trim()]
      }));
      setNewBrand('');
    }
  };

  const removeItem = (category, index) => {
    setStyleProfile(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
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

  // Calendar event handlers
  const handleICSFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const events = parseICSFile(reader.result);
          setCalendarEvents(events);
          alert(`Successfully loaded ${events.length} events from your calendar!`);
          setShowCalendarModal(false);
        } catch (error) {
          console.error('Error parsing ICS file:', error);
          alert('Error parsing calendar file. Please ensure it\'s a valid .ics file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const removeCalendarEvent = (index) => {
    setCalendarEvents(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllCalendarEvents = () => {
    if (window.confirm('Are you sure you want to clear all calendar events?')) {
      setCalendarEvents([]);
    }
  };

  const getModePrompt = () => {
    const prompts = {

professional: `You are Alexandra Ashford, an erudite museum curator and fashion theorist with 15+ years of expertise in aesthetic semiotics and cultural history. Your analytical framework emphasizes:

CORE APPROACH:
- Examine fashion through the lens of design principles, proportion theory, and cultural/historical context
- Break down the semiotics of styling choices—what each element communicates and why it works or doesn't
- Reference relevant design movements, fashion history, or theoretical frameworks when applicable
- Elevate understanding through intellectual rigor, not gatekeeping

TONE & MANNER:
- Clinical precision balanced with reverence for craft and intention
- Articulate like an academic, but accessible—explain concepts clearly for non-specialists
- Show genuine appreciation for thoughtful choices while constructively analyzing missteps
- Your opening often frames the analysis: "Let me break down the semiotics here..." or "From a proportion standpoint..."

FEEDBACK STRUCTURE:
1. Identify the conceptual intent (what is the wearer trying to communicate?)
2. Analyze proportion, color theory, and visual hierarchy
3. Reference relevant context (era, movement, designer philosophy)
4. Suggest refinements through the lens of design principles, not trends
5. Close by elevating the wearer's understanding of their own aesthetic choices

CONSTRAINTS:
- Never dismiss something simply because it's unconventional
- Always find the intellectual merit in bold choices
- Prioritize education over criticism
- Remain curious about the wearer's intent before judging execution`
,
balanced: `You are Margot Leclerc, a refined Parisian style consultant with a philosophy rooted in the belief that true elegance emerges from harmony, intentionality, and personal evolution. Your approach embodies:

CORE PHILOSOPHY:
- Style is not about following rules but understanding them—then knowing when and how to bend them gracefully
- Every person has an inherent aesthetic; your role is to help them refine and amplify it
- Quality over quantity, intention over impulse, harmony over noise
- Personal evolution matters more than perfection in any single moment

TONE & MANNER:
- Warm, encouraging mentor who sees potential even in missteps
- Knowledgeable without being pretentious; speak from experience, not superiority
- Your warmth is genuine—you truly believe in the person you're advising
- Balance celebration with suggestion: "This is lovely, and here's how we might elevate it further..."
- Use "we" language to create partnership, not hierarchy

FEEDBACK STRUCTURE:
1. Celebrate what's working—be specific about why a choice succeeds
2. Ask intuitive questions: "What are you trying to express here?" or "How does this make you feel wearing it?"
3. Suggest elegant refinements that honor the wearer's intent
4. Offer alternatives that build on existing strengths rather than start over
5. Close with encouragement and a sense of partnership in their style journey

AESTHETIC GUIDANCE:
- Favor timeless over trendy; classic silhouettes, quality fabrics, neutral foundations
- Suggest layering and texture as tools for sophistication
- Emphasize the power of fit, proportion, and a few well-chosen statement pieces
- Encourage a personal uniform or signature style as a form of self-knowledge

CONSTRAINTS:
- Never make anyone feel "wrong" about their choices
- Avoid prescriptive fashion rules—frame suggestions as possibilities
- Always connect feedback to the wearer's values and lifestyle
- Prioritize how something makes them feel over how it photographs`
,
hype: `You are Kai Chen, a dynamic fashion journalist in his early 30s with an infectious, celebratory approach to style. Your worldview centers on fashion as authentic self-expression and cultural boldness. Your energy includes:

CORE PERSPECTIVE:
- Fashion is a form of courage and creativity; you celebrate both equally
- Individual expression matters more than conventional "correctness"
- Style tells a story about identity, values, and cultural engagement
- Confidence is the most important accessory—everything else follows

TONE & MANNER:
- Genuinely enthusiastic but never performative or artificial
- Your excitement comes from recognizing *why* something works, not just that it does
- Conversational, accessible, and warm—people feel energized after talking with you
- Your genuine appreciation is contagious; you make people feel *seen*
- Signature openings: "I absolutely love the confidence here!" or "There's something brilliant happening with..."

FEEDBACK STRUCTURE:
1. Identify the bold choice and celebrate it specifically
2. Explain why this choice shows confidence or cultural awareness
3. Highlight how pieces work together to create a cohesive narrative
4. Acknowledge the risk-taking and authenticity in the styling
5. Encourage further experimentation and self-expression

WHAT TO AMPLIFY:
- Color courage and unexpected combinations
- Cultural references and thoughtful borrowing
- Personal quirks and "signature" details
- Pieces that clearly reflect intentional curation
- Risks that pay off (and risks that almost do)

ENERGY RULES:
- Maintain infectious enthusiasm without diminishing substance
- Your compliments are specific and earned, not generic
- You notice details others miss and celebrate them
- Your energy never overshadows the wearer's vision—it amplifies it

CONSTRAINTS:
- Never use hype as a substitute for analysis
- Avoid validating lazy styling—celebrate intentionality and risk-taking specifically
- Keep energy genuine and rooted in observation, not performance
- Ensure feedback feels personally addressed, not like a generic compliment`
,
roast: `You are Marcus Stone, an irreverent and witty fashion critic with a sharp cultural sensibility and genuine love of fashion. Your role is sophisticated commentary delivered with playful honesty. Your framework:

CORE PHILOSOPHY:
- Fashion deserves rigorous, entertaining criticism—reverence and irreverence can coexist
- The best critique makes people think, laugh, and reconsider simultaneously
- Cultural awareness and intelligence are non-negotiable; superficial snobbery is boring
- Never punch down at personal choices; punch sideways at pretension and lazy styling

TONE & MANNER:
- Clever, observant, and disarmingly honest without being unkind
- Your wit comes from unexpected connections and sharp observation, not insults
- You speak like a fashion columnist—elegant vocabulary, sharp turns of phrase
- Your humor is rooted in genuine cultural fluency, not mean-spiritedness
- You find what's interesting (or absurdly contradictory) and make it entertaining

SIGNATURE APPROACH:
- Open with a sharp observation: "Here's the tea..." or "So what we're doing here is..."
- Acknowledge the intent, then examine the execution with specificity
- Use humor to highlight contradictions, risks, or interesting choices
- Provide constructive alternatives framed with wit, not defensiveness
- Close with a memorable observation that reframes the look

FEEDBACK STRUCTURE:
1. Make a witty, unexpected observation that captures the essence of the look
2. Identify what the wearer is *trying* to do—give credit for intent
3. Analyze where execution succeeds or falters with sharp specificity
4. Suggest provocative alternatives that push thinking further
5. End with a clever reframe that leaves the wearer entertained and thinking

WHAT MAKES YOUR CRITIQUE WORK:
- Cultural references that land with the informed audience
- Unexpected connections between disparate elements
- Recognition of fashion paradoxes and contradictions (the irony, the audacity, the brilliance)
- Genuine appreciation for bold choices, even when they're flawed
- Sharp language that elevates criticism to entertainment

CONSTRAINTS - CRITICAL:
- Your target is pretension, lazy styling, and boring conformity—never the person wearing it
- Wit without substance is empty; every observation should have weight
- Never dismiss something simply because it's unconventional
- Always end on a note that suggests growth, possibilities, or entertainment—not defeat
- Be provocative about ideas, never cruel about people
- The wearer should feel challenged and entertained, not diminished`
    };
    return prompts[mode];
  };

  const buildPromptWithWeather = () => {
    const basePrompt = getModePrompt();

    let weatherContext = '';
    if (useWeather && weather) {
      weatherContext = `

**Weather:** ${weather.description}, ${weather.temperature}°C (${weather.feelsLike}°C felt)
**Location:** ${location} | Humidity: ${weather.humidity}% | Wind: ${weather.windSpeed}mph`;
    }

    let styleContext = '';
    if (styleProfile.preferences.length > 0 || styleProfile.colors.length > 0 || styleProfile.brands.length > 0) {
      const parts = [];
      if (styleProfile.preferences.length > 0) parts.push(`Styles: ${styleProfile.preferences.join(', ')}`);
      if (styleProfile.colors.length > 0) parts.push(`Colors: ${styleProfile.colors.join(', ')}`);
      if (styleProfile.brands.length > 0) parts.push(`Brands: ${styleProfile.brands.join(', ')}`);
      styleContext = `\n\n**Profile:** ${parts.join(' | ')}`;
    }

    let calendarContext = '';
    if (useCalendarContext && calendarEvents.length > 0) {
      const upcomingEvents = getUpcomingEvents(calendarEvents, 3);
      if (upcomingEvents.length > 0) {
        const eventSummary = upcomingEvents.map(e => formatEventForPrompt(e)).join(' | ');
        calendarContext = `\n\n**Upcoming (3d):** ${eventSummary}`;
      }
    }

    return `${basePrompt}${weatherContext}${styleContext}${calendarContext}

Rate this outfit and provide feedback. Structure your response as:

**Overall Rating: X/10**

**Breakdown:**
- Style: X/10
${useWeather && weather ? '- Weather Appropriateness: X/10' : '- Versatility: X/10'}
- Occasion Fit: X/10

**What Works:**
[2-3 specific positive points]

**Suggestions:**
[2-3 specific improvements]${styleProfile.brands.length > 0 ? '\n- Recommended Brands/Stores: [Suggest where to shop based on their favourite brands]' : ''}

${calendarEvents.length > 0 ? '**Calendar Compatibility:**\n[How well does this outfit work for upcoming events?]' : ''}

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
      <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-gray-400/20 rounded-full blur-3xl floating"></div>
      <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-slate-400/20 rounded-full blur-3xl floating-delayed"></div>

      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10"></div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-start min-h-screen">
        <div className="max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-14 animate-slide-down">
            <h1 className="text-7xl sm:text-9xl lg:text-[12rem] font-black mb-6 relative leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-slate-200 via-white to-slate-200 bg-clip-text text-transparent block drop-shadow-2xl">
                <span className="text-amber-50">Style /</span>
                <span className="text-orange-700"> Me</span>
              </span>
            </h1>
            <p className="text-white/85 text-base sm:text-lg lg:text-2xl max-w-3xl mx-auto font-light tracking-wide mb-8 leading-relaxed">
              AI-powered fashion feedback {useWeather && 'with real-time weather context'}, style preferences, and calendar integration.
            </p>


            {/* Style Profile Button */}
            <button
              onClick={() => setShowStyleModal(true)}
              className="mt-8 min-w-56 px-6 py-3 bg-gradient-to-r from-slate-900 to-orange-950 text-amber-50 rounded-2xl font-semibold text-sm sm:text-base hover:shadow-2xl transition-all hover:scale-105 flex jusitfy-center items-center-justify gap-5 mx-auto"
            >
              <Heart className="w-5 h-5" />
              <span>My Style Profile</span>
            </button>

            {/* Calendar Button */}
            <button
              onClick={() => setShowCalendarModal(true)}
              className="mt-4 min-w-56 px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-amber-50 rounded-2xl font-semibold text-sm sm:text-base hover:shadow-2xl transition-all hover:scale-105 flex justify-center items-center gap-2 mx-auto"
            >
              <Calendar className="w-5 h-5" />
              <span>My Calendar</span>
              {calendarEvents.length > 0 && <span className="text-xs bg-white/30 px-2 py-1 rounded-full">{calendarEvents.length} events</span>}
            </button>
          </div>

          {/* Weather Section */}
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

          {/* Mode Selector */}
          <div className="glass-strong rounded-[2.5rem] shadow-2xl p-8 sm:p-10 mb-10 animate-slide-up border-2 border-white/40 backdrop-blur-xl text-left">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-10 text-center flex items-center justify-center gap-4">
              <div className="p-2 bg-gradient-to-br from-slate-900 to-orange-950 rounded-xl">
                <Zap className="w-7 h-7 text-amber-50" />
              </div>
              <span>Choose your advisor</span>
            </h2>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-4 sm:gap-6">
              {Object.entries(modes).map(([key, modeData]) => {
                const { label, persona, bio, image, icon: IconComponent, gradient, glow, dotColor } = modeData;
                const hoverBorderClass =
                  key === 'professional' ? 'hover:border-slate-600' :
                  key === 'balanced' ? 'hover:border-orange-700' :
                  key === 'hype' ? 'hover:border-green-700' :
                  'hover:border-indigo-700';

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
                      : `border-slate-300/60 bg-white/90 hover:bg-white ${hoverBorderClass} text-slate-700 hover:shadow-xl`
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
                  {image ? (
                    <div className={`mb-5 transition-all duration-500 persona-image-container ${
                      mode === key
                        ? 'scale-125 drop-shadow-2xl'
                        : 'group-hover:scale-110'
                    }`}>
                      <div className="relative">
                        {/* Glow background */}
                        <div className={`persona-glow glow-${
                          key === 'professional' ? 'slate' :
                          key === 'balanced' ? 'orange' :
                          key === 'hype' ? 'cyan' :
                          'slate'
                        }`}></div>

                        {/* Image */}
                        <img
                          src={image}
                          alt={label}
                          className="persona-image w-20 h-20 sm:w-32 sm:h-32 mx-auto rounded-full object-cover border-4 relative z-10"
                          style={{borderColor: mode === key ? 'white' : 'currentColor'}}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={`text-4xl sm:text-6xl mb-5 transition-all duration-500 ${
                      mode === key
                        ? 'scale-125 rotate-12 drop-shadow-2xl'
                        : 'group-hover:scale-110 group-hover:rotate-6'
                    }`}>
                      <IconComponent className="w-16 h-16 sm:w-24 sm:h-24 mx-auto" />
                    </div>
                  )}
                  <div className={`mode-label font-semibold text-sm xs:text-base sm:text-lg text-center ${
                    mode === key ? 'text-white drop-shadow-lg' : 'text-slate-800'
                  }`}>
                    {label}
                  </div>
                  <div className={`text-xs xs:text-sm sm:text-base text-center leading-tight mt-2 ${
                    mode === key ? 'text-white/90' : 'text-slate-600'
                  }`}>
                    {persona}
                  </div>
                  {mode === key && (
                    <div className="text-xs sm:text-sm text-white/80 text-center mt-3 leading-snug px-2">
                      {bio}
                    </div>
                  )}
                  {mode !== key && (
                    <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-slate-500/0 to-slate-500/0 group-hover:from-slate-500/10 group-hover:to-slate-500/10 transition-all duration-500"></div>
                  )}
                </button>
                );
              })}
            </div>
          </div>

          {/* Upload Section */}
          <div className="glass-strong rounded-[2.5rem] shadow-2xl p-6 sm:p-10 mb-10 animate-slide-up border-2 border-white/40 backdrop-blur-xl text-center">
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
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]"></div>
                <div className="relative z-10">
                  <div className="flex justify-center mb-10">
                    <div className="p-6 sm:p-8 bg-gradient-to-br from-orange-600 to-orange-700 rounded-3xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 backdrop-blur-md shadow-md border-2 border-white/30">
                      <Upload className="w-20 h-20 sm:w-24 sm:h-24 text-white mx-auto drop-shadow-lg" />
                    </div>
                  </div>
                  <p className="text-3xl sm:text-4xl font-black text-slate-900 sm:text-white mb-4 drop-shadow-2xl">
                    Upload Your Outfit Photo
                  </p>
                  <p className="text-slate-900 sm:text-white/90 text-lg sm:text-xl mb-3 font-medium">
                    Click to select or drag & drop an image
                  </p>
                  <p className="text-slate-700 sm:text-white/70 text-sm sm:text-base">
                    Supports JPG, PNG, and other image formats
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-scale-in">
                <div className="relative group">
                  <div className="absolute -inset-6 bg-gradient-to-br from-slate-900/40 to-orange-950/40 rounded-[2.5rem] blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow"></div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-[2rem]"></div>
                    <img
                      src={photoPreview}
                      alt="Your outfit"
                      className="w-full max-h-[360px] sm:max-h-[700px] object-contain rounded-[2rem] shadow-md sm:shadow-2xl border-4 border-white/60 backdrop-blur-sm"
                    />
                    <button
                      onClick={clearPhoto}
                      className="absolute top-3 right-3 p-4 btn-soft rounded-2xl shadow-md hover:scale-110 hover:rotate-90 transition-all duration-300 border border-white/10"
                      aria-label="Remove photo"
                    >
                      <X className="w-6 h-6 text-slate-800" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-5">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-3 px-6 sm:py-6 sm:px-10 btn-soft font-semibold text-lg sm:text-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 border border-transparent hover:border-orange-600 shadow-md"
                  >
                    <RefreshCw className="text-slate-800 w-7 h-7" />
                    <span className="text-black">Change Photo</span>
                  </button>
                  <button
                    onClick={getRating}
                    disabled={loading}
                    className={`flex-1 py-3 px-6 sm:py-6 sm:px-10 bg-gradient-to-r ${currentMode.gradient} text-white rounded-2xl font-semibold text-xl sm:text-2xl hover:shadow-2xl transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 transform hover:scale-[1.05] hover:-translate-y-1 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-2 disabled:hover:scale-100 disabled:hover:translate-y-0 ${currentMode.glow} border-2 border-white/40 shadow-2xl`}
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
            <div className="glass-strong rounded-[2.5rem] shadow-2xl p-10 sm:p-14 mb-10 border-2 border-white/40 backdrop-blur-xl animate-scale-in text-left">
              <div className="flex items-center gap-8 mb-12 pb-10 border-b-4 border-gradient-to-r from-slate-300 to-orange-300">
                <div className="text-7xl sm:text-8xl animate-bounce-slow relative">
                  <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full"></div>
                  <span className="relative">
                    <currentMode.icon className="w-24 h-24 sm:w-32 sm:h-32 text-slate-700" />
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-4xl sm:text-5xl font-black text-slate-800 mb-3 flex items-center gap-3">
                    <Wand2 className="w-8 h-8 text-orange-700" />
                    <span>{currentMode.label}'s Advice</span>
                  </h2>
                  <div className="flex items-center gap-3">
                  </div>
                </div>
              </div>
              <div className="prose prose-lg sm:prose-xl max-w-none prose-headings:text-gray-800 prose-headings:font-black prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700">
                <ReactMarkdown
                  components={{
                    h2: (props) => (
                      <h2 className="text-4xl font-black text-gray-800 mt-10 mb-6 pb-3 border-b-4 border-gradient-to-r from-gray-200 to-slate-200" {...props} />
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
                      <li className="text-gray-700 leading-9 marker:text-slate-500 marker:font-bold" {...props} />
                    ),
                    strong: (props) => (
                      <strong className="font-black text-gray-900 bg-gradient-to-r from-slate-100 to-gray-100 px-3 py-1.5 rounded-lg shadow-sm" {...props} />
                    ),
                  }}
                >
                  {rating}
                </ReactMarkdown>
              </div>
              <div className="mt-12 p-8 bg-gradient-to-r from-slate-100/90 to-gray-100/90 rounded-3xl border-2 border-slate-200/60 backdrop-blur-sm shadow-xl">
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
            <p className="text-slate-300 text-sm sm:text-base mb-4 font-light tracking-wide drop-shadow-2xl">
              Powered by <span className="font-semibold text-white">Claude Sonnet 4.5</span> × Anthropic API {useWeather && '× OpenWeather'}
            </p>
            <p className="text-slate-400 text-xs sm:text-sm tracking-widest uppercase font-light">
              #StyleMe
            </p>
          </div>
        </div>
      </div>

      {/* Style Profile Modal */}
      {showStyleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-orange-800 px-6 sm:px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-white" fill="white" />
                <h2 className="text-2xl sm:text-3xl font-black text-white">My Style Profile</h2>
              </div>
              <button
                onClick={() => setShowStyleModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              {/* Style Preferences */}
              <div>
                <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Style Preferences
                </h3>
                <p className="text-sm text-slate-600 mb-4">Add words that describe your style (e.g., minimalist, boho, edgy, preppy)</p>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newPref}
                    onChange={(e) => setNewPref(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPreference()}
                    placeholder="e.g., minimalist"
                    className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-orange-600 focus:outline-none font-medium text-slate-800"
                  />
                  <button
                    onClick={addPreference}
                    className="px-4 py-2 bg-orange-600 text-amber-50 rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {styleProfile.preferences.map((pref, idx) => (
                    <div key={idx} className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                      <span>{pref}</span>
                      <button
                        onClick={() => removeItem('preferences', idx)}
                        className="hover:bg-orange-200 rounded-full p-1 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Favourite Colors */}
              <div>
                <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                  <Palette className="w-6 h-6" />
                  Favourite Colours
                </h3>
                <p className="text-sm text-slate-600 mb-4">Add your favourite colours</p>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addColor()}
                    placeholder="e.g., navy blue"
                    className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-slate-600 focus:outline-none font-medium text-slate-800"
                  />
                  <button
                    onClick={addColor}
                    className="px-4 py-2 bg-slate-700 text-amber-50 rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {styleProfile.colors.map((color, idx) => (
                    <div key={idx} className="bg-slate-100 text-slate-800 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                      <span>{color}</span>
                      <button
                        onClick={() => removeItem('colors', idx)}
                        className="hover:bg-slate-200 rounded-full p-1 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Favourite Brands */}
              <div>
                <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Favourite Brands
                </h3>
                <p className="text-sm text-slate-600 mb-4">Add your favourite clothing brands</p>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addBrand()}
                    placeholder="e.g., Zara"
                    className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-slate-600 focus:outline-none font-medium text-slate-800"
                  />
                  <button
                    onClick={addBrand}
                    className="px-4 py-2 bg-slate-600 text-amber-50 rounded-xl font-semibold hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {styleProfile.brands.map((brand, idx) => (
                    <div key={idx} className="bg-slate-100 text-slate-800 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                      <span>{brand}</span>
                      <button
                        onClick={() => removeItem('brands', idx)}
                        className="hover:bg-slate-200 rounded-full p-1 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info section */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4">
                <p className="text-sm text-orange-900 font-semibold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  <span><span className="font-black">Tip:</span> Your style profile is saved locally on your device and will be used to personalise outfit suggestions and recommendations!</span>
                </p>
              </div>

              <button
                onClick={() => setShowStyleModal(false)}
                className="w-full py-3 bg-gradient-to-r from-slate-700 to-orange-700 text-white rounded-2xl font-semibold text-lg hover:shadow-lg transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-950 px-6 sm:px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-white" />
                <h2 className="text-2xl sm:text-3xl font-black text-white">My Calendar</h2>
              </div>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-amber-50" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Upload ICS File */}
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <UploadIcon className="w-6 h-6" />
                  Import Calendar
                </h3>
                <p className="text-sm text-slate-600 mb-4">Upload a .ics calendar file (export from Google Calendar, Outlook, Apple Calendar, etc.)</p>
                <input
                  ref={calendarInputRef}
                  type="file"
                  accept=".ics,.ical,.ifb,.icalendar"
                  onChange={handleICSFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => calendarInputRef.current?.click()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-950 text-white rounded-2xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <UploadIcon className="w-5 h-5" />
                  <span>Choose .ics File</span>
                </button>
              </div>

              {/* Calendar Toggle */}
              <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCalendarContext}
                    onChange={(e) => setUseCalendarContext(e.target.checked)}
                    className="w-5 h-5 text-slate-700 rounded"
                  />
                  <span className="font-semibold text-slate-800">Include calendar context in outfit ratings</span>
                </label>
              </div>

              {/* Events List */}
              {calendarEvents.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-slate-800">
                      Events ({calendarEvents.length})
                    </h3>
                    <button
                      onClick={clearAllCalendarEvents}
                      className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {calendarEvents.map((event, idx) => {
                      const eventDate = new Date(event.startTime);
                      const isUpcoming = eventDate > new Date();
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border-2 flex items-start justify-between gap-3 ${
                            isUpcoming
                              ? 'bg-slate-100 border-slate-300'
                              : 'bg-slate-50 border-slate-200 opacity-60'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 truncate">{event.title}</p>
                            <p className="text-sm text-slate-600">
                              {eventDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {event.location && (
                              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeCalendarEvent(idx)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-semibold">No calendar events yet</p>
                  <p className="text-sm text-slate-500">Upload your calendar to get event-aware fashion recommendations!</p>
                </div>
              )}

              {/* Info */}
              <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-4">
                <p className="text-sm text-slate-900 font-semibold flex items-start gap-2">
                  <Calendar className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span><span className="font-black">How to export:</span> Google Calendar → Settings → Export Calendar (Downloads .ics file) | Outlook → File → Options → Advanced → Export | Apple Calendar → Select calendar → File → Export</span>
                </p>
              </div>

              <button
                onClick={() => setShowCalendarModal(false)}
                className="w-full py-3 bg-gradient-to-r from-slate-800 to-slate-950 text-white rounded-2xl font-semibold text-lg hover:shadow-lg transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
