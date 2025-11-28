import React, { useState, useRef } from 'react';
import { Heart, Calendar, Info } from 'lucide-react';
import { getUpcomingEvents, formatEventForPrompt } from './calendarIntegration';
import { useWeather } from './hooks/useWeather';
import { useStyleProfile } from './hooks/useStyleProfile';
import { useCalendar } from './hooks/useCalendar';
import { WeatherSection } from './components/WeatherSection';
import { ModeSelector } from './components/ModeSelector';
import { PhotoUpload } from './components/PhotoUpload';
import { RatingDisplay } from './components/RatingDisplay';
import { FlipContainer } from './components/FlipContainer';
import { StyleProfileModal } from './components/StyleProfileModal';
import { CalendarModal } from './components/CalendarModal';
import { HelpModal } from './components/HelpModal';
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
  const [detailedMode, setDetailedMode] = useState(false); // Toggle for detailed vs concise feedback
  const ratingRef = useRef(null);
  const [isFlippedToRating, setIsFlippedToRating] = useState(false); // Manual flip control

  // Custom hooks
  const weatherHook = useWeather();
  const styleProfileHook = useStyleProfile();
  const calendarHook = useCalendar();

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
    if (styleProfileHook.styleProfile.preferences.length > 0 || styleProfileHook.styleProfile.colors.length > 0 || styleProfileHook.styleProfile.brands.length > 0) {
      const parts = [];
      if (styleProfileHook.styleProfile.preferences.length > 0) parts.push(`Styles: ${styleProfileHook.styleProfile.preferences.join(', ')}`);
      if (styleProfileHook.styleProfile.colors.length > 0) parts.push(`Colors: ${styleProfileHook.styleProfile.colors.join(', ')}`);
      if (styleProfileHook.styleProfile.brands.length > 0) parts.push(`Brands: ${styleProfileHook.styleProfile.brands.join(', ')}`);
      styleContext = `\\n\\n**Profile:** ${parts.join(' | ')}`;
    }

    let calendarContext = '';
    if (calendarHook.useCalendarContext && calendarHook.calendarEvents.length > 0) {
      const upcomingEvents = getUpcomingEvents(calendarHook.calendarEvents, 3);
      if (upcomingEvents.length > 0) {
        const eventSummary = upcomingEvents.map(e => formatEventForPrompt(e)).join(' | ');
        calendarContext = `\\n\\n**Upcoming (3d):** ${eventSummary}`;
      }
    }

    // Detailed vs Concise prompt structure
    if (detailedMode) {
      // Detailed format - comprehensive feedback
      return `${basePrompt}${weatherContext}${styleContext}${calendarContext}

Rate this outfit and provide detailed feedback. Structure your response as:

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
[2-3 specific improvements]${styleProfileHook.styleProfile.brands.length > 0 ? '\n- Recommended Brands/Stores: [Suggest where to shop based on their favourite brands]' : ''}

${calendarHook.calendarEvents.length > 0 ? '**Calendar Compatibility:**\n[How well does this outfit work for upcoming events?]' : ''}

${weatherHook.useWeather && weatherHook.weather ? '**Weather Check:**\n[Comment on how well this outfit matches current conditions]' : ''}

${mode === 'roast' ? '\n**The Roast:**\n[Your wittiest observation]' : ''}

Be specific and helpful!`;
    } else {
      // Concise format - quick TikTok-style
      return `${basePrompt}${weatherContext}${styleContext}${calendarContext}

Give a quick, concise outfit rating in modern social media style. Keep it under 100 words total.

**Overall Rating: X/10**

**Social Media Summary:**
[One punchy sentence, max 100 chars - this goes on the polaroid share card]

**Quick Take:**
[1-2 sentences capturing your honest perspective on this outfit${weatherHook.useWeather && weatherHook.weather ? ' considering the weather' : ''}${calendarHook.calendarEvents.length > 0 ? ' and upcoming events' : ''}]

**Highlight:**
[One specific thing that's working really well]

**Improve:**
[One clear, actionable suggestion${styleProfileHook.styleProfile.brands.length > 0 ? ', with a brand/store recommendation if relevant' : ''}]

${mode === 'roast' ? '\n**Roast:**\n[Your wittiest one-liner]\n' : ''}Be direct, specific, and TikTok-ready.`;
    }
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

    setLoading(true);
    setRating(null);

    // Shorter loading messages for streaming
    const messages = [
      'Starting analysis...',
      'AI thinking...',
      'Almost there...'
    ];

    let messageIndex = 0;
    setLoadingMessage(messages[0]);

    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 1500);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        // Detect media type from the data URL
        const mediaType = reader.result.split(';')[0].split(':')[1];
        console.log('Detected mediaType:', mediaType);
        const base64Image = reader.result.split(',')[1];
        const fullPrompt = buildPromptWithWeather();

        // Make POST request to initiate streaming
        const response = await fetch('/api/rate-outfit-stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image,
            mediaType: mediaType,
            mode: mode,
            prompt: fullPrompt,
            detailedMode: detailedMode // Pass detailed mode flag to API
          })
        });

        if (!response.ok) {
          throw new Error('Failed to start streaming');
        }

        // Clear loading after connection established
        clearInterval(messageInterval);
        setLoading(false);
        setRating(''); // Start with empty rating
        setSocialSummary('');
        setIsFlippedToRating(true); // Flip to show rating

        // Read the stream
        const reader2 = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';

        try {
          while (true) {
            const { done, value } = await reader2.read();

            if (done) {
              console.log('Stream complete');
              break;
            }

            // Decode the chunk
            buffer += decoder.decode(value, { stream: true });

            // Process complete SSE messages
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);

                if (data === '[DONE]') {
                  console.log('Stream ended');

                  // Extract Social Media Summary from complete text
                  const summaryMatch = fullText.match(/\*\*Social Media Summary:\*\*\s*\n*(.+?)(?=\n\n|\*\*|$)/s);
                  const summary = summaryMatch ? summaryMatch[1].trim() : "Check out my outfit rating on Style/Me!";
                  setSocialSummary(summary);
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);

                  if (parsed.type === 'text' && parsed.content) {
                    fullText += parsed.content;
                    setRating(fullText);
                  }

                  if (parsed.type === 'error') {
                    throw new Error(parsed.error || 'Streaming error');
                  }
                } catch (parseError) {
                  console.error('Error parsing stream data:', parseError);
                }
              }
            }
          }
        } catch (streamError) {
          console.error('Stream reading error:', streamError);
          throw streamError;
        }
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
            <div className="relative">
              <h1 className="text-7xl sm:text-9xl lg:text-[12rem] font-black mb-6 relative leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-slate-200 via-white to-slate-200 bg-clip-text text-transparent block drop-shadow-2xl">
                  <span className="text-amber-50">Style /</span>
                  <span className="text-orange-700">Me</span>
                </span>
              </h1>
              {/* Help Button */}
              <button
                onClick={() => setShowHelpModal(true)}
                className="absolute top-4 right-4 sm:right-8 lg:right-16 p-3 bg-slate-800/60 hover:bg-slate-700/80 text-white rounded-full transition-all hover:scale-110 hover:shadow-xl border border-slate-600/50 group"
                title="How to use Style/Me"
              >
                <Info className="w-6 h-6 group-hover:text-orange-400 transition-colors" />
              </button>
            </div>
            <p className="text-white/85 text-base sm:text-lg lg:text-2xl max-w-3xl mx-auto font-light tracking-wide mb-8 leading-relaxed">
              AI-powered fashion feedback {weatherHook.useWeather && 'with real-time weather context'}, style preferences, and calendar integration.
            </p>

            {/* Style Profile Button */}
            <button
              onClick={() => styleProfileHook.setShowStyleModal(true)}
              className="mt-8 min-w-56 px-6 py-3 bg-gradient-to-r from-slate-900 to-orange-950 text-amber-50 rounded-2xl font-semibold text-sm sm:text-base hover:shadow-2xl transition-all hover:scale-105 flex justify-center items-center gap-5 mx-auto"
            >
              <Heart className="w-5 h-5" />
              <span>My Style Profile</span>
            </button>

            {/* Calendar Button */}
            <button
              onClick={() => calendarHook.setShowCalendarModal(true)}
              className="mt-4 min-w-56 px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-amber-50 rounded-2xl font-semibold text-sm sm:text-base hover:shadow-2xl transition-all hover:scale-105 flex justify-center items-center gap-2 mx-auto"
            >
              <Calendar className="w-5 h-5" />
              <span>My Calendar</span>
              {calendarHook.calendarEvents.length > 0 && <span className="text-xs bg-white/30 px-2 py-1 rounded-full">{calendarHook.calendarEvents.length} events</span>}
            </button>
          </div>

          {/* Weather Section */}
          <WeatherSection {...weatherHook} />

          {/* Mode Selector */}
          <ModeSelector mode={mode} setMode={setMode} modes={modes} setRating={setRating} />

          {/* Flip Container for Upload & Rating */}
          <FlipContainer
            isFlipped={isFlippedToRating && !!rating}
            frontContent={
              <PhotoUpload
                photo={photo}
                photoPreview={photoPreview}
                handleFileUpload={handleFileUpload}
                clearPhoto={clearPhoto}
                getRating={getRating}
                loading={loading}
                loadingMessage={loadingMessage}
                currentMode={currentMode}
                detailedMode={detailedMode}
                setDetailedMode={setDetailedMode}
                hasRating={!!rating}
                onViewRating={() => setIsFlippedToRating(true)}
              />
            }
            backContent={
              <RatingDisplay
                rating={rating}
                socialSummary={socialSummary}
                currentMode={currentMode}
                mode={mode}
                useWeather={weatherHook.useWeather}
                weather={weatherHook.weather}
                photoPreview={photoPreview}
                onViewPhoto={() => setIsFlippedToRating(false)}
                onRateAnother={() => {
                  setRating(null);
                  setPhoto(null);
                  setPhotoPreview(null);
                  setIsFlippedToRating(false);
                }}
              />
            }
          />
        </div>
      </div>

      {/* Style Profile Modal */}
      <StyleProfileModal {...styleProfileHook} />

      {/* Calendar Modal */}
      <CalendarModal {...calendarHook} />

      {/* Help Modal */}
      <HelpModal showHelpModal={showHelpModal} setShowHelpModal={setShowHelpModal} />
    </div>
  );
}
