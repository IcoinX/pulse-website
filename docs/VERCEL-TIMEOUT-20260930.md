# Vercel import timeout remediation — 2026-09-30

The email reports 57 execution-limit failures in the previous seven days (14%).
Historical attribution is NOT confirmed: CLI runtime logs returned no historical
records, and grouped seven-day metrics require the paid Observability Plus add-on.
No add-on was purchased. Do not describe the historic alert as conclusively resolved.

## Defect corrected

`/api/cron/ingest` had twelve sequential RSS requests (up to 8s each), followed by
sequential database operations within a 60s function. Its RSS timer stopped at headers,
so a stalled body was not bounded. Database requests had no explicit timeout.

The correction preserves sources, authentication, hashes, schema and normal inserts:
- fetch independent feeds concurrently;
- bound headers AND body, propagate cancellation, clear timers in finally;
- database request timeout 5s, RSS timeout 8s, overall deadline 45s;
- stop processing before the platform deadline, report incomplete/errors honestly;
- authenticated `?dry_run=1` skips every insertion;
- log counters and elapsed time, never credentials or upstream exception payloads.

## Evidence

- 6 helper tests and 6 handler tests passed; TypeScript check passed.
- Cloud production build passed. Local build compiled/typechecked but could not collect
  other routes without their environment variables; it was not claimed as a full pass.
- Real-source/real-database integration in dry-run mode: HTTP-style response 200,
  6142ms, inserted=0, skipped=64, errors=0, incomplete=false, totalEvents=17456.
  This ran the corrected handler locally with existing Vercel environment values in
  memory; no env file was saved. Vercel would not export the sensitive CRON_SECRET,
  so a deployed authenticated dry-run could not be performed. No auth was weakened.
- Deployed unauthenticated ingestion endpoint: 401, as intended.
- Feed endpoint and site's API relay: 200.
- Trading terminal GET: 401 (login protection), no VPS service touched.

## Deployment

Candidate assembled from Git HEAD a608af1 plus ONLY the changed route and new helper,
excluding unrelated working-tree documentation and lockfile edits.
New deployment: pulse-website-qpn94j753-icoinxs-projects.vercel.app
ID: dpl_AGvXCHXEdxS1dwgxf9QuGetEjj5V.
Aliases updated: pulse-website-sigma.vercel.app and
pulse-website-git-main-icoinxs-projects.vercel.app.
Project's production alias also points to the new deployment.
The static site's pulseprotocol.co/www aliases remain on pulse-site, not this backend.

Rollback: assign these three backend aliases to
pulse-website-pvomisy7d-icoinxs-projects.vercel.app using `vercel alias set`, scope
icoinxs-projects. Do NOT promote the old backend wholesale: its historic metadata
lists pulseprotocol.co, which must remain on the separate static project.

Next evidence needed: authenticated scheduled invocation completion/duration and
absence of new execution-limit errors over subsequent runs. No background monitor
has been created and no future check is promised by this report.
