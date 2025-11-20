# Style / Me 👔✨

AI-powered fashion advisor with real-time weather integration, personalized style profiles, and calendar-aware outfit recommendations.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![React](https://img.shields.io/badge/React-19.2.0-61dafb)
![Claude](https://img.shields.io/badge/Claude-Haiku%203.5-orange)

---

## 🌟 Features

### 🤖 AI Fashion Advisors
Choose from 4 distinct AI personalities, each with unique perspectives:

- **Alexandra Ashford** - Museum curator analyzing fashion through cultural theory
- **Margot Leclerc** - Parisian consultant offering refined, elegant advice
- **Kai Chen** - Fashion journalist celebrating bold self-expression
- **Marcus Stone** - Witty critic with sharp, entertaining observations

### 🌤️ Weather Integration
- Real-time weather data from OpenWeatherMap API
- Location autocomplete with city search
- Weather-aware outfit recommendations
- Toggle weather context on/off

### 💖 Style Profile
- Save personal style preferences
- Track favorite colors and brands
- Persistent localStorage storage
- Personalized recommendations based on your profile

### 📅 Calendar Integration
- Import .ics calendar files (Google Calendar, Outlook, Apple Calendar)
- Event-aware outfit suggestions
- See upcoming events in context
- Smart recommendations for specific occasions

### 🎨 Modern UI/UX
- Glassmorphism design with smooth animations
- Fully responsive (mobile, tablet, desktop)
- Dark mode gradient backgrounds
- Interactive persona cards with images

---

## 🏗️ Architecture

### Modular Component Structure
```
src/
├── App.jsx                    # Main orchestration (500 lines)
├── components/                # Reusable UI components
│   ├── WeatherSection.jsx
│   ├── ModeSelector.jsx
│   ├── PhotoUpload.jsx
│   ├── RatingDisplay.jsx
│   ├── StyleProfileModal.jsx
│   └── CalendarModal.jsx
├── hooks/                     # Custom React hooks
│   ├── useWeather.js         # Weather state & API calls
│   ├── useStyleProfile.js    # Style profile with localStorage
│   └── useCalendar.js        # Calendar events management
├── calendarIntegration.js    # ICS file parsing utilities
└── index.css                 # Global styles & animations

api/
├── rate-outfit.js            # Anthropic Claude API integration
├── weather.js                # OpenWeather API proxy
├── weather-suggestions.js    # Location autocomplete API
├── middleware/
│   └── cors.js               # Shared CORS configuration
└── config/
    └── constants.js          # API configuration constants
```

### Tech Stack
- **Frontend**: React 19, Vite, TailwindCSS 4
- **Backend**: Express.js serverless functions
- **AI**: Anthropic Claude Haiku 3.5
- **APIs**: OpenWeatherMap (weather & geocoding)
- **Icons**: Lucide React
- **Markdown**: React-Markdown

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Anthropic API key ([Get one here](https://console.anthropic.com/))
- OpenWeatherMap API key ([Get one here](https://openweathermap.org/api))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/akp-110/outfit-rater.git
cd outfit-rater
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

3. **Add Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add:
     - `ANTHROPIC_API_KEY`
     - `OPENWEATHER_API_KEY`

4. **Deploy!**
   - Vercel will auto-deploy on every push to `main`

### Deploy to Netlify

1. **Push to GitHub** (same as above)

2. **Import to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Add Environment Variables**
   - In Netlify dashboard → Site settings → Environment variables
   - Add both API keys

5. **Deploy!**

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server (Vite)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm start        # Start Express server (for API routes)
```

### Project Structure

- **`/api`** - Serverless API functions (Express handlers)
- **`/src`** - React application source code
- **`/public`** - Static assets
- **`/dist`** - Production build output (generated)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Claude API key for AI outfit ratings | Yes |
| `OPENWEATHER_API_KEY` | OpenWeather API key for weather data | Yes |

---

## 🎯 Usage

1. **Select an Advisor** - Choose your preferred AI fashion personality
2. **Set Location** (optional) - Enable weather-aware recommendations
3. **Upload Photo** - Take or upload a photo of your outfit
4. **Get Rating** - Receive detailed feedback and suggestions
5. **Customize Profile** - Add style preferences, colors, and brands
6. **Import Calendar** - Upload .ics file for event-aware advice

---

## � Security

- ✅ API keys stored server-side only (never exposed to client)
- ✅ `.env` file properly gitignored
- ✅ CORS configured for API endpoints
- ✅ Input validation on API routes
- ✅ No sensitive data in git history

For detailed security audit, see [security_audit.md](/.gemini/antigravity/brain/6cb094fa-4013-4220-aeb5-6d9bb19271bf/security_audit.md)

---

## 📊 Performance

- **Bundle Size**: 365 KB (114 KB gzipped)
- **Build Time**: ~1 second
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgments

- **Anthropic** - Claude AI API
- **OpenWeatherMap** - Weather data API
- **Lucide** - Beautiful icon library
- **TailwindCSS** - Utility-first CSS framework

---

## 📧 Contact

Project Link: [https://github.com/akp-110/outfit-rater](https://github.com/akp-110/outfit-rater)

---

## 🗺️ Roadmap

- [ ] Add more AI advisor personalities
- [ ] Implement outfit history tracking
- [ ] Add social sharing features
- [ ] Create mobile app (React Native)
- [ ] Multi-language support
- [ ] Integration with fashion e-commerce APIs

---

**Made with ❤️ and AI**
