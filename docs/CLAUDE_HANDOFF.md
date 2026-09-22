# Pulse Protocol — handoff notes

Updated 2026-09-22.

## What was completed

- Replaced the legacy public homepage with a Pulse Protocol trading landing page.
- Kept the architecture split: `pulseprotocol.co` is the public homepage; `app.pulseprotocol.co/trade` remains the trading terminal on the VPS.
- Added a reusable Pulse mark (`public/pulse-mark.svg`) using the dark navy, mint and blue visual language.
- Replaced the old purple favicon with the new Pulse mark (`app/favicon.svg`).
- Added the mark to the landing-page navigation and styled it in `app/globals.css`.
- Deployed the landing page through Vercel from GitHub repository `IcoinX/pulse-website`.
- Production deployment commit: `6e5e392` (`Add Pulse Protocol brand mark and favicon`).
- The previous landing-page deployment commit was `8f11245`.
- Confirmed the public page is live at `https://pulseprotocol.co/` and the terminal link remains `https://app.pulseprotocol.co/trade`.
- Replied to Álvaro at TradingView from Gmail, confirming `https://pulseprotocol.co/` as the official homepage for the agreement and distinguishing the terminal URL.

## Important deployment note

The terminal source/repository was not present in the local workspace or visible as a separate Vercel project. The terminal should remain on the VPS for exchange keys, WebSockets, workers and trading services. To add the same logo there, locate its VPS source repository and copy `public/pulse-mark.svg` (or the equivalent SVG), then add it to the terminal header and favicon.

## Do not change

- Do not migrate the trading terminal to Vercel without a separate architecture review.
- Do not expose exchange API keys or runtime secrets in the public landing-page repository.
