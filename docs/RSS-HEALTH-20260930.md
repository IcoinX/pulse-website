# RSS availability hardening — 2026-09-30

The official OpenAI feed at https://openai.com/news/rss.xml returned HTTP 200 and
RSS XML locally; the previous /blog/rss.xml endpoint returned 403. Both reader and
importer now use the news endpoint. No third-party replacement source was introduced.

Public feed API preserves its data array and count, and adds health metadata:
available source count, unavailable source names, partial coverage, stale data and
last check time. Complete upstream outage returns 503/no-store, retains last-known
articles when the current instance has them, and never refreshes their timestamp.
This fallback is per instance, not durable across cold starts or deployments.
Outage retry interval 30s, normal cache 5 minutes. Concurrent visitors share a refresh
within an instance. HTML error pages are rejected even if their HTTP status is 200.

Checks: 23 tests passed; TypeScript passed. Public live-source test: 80 articles,
9 available sources, 10 OpenAI articles, ~578ms, no stale fallback. Anthropic,
DeepMind and LangChain were unavailable during that local check; availability can
differ from Vercel's network and is explicitly reported rather than guessed.

No database schema/authentication changes, no actual ingestion write, no exchange
keys, no order and no VPS restart. Unrelated lockfile/handoff edits remain excluded.

Deployment uses GitHub main after these checks. Rollback target before this batch:
pulse-website-11exeqq4d-icoinxs-projects.vercel.app. Roll back backend aliases only;
pulseprotocol.co/www must stay on the separate pulse-site project.
