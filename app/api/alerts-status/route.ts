import { NextResponse } from 'next/server';
import fs from 'fs';

const STATE_FILE = '/data/.openclaw/logs/telegram-alerts-state.json';
const BLOCKED_LOG = '/data/.openclaw/logs/alerts-blocked.log';

interface AlertState {
  lastCheck: number;
  alertsSent: number;
  blockedCount: number;
  lastAlert: {
    token: string;
    score: number;
    class: string;
    sentAt: string;
  } | null;
}

function loadState(): AlertState {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { lastCheck: 0, alertsSent: 0, blockedCount: 0, lastAlert: null };
  }
}

function loadRecentBlocked() {
  try {
    const content = fs.readFileSync(BLOCKED_LOG, 'utf8');
    const lines = content.trim().split('\n').slice(-20); // Last 20 entries
    
    return lines.map(line => {
      // Parse: [timestamp] BLOCKED token=X reason=Y details="Z"
      const match = line.match(/BLOCKED token=(\S+) reason=(\S+) details="([^"]+)"/);
      if (!match) return null;
      return {
        tokenKey: match[1],
        reason: match[2],
        details: match[3]
      };
    }).filter(Boolean);
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const state = loadState();
    const blocked = loadRecentBlocked();
    
    return NextResponse.json({
      status: {
        ...state,
        lastCheck: state.lastCheck ? new Date(state.lastCheck).toISOString() : null
      },
      blocked,
      config: {
        minScore: 7.0,
        minLiquidity: 50000,
        cooldownMinutes: 60,
        escalationThreshold: 2.0
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
