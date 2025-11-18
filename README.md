# Style / Me

AI-powered outfit rating app using Claude 4.

## Deploy to Vercel

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variable:
   - `ANTHROPIC_API_KEY` = your API key
4. Deploy!

## Deploy to Netlify

1. Push to GitHub
2. Import project on [netlify.com](https://netlify.com)
3. Add environment variable:
   - `ANTHROPIC_API_KEY` = your API key
4. Deploy!

## Local Development
```bash
# Install Vercel CLI
npm i -g vercel

# Run locally (will prompt for API key)
vercel dev
```

## Get API Key

Get your Anthropic API key at: https://console.anthropic.com/
```

---

## 🚀 Deployment Steps

### **Option 1: Vercel (Recommended)**

1. **Create folder structure:**
```
   outfit-rater/
   ├── api/
   │   └── rate-outfit.js
   ├── src/
   │   └── App.jsx (use the artifact above)
   ├── .gitignore
   └── README.md
