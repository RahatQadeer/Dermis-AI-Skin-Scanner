# ADR-007: Local scan reminders

**Status:** Accepted (DERM-053)

## Context

Profile exposes a “Scan reminders” toggle persisted via `GET/PATCH /v1/settings`. Store policy allows notification permission only in context. Remote push (APNs/FCM) is not required for v1 check-in reminders.

## Decision

1. Use `expo-notifications` for **local** weekly reminders when the user enables the toggle (permission requested at that moment).
2. Default schedule: Monday 10:00 local (`SCAN_REMINDER_*` constants) until product finalizes cadence (`TODO(spec)` if changed).
3. Web / CI uses stub `notificationsApi.ts` (unsupported); toggle still saves preference when API is live, but OS scheduling is native-only.
4. “Wellness tips” remains a stored preference only (no local schedule in this ticket).

## Consequences

- Enabling without granting permission reverts the toggle and may PATCH `notifyScanReminders: false`.
- Changing cadence requires a product decision and constant update, not a new permission flow.
