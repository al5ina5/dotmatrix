# Free API Keys Guide

This app uses several free, open APIs. Some require API keys (all free!).

## 📊 Stock Data - Finnhub

**Why:** Yahoo Finance blocks browser requests (CORS issues)  
**Alternative:** Finnhub - Free tier with 60 calls/minute

### How to Get API Key (Free):
1. Go to https://finnhub.io
2. Click "Get Free API Key"
3. Sign up with email (instant approval)
4. Copy your API key
5. Paste in Stock plugin settings

**Free Tier:**
- ✅ 60 API calls/minute
- ✅ Real-time US stock prices
- ✅ No credit card required
- ✅ CORS-enabled for browser apps

**Alternatives:**
- **Alpha Vantage** (alphavantage.co) - 5 calls/minute free
- **Twelve Data** (twelvedata.com) - 800 calls/day free
- **IEX Cloud** (iexcloud.io) - Free sandbox tier

---

## 🎬 Movies - TMDB

**Why:** Display upcoming movies  
**API:** The Movie Database (TMDB)

### How to Get API Key (Free):
1. Go to https://www.themoviedb.org
2. Create free account
3. Go to Settings → API
4. Click "Request an API Key"
5. Choose "Developer" option
6. Fill out simple form (instant approval)
7. Copy your **API Key (v3 auth)**
8. Paste in Movies plugin settings

**Free Tier:**
- ✅ Unlimited requests
- ✅ Access to all movie data
- ✅ No credit card required
- ✅ CORS-enabled

---

## ✅ APIs That Don't Need Keys

These work out-of-the-box:

### 💰 Crypto - CoinGecko
- Free public API
- No key required
- CORS-enabled
- 50 calls/minute

### 🌤️ Weather
- Uses Open-Meteo (no key)
- Uses Zippopotam for geocoding (no key)
- Both are free and CORS-enabled

### 🏀 Sports - ESPN
- Public scoreboard API
- No key required
- CORS-enabled
- Real-time scores

### 📰 Reddit
- Public JSON API
- No authentication needed
- Just add `.json` to any Reddit URL

### 🌍 ISS Tracker
- Open Notify API
- Free, no key required

### 🎉 Holidays
- Abstract API (free tier)
- Works without key for basic usage

### 📚 Word of the Day
- Random Word API + Dictionary API
- Both free, no keys

### 🌅 Sunrise/Sunset
- sunrise-sunset.org API
- Free, no key required

### 😂 Jokes & Facts
- Public joke/fact APIs
- No authentication needed

---

## 🚀 Quick Setup Checklist

For full functionality:

1. [ ] **Finnhub API Key** (stocks) - Takes 30 seconds
2. [ ] **TMDB API Key** (movies) - Takes 2 minutes

That's it! Everything else works without keys.

---

## 💡 Pro Tips

### Rate Limiting
- Free tiers have rate limits
- App automatically handles retries
- Increase `refreshInterval` in plugin settings if you hit limits

### API Key Security
- Keys are stored in browser localStorage only
- Not transmitted anywhere except to the API provider
- You can export/import configs to share (keys included)

### Testing APIs
Use the browser console to test API calls:

```javascript
// Test Finnhub
fetch('https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_KEY')
  .then(r => r.json())
  .then(console.log);

// Test TMDB
fetch('https://api.themoviedb.org/3/movie/upcoming?api_key=YOUR_KEY')
  .then(r => r.json())
  .then(console.log);
```

---

## 🔒 Privacy & Security

All API calls are made directly from your browser to the API providers:
- ✅ No data passes through any server
- ✅ Your API keys stay in your browser
- ✅ Fully client-side application
- ✅ Open source - inspect the code!

---

## ❓ Troubleshooting

**"Invalid API Key" error:**
- Check you copied the full key (no spaces)
- Make sure you're using the right key type (v3 for TMDB)
- Verify key is activated (some need email confirmation)

**"Rate Limit" error:**
- You've hit the free tier limit
- Wait a minute and try again
- Increase `refreshInterval` to reduce calls

**"CORS Error":**
- This shouldn't happen with recommended APIs
- If it does, the API may have changed their CORS policy
- Report as an issue on GitHub

---

## 🆕 Want to Add More APIs?

All plugins support configuration! You can add:
- Custom API endpoints
- Your own API keys
- Different data sources

See `plugins/customapi.ts` for a template to create your own plugins.

