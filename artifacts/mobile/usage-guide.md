# Jaggery Market Predictor Usage Guide

## 1. First Setup
1. Open the app.
2. Go to **Settings**.
3. Enable **AI Assistant** if you want chat-based advice.
4. Choose an AI provider:
   - OpenAI
   - Anthropic
   - Ollama
   - Custom / LM Studio
5. Enter the API key or local server URL if needed.

## 2. Choose Market Data Mode
Go to **Settings > Market Data Source** and pick one:
- **Seasonal Model**: uses built-in jaggery season patterns.
- **Manual Daily Price**: enter your own mandi price.
- **Live URL / Dataset**: use a free public URL or dataset link.

## 3. Product Pricing
In Settings, you can store prices for multiple jaggery products:
- Product A
- Product B
- Product C
- Any extra products you add

Use this if you sell different grades or packing types.

## 4. How Seasonal Mode Works
Seasonal mode uses built-in rules based on:
- harvest season
- festival demand
- monthly jaggery patterns
- market momentum

It is useful when daily mandi data is not available.

## 5. How Live Data Works
If you use live data:
1. Paste a public CSV/JSON URL.
2. The app tries that source first.
3. If it fails, it can fall back to your dataset URL.
4. If that fails too, the app falls back to manual or seasonal mode.

## 6. Historical Analysis
The app stores price snapshots locally so you can later review:
- daily prices
- source used
- market mode
- product price entries

## 7. AI Advisor
Open the **Chat** screen to ask:
- Should I buy now?
- When should I sell?
- How do festivals affect price?
- What is the best grade to trade?

If AI is disabled or unavailable, the app still gives rule-based advice.

## 8. Tools Screen
The Tools tab includes:
- Profit calculator
- Seasonal analysis
- Transport cost tools
- Export guidance
- Price alerts
- AI advisor shortcut

## 9. Reset Settings
If needed, go to Settings and tap **Reset All Settings** to clear:
- AI config
- data source config
- product prices
- manual price
- dataset URLs

## 10. Best Workflow
For most traders:
1. Start with Seasonal Model.
2. Enter manual price when you know today’s mandi rate.
3. Switch to Live URL / Dataset when you have a reliable free data source.
4. Use AI chat for trading advice and comparisons.