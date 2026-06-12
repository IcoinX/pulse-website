import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plojsqsjykzqwdaolfpi.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

const RSS_SOURCES = [
  { url: 'https://cointelegraph.com/rss', name: 'CoinTelegraph', type: 'CRYPTO' },
  { url: 'https://cryptopotato.com/feed/', name: 'CryptoPotato', type: 'CRYPTO' },
  { url: 'https://blog.langchain.dev/rss/', name: 'LangChain Blog', type: 'AGENT' },
  { url: 'https://huggingface.co/blog/feed.xml', name: 'Hugging Face', type: 'AI' },
  { url: 'https://openai.com/blog/rss.xml', name: 'OpenAI Blog', type: 'AI' },
];

function generateHash(title: string, source: string): string {
  return crypto
    .createHash('sha256')
    .update(`${title}-${source}`)
    .digest('hex')
    .substring(0, 16);
}

async function getNextEventId(supabase: ReturnType<typeof createClient>): Promise<number> {
  const { data } = await supabase
    .from('events')
    .select('event_id')
    .order('event_id', { ascending: false })
    .limit(1);
  return ((data?.[0]?.event_id as number) || 6025) + 1;
}

async function fetchRSSItems(url: string, sourceName: string): Promise<{ title: string; link: string }[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'PULSE-Indexer/2.0' },
    });
    clearTimeout(timeout);
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

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    let nextId = await getNextEventId(supabase);
    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    for (const source of RSS_SOURCES) {
      const items = await fetchRSSItems(source.url, source.name);

      for (const item of items) {
        const canonicalHash = generateHash(item.title, source.name);

        const { data: existing } = await supabase
          .from('events')
          .select('id')
          .eq('canonical_hash', canonicalHash)
          .limit(1);

        if (existing && existing.length > 0) {
          skipped++;
          continue;
        }

        const { error } = await supabase.from('events').insert({
          chain_id: 8453,
          event_id: nextId++,
          title: item.title,
          source_type: source.type,
          status: 'PENDING',
          canonical_hash: canonicalHash,
          is_seed: false,
          verification_status: 'PENDING',
          verification_reason: `Ingested from ${source.name}`,
          verified_by: null,
          verified_at: null,
        });

        if (error) {
          errors++;
        } else {
          inserted++;
        }
      }
    }

    const { count: total } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      inserted,
      skipped,
      errors,
      totalEvents: total,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
