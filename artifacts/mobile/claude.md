# Jaggery Market Predictor

## Tech Stack
- Expo Router
- React Native
- TypeScript
- AsyncStorage
- Feather Icons
- Expo Haptics
- React hooks
- OpenAI-compatible AI APIs
- Local AI support via Ollama / LM Studio / custom endpoints

## Core Features
- Live market snapshot dashboard
- Seasonal jaggery pricing model
- Manual daily price input
- Remote live URL data source
- Dataset URL fallback for CSV/JSON imports
- Product-specific pricing tracking
- Historical price logging for analysis
- AI advisor chat for market guidance
- Rule-based fallback when AI is unavailable
- Provider switching for OpenAI, Anthropic, Ollama, and custom endpoints
- Connection testing for AI providers
- Market tools and calculators
- Price alerts
- Settings for source, AI, and product pricing

## Data Modes
- Seasonal: built-in seasonal model
- Manual: user-entered daily mandi price
- Remote: fetch live price from a URL
- Dataset: import a CSV/JSON source when live URL is unavailable

## AI Behavior
- Cloud AI requests are sent through the API server
- Local AI requests go directly to the configured endpoint
- AI uses the active market source context
- If AI fails, the app falls back to built-in analysis

## Storage
- AI and market settings are saved locally in AsyncStorage
- Price history snapshots are stored locally for analysis
- Alerts are stored locally

## How to Run on Mobile
- Install Expo Go on your phone
- Open the app in Replit preview
- Scan the QR code with Expo Go
- Keep your phone and Replit session online
- For local AI endpoints, use a phone-reachable IP address

## Purpose
This app helps jaggery traders track prices, compare products, and get market advice using either live data or seasonal estimates.