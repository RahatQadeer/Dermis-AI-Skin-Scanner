-- DERM-042: idempotent RevenueCat webhook event log (service_role writes only).

create table public.billing_webhook_events (
  event_id text primary key,
  provider text not null default 'revenuecat',
  event_type text not null,
  app_user_id text,
  processed_at timestamptz not null default now(),
  payload jsonb not null,
  constraint billing_webhook_events_provider_nonempty check (char_length(provider) > 0),
  constraint billing_webhook_events_type_nonempty check (char_length(event_type) > 0)
);

create index billing_webhook_events_processed_at_idx
  on public.billing_webhook_events (processed_at desc);

alter table public.billing_webhook_events enable row level security;

-- No client policies: only service_role (bypasses RLS) inserts/reads for ops.

grant all on public.billing_webhook_events to service_role;
