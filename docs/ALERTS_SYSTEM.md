# Watchlist Alerts System (D)

## Overview
Signal utile, zéro bruit. Alertes client-side uniquement, pas de serveur.

## Alert Types

| Type | Trigger | Threshold | Cooldown |
|------|---------|-----------|----------|
| **PRICE_SPIKE** | |change_24h| >= 10% | 10% (configurable) | 6h |
| **VOLUME_SPIKE** | volume_24h >= 2× median | 2× median of 7 days | 6h |
| **NEW_EVENT** | New event with agent_slug match | Any new linked event | 6h |

## Anti-Spam Rules

- **1 alert max** per type / agent / 6h
- Cooldown stored in localStorage (`pulse_last_alert_sent`)
- Old alerts auto-cleared after 7 days

## Storage (localStorage)

```javascript
pulse_watchlist          // ['agent-slug-1', 'agent-slug-2']
pulse_alerts             // [{ id, type, agentSlug, message, timestamp, read }]
pulse_last_alert_sent    // { 'price-agent-slug': timestamp }
pulse_last_seen_events   // { 'agent-slug': timestamp }
```

## UI Components

### /agents page
- **Stats bar**: Watchlist box with ⭐ + badge count
- **Sidebar**: AlertsPanel (visible if unread alerts)
- **Click watchlist**: Shows/hides alerts panel

### /agents/[slug] page
- **Sidebar**: Agent-specific AlertsPanel
- **Timeline**: Full alerts history with "Mark as read" buttons

### EventCard
- Badge shows alert count on ⭐ icon

## Alert Detection Flow

```
1. User watches agent (⭐)
2. Page loads agent data + events
3. computeAlerts() checks:
   - Price change >= 10%?
   - Volume >= 2× median?
   - New events since last_seen?
4. If trigger + not on cooldown → Create alert
5. Save to localStorage
6. UI updates with badge/notification
```

## Configuration

```typescript
const DEFAULT_CONFIG = {
  priceSpikeThreshold: 10,      // %
  volumeSpikeMultiplier: 2,     // ×
  cooldownMs: 6 * 60 * 60 * 1000 // 6h
};
```

## Testing

```bash
# Create test alerts (for UI testing)
node scripts/test_alerts.js

# Or use the hidden button in UI:
# Triple-click the "No alerts yet" area
```

## Future Enhancements (not now)

- [ ] Telegram notifications
- [ ] Email alerts
- [ ] Push notifications
- [ ] Server-side alert persistence
- [ ] SMS for critical alerts

## Philosophy

> "Un badge = une règle vérifiable. Pas de marketing."

- No AI predictions
- No sentiment "confidence"
- Only objective, measurable triggers
- User controls watchlist
- Zero noise, useful signal
