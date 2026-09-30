import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { fetchWithinBudget } from '../../../../lib/ingest-budget';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plojsqsjykzqwdaolfpi.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

const RSS_SOURCES = [
  { url: 'https://cointelegraph.com/rss', name: 'CoinTelegraph', type: 'CRYPTO', trusted: true },
  { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', name: 'CoinDesk', type: 'CRYPTO', trusted: true },
  { url: 'https://cryptopotato.com/feed/', name: 'CryptoPotato', type: 'CRYPTO', trusted: false },
  { url: 'https://decrypt.co/feed', name: 'Decrypt', type: 'CRYPTO', trusted: true },
  { url: 'https://theblock.co/rss.xml', name: 'The Block', type: 'CRYPTO', trusted: true },
  { url: 'https://blog.langchain.dev/rss/', name: 'LangChain Blog', type: 'AGENT', trusted: true },
  { url: 'https://huggingface.co/blog/feed.xml', name: 'Hugging Face', type: 'AI', trusted: true },
  { url: 'https://openai.com/news/rss.xml', name: 'OpenAI Blog', type: 'AI', trusted: true },
  { url: 'https://www.anthropic.com/blog/rss.xml', name: 'Anthropic', type: 'AI', trusted: true },
  { url: 'https://deepmind.google/blog/rss/', name: 'DeepMind', type: 'AI', trusted: true },
  { url: 'https://techcrunch.com/feed/', name: 'TechCrunch', type: 'TECH', trusted: true },
  { url: 'https://www.theverge.com/rss/index.xml', name: 'The Verge', type: 'TECH', trusted: true },
];

function generateHash(title: string, source: string): string {
  return crypto
    .createHash('sha256')
    .update(`${title}-${source}`)
    .digest('hex')
    .substring(0, 16);
}

async function getNextEventId(supabase: any): Promise<number> {
  const { data } = await supabase
    .from('events')
    .select('event_id')
    .order('event_id', { ascending: false })
    .limit(1);
  return (((data as any)?.[0]?.event_id as number) || 6025) + 1;
}

async function fetchRSSItems(url: string, deadline: number): Promise<{ title: string; link: string }[]> {
  try {
    const res = await fetchWithinBudget(url, {
      headers: { 'User-Agent': 'PULSE-Indexer/2.0' },
    }, deadline, 8000);
    if (!res.ok) return [];
    const xml = await res.text();
    const items: { title: string; link: string }[] = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    const titleRegex = /<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i;
    const linkRegex = /<link[^>]*>([\s\S]*?)<\/link>/i;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
      const itemContent = match[1];
      const titleMatch = itemContent.match(titleRegex);
      const linkMatch = itemContent.match(linkRegex);
      if (titleMatch) {
        const title = titleMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
        const link = linkMatch ? linkMatch[1].trim() : url;
        if (title.length > 10) items.push({ title: title.substring(0, 200), link });
      }
    }
    return items;
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_KEY not configured' }, { status: 500 });
  }

  const started = Date.now();
  const dryRun = request.nextUrl.searchParams.get('dry_run') === '1';
  const deadline = started + 45000; // 15s margin before Vercel's 60s limit.
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    global: { fetch: (input, init) => fetchWithinBudget(input, init, deadline) },
  });

  try {
    let nextId = await getNextEventId(supabase);
    let inserted = 0;
    let skipped = 0;
    let errors = 0;
    let incomplete = false;
    // Twelve independent feeds: one slow provider must not delay the other eleven.
    const feeds = await Promise.all(RSS_SOURCES.map(async source => ({
      source, items: await fetchRSSItems(source.url, deadline),
    })));

    ingest: for (const { source, items } of feeds) {
      for (const item of items) {
        if (Date.now() >= deadline - 1000) {
          incomplete = true;
          break ingest;
        }
        const canonicalHash = generateHash(item.title, source.name);

        const { data: existing, error: lookupError } = await supabase
          .from('events')
          .select('id')
          .eq('canonical_hash', canonicalHash)
          .limit(1);
        if (lookupError) { errors++; continue; }

        if (existing && existing.length > 0) {
          skipped++;
          continue;
        }
        if (dryRun) { skipped++; continue; }

        const isVerified = source.trusted;
        const now = isVerified ? new Date().toISOString() : null;

        const { error } = await supabase.from('events').insert({
          chain_id: 8453,
          event_id: nextId++,
          title: item.title,
          source_type: source.type,
          status: isVerified ? 'VERIFIED' : 'PENDING',
          canonical_hash: canonicalHash,
          is_seed: false,
          verification_status: isVerified ? 'VERIFIED' : 'PENDING',
          verification_reason: isVerified
            ? `Auto-verified: trusted source ${source.name}`
            : `Ingested from ${source.name}`,
          verified_by: isVerified ? 'PULSE-Indexer' : null,
          verified_at: now,
        });

        if (error) {
          errors++;
        } else {
          inserted++;
        }
      }
    }

    let total: number | null = null;
    if (!incomplete && Date.now() < deadline - 1000) {
      const result = await supabase.from('events').select('*', { count: 'exact', head: true });
      total = result.count;
      if (result.error) errors++;
    }
    console.info(JSON.stringify({ event: 'ingest_completed', durationMs: Date.now() - started,
      inserted, skipped, errors, incomplete }));

    return NextResponse.json({
      success: !incomplete && errors === 0,
      incomplete,
      dryRun,
      durationMs: Date.now() - started,
      inserted,
      skipped,
      errors,
      totalEvents: total,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error(JSON.stringify({ event: 'ingest_failed', durationMs: Date.now() - started }));
    return NextResponse.json({ success: false, error: 'Ingestion failed; see server diagnostics' }, { status: 500 });
  }
}
