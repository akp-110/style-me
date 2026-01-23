import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import { getUpcomingEvents, formatEventForPrompt } from './calendarIntegration';
import { useWeather } from './hooks/useWeather';
import { useProfile } from './hooks/useProfile';
import { useSubscription, useGuestUsage } from './hooks/useSubscription';
import { useAuth } from './context/AuthContext';
import { UpgradeModal } from './components/UpgradeModal';

import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import UserProfilePage from './pages/UserProfilePage';
import HomePage from './pages/HomePage';
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

  const modes = {
    professional: {
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
      label: 'Marcus Stone',
      persona: 'Truthful and Straightforward',
      bio: 'Fashion critic with witty, sharp observations',
      image: MarcusStoneImage,
      color: 'indigo',
      gradient: 'from-violet-950 via-indigo-900 to-blue-950',
      glow: 'glow-muted',
      bgGradient: 'from-indigo-900/35 to-indigo-800/18',
      borderColor: 'border-blue-500',
      dotColor: 'bg-indigo-900'
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
- Remain curious about the wearer's intent before judging execution`,
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
- Prioritize how something makes them feel over how it photographs`,
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
- Ensure feedback feels personally addressed, not like a generic compliment`,
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
    if (weatherHook.useWeather && weatherHook.weather) {
      weatherContext = `

**Weather:** ${weatherHook.weather.description}, ${weatherHook.weather.temperature}°C (${weatherHook.weather.feelsLike}°C felt)
**Location:** ${weatherHook.location} | Humidity: ${weatherHook.weather.humidity}% | Wind: ${weatherHook.weather.windSpeed}mph`;
    }

    let styleContext = '';
    const { profile } = profileHook;
    if (profile.stylePreferences.length > 0 || profile.favouriteColors.length > 0 || profile.favouriteBrands.length > 0) {
      const parts = [];
      if (profile.stylePreferences.length > 0) parts.push(`Styles: ${profile.stylePreferences.join(', ')}`);
      if (profile.favouriteColors.length > 0) parts.push(`Colors: ${profile.favouriteColors.join(', ')}`);
      if (profile.favouriteBrands.length > 0) parts.push(`Brands: ${profile.favouriteBrands.join(', ')}`);
      styleContext = `\\n\\n**Profile:** ${parts.join(' | ')}`;
    }

    let calendarContext = '';
    if (profileHook.useCalendarContext && profile.calendarEvents.length > 0) {
      const upcomingEvents = getUpcomingEvents(profile.calendarEvents, 3);
      if (upcomingEvents.length > 0) {
        const eventSummary = upcomingEvents.map(e => formatEventForPrompt(e)).join(' | ');
        calendarContext = `\\n\\n**Upcoming (3d):** ${eventSummary}`;
      }
    }

    return `${basePrompt}${weatherContext}${styleContext}${calendarContext}

Rate this outfit and provide feedback. Structure your response as:

**Overall Rating: X/10**

**Social Media Summary:**
[A brief, engaging, 1-sentence summary of your opinion (max 100 chars). This will be on a polaroid photo.]

**Breakdown:**
- Style: X/10
${weatherHook.useWeather && weatherHook.weather ? '- Weather Appropriateness: X/10' : '- Versatility: X/10'}
- Occasion Fit: X/10

**What Works:**
[2-3 specific positive points]

**Suggestions:**
[2-3 specific improvements]${profile.favouriteBrands.length > 0 ? '\\n- Recommended Brands/Stores: [Suggest where to shop based on their favourite brands]' : ''}

${profile.calendarEvents.length > 0 ? '**Calendar Compatibility:**\\n[How well does this outfit work for upcoming events?]' : ''}

${weatherHook.useWeather && weatherHook.weather ? '**Weather Check:**\\n[Comment on how well this outfit matches current conditions]' : ''}

${mode === 'roast' ? '\\n**The Roast:**\\n[Your wittiest observation]' : ''}

Be specific and helpful!`;
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
        alert(`You've used your free rating this week. Sign up for more ratings! (${guestCheck.daysLeft} days until reset)`);
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
        const fullPrompt = buildPromptWithWeather();

        const response = await fetch('/api/rate-outfit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image,
            mediaType: mediaType,
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

        // Extract Social Media Summary
        const summaryMatch = ratingText.match(/\*\*Social Media Summary:\*\*\s*\n*(.+?)(?=\n\n|\*\*|$)/s);
        const summary = summaryMatch ? summaryMatch[1].trim() : "Check out my outfit rating on Style/Me!";
        setSocialSummary(summary);

        setRating(ratingText);

        // Log usage after successful rating
        if (user) {
          await subscriptionHook.logUsage('rating');
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
        onSelectPlan={(tier) => {
          // TODO: Stripe checkout integration
          console.log('Selected tier:', tier);
          setShowUpgradeModal(false);
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage
          weatherHook={weatherHook}
          profileHook={profileHook}
          subscriptionHook={subscriptionHook}
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
      </Routes>
    </>
  );
}
