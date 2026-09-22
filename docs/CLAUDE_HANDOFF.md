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

## Terminal deployment facts (confirmed 2026-09-22)

- Local source: `C:\Users\dumon\OneDrive\Bureau\Pulse Terminal`.
- This is a local folder, not a Git repository: no `.git` directory and no remote.
- VPS: Hostinger `srv1307320` (`178.16.129.127`).
- Deployed code: `/opt/pulse-terminal/app`.
- Runtime: `/opt/pulse-terminal/venv/bin/python server.py`, systemd service `pulse-terminal`, system user `pulse`.
- Runtime data: `/var/lib/pulse-terminal` (user `pulse` only). Secrets: `/etc/pulse-terminal.env` (root-only).
- Python listens only on `127.0.0.1:8787`; nginx proxies HTTPS for `app.pulseprotocol.co`; Certbot manages Let's Encrypt.
- Deployment uses `deploy/deploy.sh` to archive/upload over SSH, then restart systemd. It excludes `.master_key`, `vault.json`, `.env` and runtime data.
- Terminal branding is already deployed: `app/static/pulse-mark.svg`, SVG MIME handling in `app/server.py`, favicon/header branding on six HTML pages, and updated settings tab titles in `app/i18n/{fr,es}/settings.json`.
- The MIME correction only enables SVG delivery; no trading logic, exchange settings, API keys or secrets changed.

## Do not change

- Do not migrate the trading terminal to Vercel without a separate architecture review.
- Do not expose exchange API keys or runtime secrets in the public landing-page repository.
