# AviationStack Cache

## Summary
Cache AviationStack flight lookups by flight IATA code to reduce paid API usage. The cache is shared across all users and refreshed monthly since the underlying data changes infrequently for this use case.

## Goals
- Reduce AviationStack API calls for repeated lookups.
- Return cached results for frequent requests with minimal latency.
- Keep cached data reasonably fresh with a monthly refresh.
- Allow manual additions for missing routes and keep them isolated until confirmed.

## Non-Goals
- Real-time flight tracking accuracy.
- Per-user or per-circle cache scoping.
- Caching all fields from AviationStack response.

## Users & Use Cases
- Primary user: Any Airlog user searching flights by base IATA number.
- Primary flow: User calls the AviationStack endpoint → API checks cache → returns cached data or fetches + stores.
- Edge cases: Unknown flight IATA, empty AviationStack response, API errors/timeouts.
- Manual add flow: User adds a new flight route manually → stored as pending → excluded from cache reads until confirmed.

## Functional Requirements
- FR1: API checks cache by key `flight:${iata}` before calling AviationStack.
- FR2: Cache stores only `airline.iata`, `arrival.iata`, `departure.iata`, `flight.iata`.
- FR3: Cache entries older than 30 days are refreshed.
- FR4: Cache is shared across users.
- FR5: If AviationStack fails and a stale cache entry exists, return stale data with a warning field.
- FR6: Manual flight additions create a pending cache record and are not returned until confirmed.
- FR7: Stale cache entries are never returned; stale triggers a refresh via AviationStack.

## Data & Storage
- Tables/columns to add or change:
  - New table `aviationstack_cache`
  - Columns: `cache_key` (text, unique), `flight_iata` (text), `airline_iata` (text), `arrival_iata` (text),
    `departure_iata` (text), `status` (text, default `pending`), `payload_source` (jsonb, optional), `cached_at` (timestamptz), `refreshed_at` (timestamptz)
- Cache keys & TTL:
  - Key: `flight:${iata}`
  - TTL: 30 days from `refreshed_at`
- Invalidation rules:
  - Time-based only (monthly refresh)
- Backfill/migration needs:
  - None

## API & Services
- Endpoints to add/modify:
  - `airlog-api/routes/aviationStack/aviationStack.controllers.ts` to check cache before external call.
  - Manual flight creation endpoint should upsert cache with `status = pending`.
- External API usage (AviationStack):
  - Only call when cache miss or stale.
- Rate limits & error handling:
  - If AviationStack fails and cache exists but is stale, do not return stale data; surface the error.

## UI/UX (if any)
- None

## Security & Permissions
- RLS/policies:
  - Table is read-accessible by authenticated users (shared cache).
  - Pending entries should be readable only by admins or staff until confirmed.
- Auth requirements:
  - Same as existing AviationStack endpoint.

## Performance & Reliability
- Expected usage: High read volume, low write volume.
- Caching strategy details:
  - Read-through cache with monthly refresh.
- Failure modes & fallbacks:
  - Serve stale cache on upstream failure.

## Observability
- Logs/metrics:
  - Cache hit/miss count.
  - Upstream error count.
  - Pending cache entries count and confirmations.

## Rollout
- Feature flag?: No
- Migration/seed steps:
  - Create table.
- Rollback plan:
  - Remove cache check and delete table if necessary.

## Files Touched
- `airlog-api/routes/aviationStack/aviationStack.controllers.ts` (cache lookup before external call)
- `airlog-api/routes/aviationStack/aviationStack.service.ts` (cache orchestration and staleness)
- `airlog-api/routes/aviationStack/aviationStack.repository.ts` (external AviationStack fetch)
- `airlog-api/routes/routes/routes.controllers.ts` (manual route creation should seed pending cache)
- `airlog-api/routes/routes/routeUpsert.ts` (route upsert integration point for pending cache)
- `airlog-api/routes/flights/flights.service.ts` (manual flight creation should seed pending cache)
- `airlog-api/database.types.ts` (regenerate after schema change)
- `airlog-ui/src/components/molecules/FlightCombobox.tsx` (client behavior on cached results)

## Implementation Checklist
### Database Schema (Concrete)
- Table: `aviationstack_cache`
- Columns:
  - `id` uuid primary key default `gen_random_uuid()`
  - `cache_key` text not null unique (format: `flight:${iata}`)
  - `flight_iata` text not null
  - `airline_iata` text not null
  - `departure_iata` text not null
  - `arrival_iata` text not null
  - `status` text not null default `pending` (allowed: `pending`, `confirmed`)
  - `payload_source` jsonb null (raw provider payload for auditing/portability)
  - `provider` text not null default `aviationstack`
  - `cached_at` timestamptz not null default `now()`
  - `refreshed_at` timestamptz not null default `now()`
  - `created_at` timestamptz not null default `now()`
  - `updated_at` timestamptz not null default `now()`
- Constraints:
  - `status` check: `status in ('pending','confirmed')`
- Indexes:
  - unique on `cache_key`
  - index on `flight_iata`
  - index on `status`
  - (optional) text_pattern_ops index on `flight_iata` for prefix searches (e.g., `DL%`)

### RLS Policies
- Enable RLS.
- Allow `select` on `status = 'confirmed'` for authenticated users.
- Restrict `status = 'pending'` to service role or admin/staff role only.
- Allow `insert/update` for service role (API server).

### Implementation Steps
1. Create `aviationstack_cache` table with columns, constraints, and indexes above.
2. Add RLS policies for confirmed vs pending visibility.
3. Regenerate `airlog-api/database.types.ts`.
4. Add cache repository helpers (lookup by `cache_key`, upsert, mark confirmed).
5. Update AviationStack service to:
   - Build cache key `flight:${iata}`
   - Support prefix lookup (e.g., `DL` returns all cached `flight_iata` starting with `DL`)
   - Return confirmed, non-stale cache entries
   - Call AviationStack on miss or stale, then upsert cache (one row per entry)
   - Fallback to `airlines`/`airports` tables when cached fields are missing
6. Update AviationStack controller to pass through cache-aware service results.
7. Update manual flight creation flow to insert pending cache entries.
8. (Optional) Add admin/manual workflow for confirming pending cache entries directly in DB.

## Open Questions
- Should `payload_source` be stored as a full JSON blob for debugging?
- Who can confirm pending routes and how is that surfaced in the UI?
  - Current: confirm in database directly (manual ops).
  - Future: superAdmin review queue or automated verification.
