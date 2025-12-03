# PWA Setup Guide

Your DotMatrix LED Ticker is now a Progressive Web App! 🎉

## Features

✅ **Fullscreen Mode** - No browser chrome, just your LED display  
✅ **Install to Home Screen** - Works like a native app  
✅ **Offline Support** - Cached for offline access  
✅ **Dynamic Viewport** - Uses `dvh` for proper mobile display  
✅ **No Scrollbars** - Clean fullscreen experience

## Installation

### On Mobile (iOS/Android)

1. **Open in Safari (iOS) or Chrome (Android)**
   - Visit your deployed URL: `https://your-app.vercel.app`

2. **Add to Home Screen**
   - **iOS**: Tap Share → "Add to Home Screen"
   - **Android**: Tap ⋮ → "Install app" or "Add to Home Screen"

3. **Open the App**
   - Tap the icon on your home screen
   - App opens in fullscreen mode!

### On Desktop (Chrome/Edge)

1. **Visit the URL**
   - A "Install" button appears in the address bar

2. **Click Install**
   - App installs as a desktop application

3. **Launch**
   - Opens in its own window, no browser UI

## Generating Icons

The app needs icons for installation. Run:

```bash
# Install dependencies
npm install sharp

# Generate icons
node scripts/generate-icons.js
```

This creates:
- `icon-192.png` - Standard app icon
- `icon-512.png` - High-res app icon

### Custom Icons

Replace the generated icons with your own:
- Place `icon-192.png` and `icon-512.png` in `/public/`
- Recommended: Use a simple LED matrix design with black background
- Format: PNG with transparency (will show on black)

## Fullscreen Features

### Dynamic Viewport Height (`dvh`)

The app uses `100dvh` instead of `100vh`:
- ✅ Accounts for mobile browser UI
- ✅ Adjusts when browser chrome hides/shows
- ✅ Always fills the actual visible area

### Hidden UI Elements

- ✅ No scrollbars
- ✅ No text selection
- ✅ No pull-to-refresh
- ✅ Fixed positioning prevents unwanted scrolling

## Manifest Configuration

Edit `/public/manifest.json` to customize:

```json
{
  "name": "Your Custom Name",
  "short_name": "Short",
  "theme_color": "#00ff00",
  "background_color": "#000000",
  "display": "fullscreen"
}
```

### Display Modes

- `fullscreen` - True fullscreen (current)
- `standalone` - App-like (with status bar)
- `minimal-ui` - Minimal browser UI
- `browser` - Regular browser

## Service Worker

The service worker (`/public/sw.js`) provides:
- ✅ Offline caching
- ✅ Network-first strategy
- ✅ Automatic cache updates

### Cache Management

To clear cache and update:

```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
});
caches.keys().then(names => names.forEach(name => caches.delete(name)));
```

## Testing PWA

### Chrome DevTools

1. Open DevTools (F12)
2. Go to "Application" tab
3. Check:
   - **Manifest** - Should show all fields
   - **Service Workers** - Should show registered worker
   - **Cache Storage** - Should show cached files

### Lighthouse

1. Open DevTools → Lighthouse
2. Run "Progressive Web App" audit
3. Should score 100/100

## Deployment

### Vercel (Recommended)

```bash
# Deploy
vercel

# PWA works automatically!
# No special configuration needed
```

### Other Platforms

Ensure your hosting:
- ✅ Serves over HTTPS (required for service workers)
- ✅ Serves `/manifest.json` with correct MIME type
- ✅ Serves `/sw.js` with correct headers
- ✅ Doesn't cache `sw.js` aggressively

## Common Issues

### "Add to Home Screen" not showing

- ✅ Must be HTTPS (or localhost for testing)
- ✅ Must have valid manifest.json
- ✅ Must have icons
- ✅ Some browsers don't show it immediately

### App not fullscreen

- Check `display: "fullscreen"` in manifest.json
- iOS sometimes needs Safari-specific meta tags (already added)
- Try uninstalling and reinstalling

### Service Worker not updating

```bash
# Increment cache version in sw.js
const CACHE_NAME = 'dotmatrix-v2'; // Increment version
```

### Icons not showing

- Check icons exist: `/public/icon-192.png`, `/public/icon-512.png`
- Check icon sizes are correct (192x192, 512x512)
- Try hard refresh: Ctrl+Shift+R

## iOS Specific

iOS has extra requirements:

```html
<!-- Already added in layout.tsx -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/icon-192.png">
```

### iOS Status Bar

- `black-translucent` - Full bleed, status bar overlays content
- `black` - Black status bar
- `default` - White status bar

## Advanced: Auto-Fullscreen

Add a button to request fullscreen programmatically:

```typescript
const goFullscreen = () => {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  }
};
```

## Monitoring

Check PWA installation stats:

```javascript
// Track installations
window.addEventListener('appinstalled', () => {
  // Log to analytics
  console.log('PWA installed!');
});
```

## Resources

- [PWA Builder](https://www.pwabuilder.com/) - Test your PWA
- [Web.dev PWA](https://web.dev/progressive-web-apps/) - Best practices
- [MDN Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) - Documentation

---

**Your LED ticker is now installable! 🎉**

Share the URL and users can install it like a native app.






