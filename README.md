# AI Restaurant Decision Helper

A web application that helps indecisive users choose a restaurant through a simple, AI-guided questionnaire.

## Features

- **Conversational Flow**: 4-question questionnaire that feels natural and friendly
- **AI-Powered Recommendations**: Uses Anthropic API to generate personalized restaurant suggestions
- **Detailed Results**: Shows restaurant name, cuisine type, price range, ratings, and why it's a match
- **Alternative Suggestions**: Get another recommendation if you don't like the first one
- **Mobile Responsive**: Works great on desktop and mobile devices
- **Warm Design**: Friendly aesthetic with smooth transitions

## Questions Covered

1. **Cuisine Preference**: Italian, Asian, Mexican, American, Healthy, or Surprise me
2. **Budget Level**: $ (Budget-friendly), $$ (Moderate), $$$ (Upscale)
3. **Distance**: Nearby, Willing to drive, Worth the trip
4. **Dining Occasion**: Quick bite, Date night, Family dinner, Solo dining, Friends hangout

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

Run both the frontend and backend in separate terminals:

```bash
# Terminal 1: Start the API server
npm run server

# Terminal 2: Start the Vite dev server
npm run dev
```

The frontend will be available at `http://localhost:5173` and will proxy API requests to the backend at `http://localhost:3001`.

### Production

```bash
# Build the frontend
npm run build

# Start the production server
NODE_ENV=production npm start
```

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Express.js
- **AI**: Anthropic API (Claude)
- **Styling**: CSS with custom properties

## Project Structure

```
src/
  components/
    LandingPage.jsx     # Welcome page with value proposition
    Questionnaire.jsx   # 4-question flow with progress indicator
    Recommendation.jsx  # Results display with restaurant details
  App.jsx              # Main app with state management
  App.css              # Global styles and CSS variables
server.js              # Express API server with Anthropic integration
```
