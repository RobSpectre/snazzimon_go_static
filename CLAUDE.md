# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Snazzimon GO is a location-based mobile web game inspired by Pokémon GO. Players physically navigate to real-world checkpoints in New York City to encounter and capture creatures called "Snazzimons" through an AR-like video experience.

## Development Commands

### Build and Deploy
```bash
npm run dev          # Start development server (Vite)
npm run build        # TypeScript compilation + Vite build + CNAME file creation
npm run deploy       # Deploy to GitHub Pages
```

### Project Structure
```
/components/         # React components for each game screen
/hooks/             # Custom React hooks for geolocation and distance calculations
/types.ts           # TypeScript type definitions
/game-data.json     # Game configuration (checkpoints, Snazzimon data)
/public/            # Static assets (images, videos)
```

## Architecture

### Game State Machine
The app uses a finite state machine with 4 core states defined in `types.ts`:
- **FTU** (First Time User): Onboarding and geolocation permission request
- **FIND**: Main gameplay - navigate to checkpoint using compass and distance
- **CAPTURE**: Encounter screen with video playback and swipe-to-throw mechanic
- **GAME_OVER**: Completion screen after all checkpoints captured

State transitions are managed in `App.tsx` with React `useState`. Progress persists to localStorage.

### Screen Components
Each game state maps to a dedicated screen component:
- `FTUScreen.tsx` - Onboarding flow
- `FindScreen.tsx` - Navigation UI with compass, distance, hints, and Snazzidex
- `CaptureScreen.tsx` - Video-driven capture sequence with gesture controls
- `Snazzidex.tsx` - Collection viewer (accessed from FindScreen)
- `Compass.tsx` - Directional indicator using bearing calculations

### Core Hooks

**`useGeolocation.ts`**
- Manages browser geolocation API permissions and position watching
- Returns: `{ location, error, permissionState, requestPermission }`
- Automatically watches position when permission is granted
- Handles permission changes and errors

**`useHaversine.ts`**
- Calculates great-circle distance and bearing between two coordinates
- Uses haversine formula for Earth's curvature
- Returns: `{ distance, bearing }` in meters and degrees
- Memoized for performance

**`useShakeDetector.ts`**
- Detects device shake gestures via accelerometer (currently unused but available)

### Data Flow

1. **Game Configuration**: `game-data.json` defines all Snazzimons and checkpoints
   - Each checkpoint links to a Snazzimon ID and specifies coordinates, capture threshold, success probability, and hints
   - Video assets are organized by Snazzimon ID with states: intro, reveal, idle, success, fail, outro

2. **Proximity Detection**:
   - `App.tsx` monitors distance from `useHaversine` hook
   - When player enters `captureThreshold` radius, triggers CAPTURE state transition
   - Haptic feedback via `navigator.vibrate()` on encounter

3. **Capture Mechanics**:
   - Video state machine transitions through: intro → reveal → idle
   - Player flicks upward to throw SnazziBall (touch gesture detection)
   - Success determined by checkpoint's `successProbability`
   - Success/fail video plays, then transitions to next checkpoint or game over

4. **Progress Persistence**:
   - `localStorage` saves: current checkpoint index, captured Snazzimons
   - Loaded on mount to resume progress
   - FTU state not saved until user completes onboarding

## Key Implementation Details

### Geolocation Permission Handling
Permission state is tracked separately from location data. The app gracefully handles:
- Browser doesn't support geolocation
- User denies permission
- Permission revoked mid-session
- GPS signal loss

### Video Playback
Videos must autoplay on mobile browsers, which requires:
- `playsInline` attribute
- `muted` attribute (often required for autoplay)
- Manual `video.load()` and `video.play()` on state changes

### Deployment
GitHub Pages deployment requires:
- `base` config in `vite.config.ts` for asset paths
- CNAME file creation in build script for custom domain
- `gh-pages` package for deployment

## Game Configuration

### Adding a New Snazzimon
1. Add video assets to `/public/video/` (following naming convention: `{id}_intro.mp4`, etc.)
2. Add entry to `game-data.json` "snazzimons" array with unique ID
3. Create a corresponding checkpoint in "checkpoints" array

### Modifying Checkpoints
Each checkpoint requires:
- `coordinates`: GPS location (latitude/longitude)
- `captureThreshold`: Radius in meters for encounter trigger
- `successProbability`: 0.0-1.0 catch rate
- `hints`: Array of progressive hints (revealed on cooldown)
- `hintCooldown`: Minutes between hint reveals

## Common Development Patterns

### Adding a New Game State
1. Add enum value to `GameState` in `types.ts`
2. Create corresponding screen component
3. Add case to `renderGameState()` switch in `App.tsx`
4. Define transition logic and state handlers

### Working with Location Data
Always check for null before using location data from `useGeolocation`:
```typescript
const { location, error } = useGeolocation();
if (!location) {
  // Handle loading/error state
}
```

### Video State Management
Video playback state should be managed via `useState` and `useEffect` hooks that call `video.load()` and `video.play()` when the video source changes. Use `onEnded` event to trigger state transitions.

### URL-Based Checkpoint Navigation
The app supports jumping to specific checkpoints via URL:
- Hash-based: `https://snazzimongo.com/#/id/1` (checkpoint 1, FIND state)
- Path-based: `https://snazzimongo.com/id/2` (checkpoint 2, FIND state)
- Direct capture: `https://snazzimongo.com/id/1/capture` (checkpoint 1, CAPTURE state)

The checkpoint ID in the URL is 1-based (matching checkpoint IDs in game-data.json).
After parsing the URL, the app:
1. Sets the checkpoint index (ID - 1)
2. Transitions to FIND state (or CAPTURE state if `/capture` suffix is present)
3. Clears the URL to prevent re-triggering
4. Resets encounter states

This is useful for:
- Testing specific checkpoints during development
- Sharing direct links to checkpoints
- Debugging location-based features
- Testing capture sequences without needing to be at the physical location (`/id/#/capture`)
