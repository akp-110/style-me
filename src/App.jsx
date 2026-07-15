import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import { getUpcomingEvents, formatEventForPrompt } from './calendarIntegration';
import { useWeather } from './hooks/useWeather';
import { useProfile } from './hooks/useProfile';
import { useSubscription, useGuestUsage } from './hooks/useSubscription';
import { useAuth } from './context/AuthContext';
import { UpgradeModal } from './components/UpgradeModal';
import { getAuthHeaders } from './lib/authHeaders';

import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import UserProfilePage from './pages/UserProfilePage';
import HomePage from './pages/HomePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AlexandraAshfordImage from './assets/Alexandra_Ashford.png';
import MargotLeclercImage from './assets/Margot_Leclerc.jpg';
import KaiChenImage from './assets/Kai_Chen.jpg';
import MarcusStoneImage from './assets/Marcus_Stone.jpg';

export default function App() {
  // Photo state
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [rating, setRating] = useState(null);
  const [socialSummary, setSocialSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing Your Style...');
  const [mode, setMode] = useState('balanced');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Custom hooks
  const weatherHook = useWeather();
  const profileHook = useProfile();
  const subscriptionHook = useSubscription();
  const guestUsage = useGuestUsage();
  const { user } = useAuth();

  // Unified usage view for the rating chip AND the analysis counter:
  // DB-backed subscription for a logged-in user, or the localStorage guest
  // allowance (ratings + analyses tracked separately) when signed out.
  const usageView = user
    ? subscriptionHook
    : {
        tier: 'free',
        loading: false,
        remaining: guestUsage.remaining,
        getRemainingText: () => `${guestUsage.remaining}/${guestUsage.limit}`,
        analysisRemaining: guestUsage.analysisRemaining,
        getAnalysisText: () => `${guestUsage.analysisRemaining}/${guestUsage.limit}`,
        bumpAnalysisCount: guestUsage.logGuestAnalysis,
      };

  const modes = {
    professional: {
      label: 'Alexandra Ashford',
      title: 'The Curator',
      quote: 'I read an outfit the way I read a painting — context, proportion, intent.',
      persona: 'Understated Sophistication',
      bio: 'Museum curator & style theorist analyzing cultural context',
      image: AlexandraAshfordImage
    },
    balanced: {
      label: 'Margot Leclerc',
      title: 'The Consultant',
      quote: 'True elegance is harmony — we simply turn up its volume.',
      persona: 'Thoughtful, Elegant, and Refined',
      bio: 'Parisian consultant elevating style with warmth',
      image: MargotLeclercImage
    },
    hype: {
      label: 'Kai Chen',
      title: 'The Journalist',
      quote: "Bold choices are the whole story. I'm just here to write it down.",
      persona: 'Authenticity, Energy and Enthusiam',
      bio: 'Fashion journalist celebrating boldness & expression',
      image: KaiChenImage
    },
    roast: {
      label: 'Marcus Stone',
      title: 'The Critic',
      quote: "I don't roast people. I roast decisions. Yours, specifically.",
      persona: 'Truthful and Straightforward',
      bio: 'Fashion critic with witty, sharp observations',
      image: MarcusStoneImage
    }
  };

  const buildRatingContext = () => {
    // Provider prompts and token budgets are server-owned. This client sends
    // only bounded product context; the server validates it again.
    const { profile } = profileHook;
    const upcomingEvents = profileHook.useCalendarContext
        ? getUpcomingEvents(profile.calendarEvents, 3).slice(0, 3).map(event => formatEventForPrompt(event).slice(0, 180))
      : [];
    return {
      weather: weatherHook.useWeather && weatherHook.weather ? {
        description: weatherHook.weather.description,
        temperature: weatherHook.weather.temperature,
        feelsLike: weatherHook.weather.feelsLike,
        location: weatherHook.location.slice(0, 160),
        humidity: weatherHook.weather.humidity,
        windSpeed: weatherHook.weather.windSpeed
      } : null,
      profile: {
        stylePreferences: profile.stylePreferences.slice(0, 10).map(value => value.slice(0, 80)),
        favouriteColors: profile.favouriteColors.slice(0, 10).map(value => value.slice(0, 80)),
        favouriteBrands: profile.favouriteBrands.slice(0, 10).map(value => value.slice(0, 80))
      },
      upcomingEvents
    };
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      console.log(`Original image: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

      // Optimize image (resize and convert to JPEG)
      const { optimizeImage } = await import('./utils/imageOptimization.js');
      const { blob, dataUrl } = await optimizeImage(file, 1024, 0.85);

      console.log(`Optimized image: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Size reduction: ${Math.round(((file.size - blob.size) / file.size) * 100)}%`);

      // Create a File object from the blob
      const optimizedFile = new File([blob], 'optimized.jpg', { type: 'image/jpeg' });

      setPhoto(optimizedFile);
      setPhotoPreview(dataUrl);
      setRating(null);
      setSocialSummary(null);
    } catch (error) {
      console.error('Error optimizing image:', error);
      alert('Failed to process image. Please try a different image.');
    } finally {
      setLoading(false);
    }
  };

  const clearPhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setRating(null);
  };

  const getRating = async () => {
    if (!photo) {
      alert('Please upload a photo first!');
      return;
    }

    // Check usage limits
    if (user) {
      // Authenticated user - check subscription limits
      if (!subscriptionHook.canRate()) {
        setShowUpgradeModal(true);
        return;
      }
    } else {
      // Guest user - check weekly limit
      const guestCheck = guestUsage.checkGuestCanRate();
      if (!guestCheck.canRate) {
        alert(`You've used your 20 free ratings this month. Sign up for more! (${guestCheck.daysLeft} days until reset)`);
        return;
      }
    }

    setLoading(true);
    setRating(null);

    // Progress messages
    const messages = [
      'Analyzing your style...',
      'Consulting fashion expert...',
      'Evaluating outfit details...',
      'Preparing feedback...'
    ];

    let messageIndex = 0;
    setLoadingMessage(messages[0]);

    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 2000);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        // Detect media type from the data URL
        const mediaType = reader.result.split(';')[0].split(':')[1];
        console.log('Detected mediaType:', mediaType);
        const base64Image = reader.result.split(',')[1];
        const context = buildRatingContext();

        const response = await fetch('/api/rate-outfit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(await getAuthHeaders())
          },
          body: JSON.stringify({
            image: base64Image,
            mediaType: mediaType,
            mode: mode,
            context
          })
        });

        const data = await response.json();

        if (response.status === 429) {
          clearInterval(messageInterval);
          setLoading(false);
          if (user) {
            setShowUpgradeModal(true);
          } else {
            alert(data.error || "You've used your free ratings this month. Sign up for more!");
          }
          return;
        }

        if (response.status === 401) {
          clearInterval(messageInterval);
          setLoading(false);
          alert('Your session has expired. Please sign in again.');
          return;
        }

        if (response.status === 503) {
          clearInterval(messageInterval);
          setLoading(false);
          alert('Ratings are temporarily unavailable. Please try again shortly.');
          return;
        }

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

        // Extract Social Media Summary, stripping any markdown emphasis
        // (the model often wraps it in *italics* or **bold**)
        const summaryMatch = ratingText.match(/\*\*Social Media Summary:\*\*\s*\n*(.+?)(?=\n\n|\*\*|$)/s);
        const summary = summaryMatch
            ? summaryMatch[1]
                .replace(/[*_]/g, '')          // strip markdown emphasis
                .replace(/\s*—\s*/g, ' — ')    // space em-dashes so words don't break mid-token
                .trim()
            : "Check out my outfit rating on Style/Me!";
        setSocialSummary(summary);

        setRating(ratingText);

        // The server records usage (single writer); bump the local count
        // for the header chip, and keep the guest localStorage marker as
        // the friendly first-line check.
        if (user) {
          subscriptionHook.bumpUsageCount();
        } else {
          guestUsage.logGuestRating();
        }

        clearInterval(messageInterval);
        setLoading(false);
      };

      reader.onerror = () => {
        clearInterval(messageInterval);
        setLoading(false);
        throw new Error('Failed to read image file');
      };

      reader.readAsDataURL(photo);
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to get rating: ${error.message}`);
      clearInterval(messageInterval);
      setLoading(false);
    }
  };

  const currentMode = modes[mode];



  return (
    <>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={subscriptionHook.tier}
      />
      <Routes>
        <Route path="/" element={<HomePage
          weatherHook={weatherHook}
          profileHook={profileHook}
          usageView={usageView}
          showUpgradeModal={showUpgradeModal}
          setShowUpgradeModal={setShowUpgradeModal}
          mode={mode}
          setMode={setMode}
          modes={modes}
          setRating={setRating}
          photo={photo}
          photoPreview={photoPreview}
          handleFileUpload={handleFileUpload}
          clearPhoto={clearPhoto}
          getRating={getRating}
          loading={loading}
          loadingMessage={loadingMessage}
          currentMode={currentMode}
          rating={rating}
          socialSummary={socialSummary}
          showHelpModal={showHelpModal}
          setShowHelpModal={setShowHelpModal}
        />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </>
  );
}
