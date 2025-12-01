# Plugin Architecture

This document explains how the plugin system works and the two types of plugins.

## Two Types of Plugins

### 1. **Local/Computed Plugins** 🔄

Plugins that compute data locally without network calls.

**Examples:**
- **Clock** - Gets current time with `new Date()`
- **Countdown** - Calculates time difference
- **System Info** - Reads browser/device info
- **Static Text** - Just returns a string

**Characteristics:**
- ✅ **Fast** - No network latency
- ✅ **Reliable** - No API failures
- ✅ **Frequent updates** - Can update every second
- ✅ **No caching needed** - Always compute fresh

**Implementation:**
Uses `setInterval` for re-computation. Each render calls the plugin's `fetch()` function.

```typescript
// Clock plugin - runs every 1000ms
export const ClockPlugin: LEDPlugin = {
    id: 'clock',
    defaultInterval: 1000, // Update every second
    fetch: async ({ format }) => {
        const now = new Date();
        return formatTime(now, format);
    }
};
```

### 2. **Remote/API Plugins** 🌐

Plugins that fetch data from external APIs.

**Examples:**
- **Weather** - Fetches from Open-Meteo API
- **Crypto** - Fetches from CoinGecko API
- **Stocks** - Fetches from Finnhub API
- **Sports** - Fetches from ESPN API
- **Reddit** - Fetches from Reddit JSON API

**Characteristics:**
- ⚠️ **Slower** - Network latency
- ⚠️ **Can fail** - API errors, rate limits
- ⚠️ **Less frequent** - Update every 1-10 minutes
- ✅ **Needs caching** - Avoid redundant calls

**Implementation:**
Uses SWR for caching, deduplication, and error handling.

```typescript
// Weather plugin - runs every 10 minutes
export const WeatherPlugin: LEDPlugin = {
    id: 'weather',
    defaultInterval: 600000, // Update every 10 minutes
    fetch: async ({ zipCode }) => {
        const response = await fetch(weatherAPI);
        const data = await response.json();
        return formatWeather(data);
    }
};
```

## How It Works

### Data Flow

```
┌─────────────────────────────────────────────────────┐
│ useDataHydration                                    │
│ (in app/page.tsx)                                  │
└────────────────┬───────────────────────────────────┘
                 │
                 │ For each row...
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ usePluginData                                       │
│ (decides: local or remote?)                        │
└────────┬─────────────────────────┬──────────────────┘
         │                         │
         │ LOCAL                   │ REMOTE
         ▼                         ▼
┌─────────────────┐      ┌─────────────────────────┐
│ useLocalPlugin  │      │ useSWR                  │
│                 │      │                         │
│ setInterval(    │      │ - Caching               │
│   fetch(),      │      │ - Deduplication         │
│   1000ms        │      │ - Error handling        │
│ )               │      │ - Revalidation          │
└─────────────────┘      └─────────────────────────┘
         │                         │
         │                         │
         └────────┬────────────────┘
                  │
                  ▼
           ┌──────────────┐
           │ Display Text │
           └──────────────┘
```

### Local Plugin Flow (Clock)

1. Component mounts
2. `useLocalPlugin` is called
3. Immediately runs `plugin.fetch()` → "12:45:30 PM"
4. Sets up `setInterval(fetch, 1000)`
5. Every second: Re-runs `plugin.fetch()` → "12:45:31 PM"
6. State updates → Display updates
7. Component unmounts → `clearInterval()`

**No caching, no network, just pure re-computation.**

### Remote Plugin Flow (Weather)

1. Component mounts
2. `useSWR` is called with cache key `"plugin:weather:{zipCode:10001}"`
3. Check SWR cache → **Cache miss**
4. Run `pluginFetcher()` → Makes API call
5. Display "Loading..." while waiting
6. API returns → "72°F Sunny in New York!"
7. Store in SWR cache
8. After 10 minutes → Revalidate (fetch again)
9. On second mount → **Cache hit** → Instant display, no API call

**Smart caching prevents redundant API calls.**

## Update Intervals

### Configuration

Users can configure update intervals per row:

```typescript
{
    pluginId: 'clock',
    refreshInterval: 1000,  // Update every second
    // ...
}
```

### What It Means

- **Local plugins**: How often to re-compute and update display
- **Remote plugins**: How often to fetch fresh data from API

### Recommended Values

| Plugin Type | Interval | Reason |
|-------------|----------|--------|
| Clock | 1000ms (1s) | Show seconds ticking |
| Countdown | 1000ms | Show seconds counting |
| Weather | 600000ms (10m) | Doesn't change often |
| Crypto | 60000ms (1m) | Prices update frequently |
| Stocks | 60000ms | Market updates |
| Sports | 120000ms (2m) | Live game scores |
| Reddit | 300000ms (5m) | New posts |
| Jokes | 3600000ms (1h) | Static content |

## Adding New Plugins

### Local Plugin Example

```typescript
// plugins/mylocal.ts
export const MyLocalPlugin: LEDPlugin = {
    id: 'mylocal',
    name: 'My Local Plugin',
    defaultInterval: 1000, // Update every second
    
    fetch: async () => {
        // Fast, synchronous computation
        return `Count: ${Math.floor(Date.now() / 1000)}`;
    }
};
```

Then add to `LOCAL_PLUGINS` set:

```typescript
// hooks/usePluginData.ts
const LOCAL_PLUGINS = new Set([
    'clock', 
    'countdown', 
    'system', 
    'text',
    'mylocal' // <-- Add here
]);
```

### Remote Plugin Example

```typescript
// plugins/myapi.ts
export const MyAPIPlugin: LEDPlugin = {
    id: 'myapi',
    name: 'My API Plugin',
    defaultInterval: 60000, // Fetch every minute
    
    fetch: async ({ apiKey }) => {
        const response = await fetch(`https://api.example.com/data?key=${apiKey}`);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        return `Result: ${data.value}`;
    }
};
```

No need to add to `LOCAL_PLUGINS` - it will automatically use SWR.

## Benefits

### Performance
- ✅ Local plugins update smoothly (no network wait)
- ✅ Remote plugins cached (no redundant API calls)
- ✅ Multiple instances share same SWR cache

### User Experience
- ✅ Clock ticks every second (smooth)
- ✅ Weather fetched once, shown on all rows
- ✅ No spinner flashing when data is cached

### Developer Experience
- ✅ Simple: Just write a `fetch()` function
- ✅ Framework handles caching automatically
- ✅ Easy to add new plugins

## Debugging

### Check if plugin is local or remote

```typescript
import { LOCAL_PLUGINS } from '@/hooks/usePluginData';

const isLocal = LOCAL_PLUGINS.has('clock'); // true
const isRemote = !LOCAL_PLUGINS.has('weather'); // true (not in set)
```

### Watch updates

```typescript
// Local plugin - logs every second
useEffect(() => {
    console.log('Clock updated:', clockValue);
}, [clockValue]);

// Remote plugin - logs on cache updates
useEffect(() => {
    console.log('Weather fetched:', weatherValue);
}, [weatherValue]);
```

### Performance

Open React DevTools Profiler to see:
- Local plugins: Frequent renders (every second)
- Remote plugins: Infrequent renders (every minute)

## Future Improvements

- [ ] Allow plugins to declare themselves as local/remote
- [ ] Add `isLocal: boolean` to plugin interface
- [ ] Automatically detect based on `fetch()` signature
- [ ] Support plugins that are both (local computation with occasional API sync)



