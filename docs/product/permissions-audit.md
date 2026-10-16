# Permissions audit (DERM-062)

**Date:** 2026-10-05  
**Policy:** Camera + notifications only, requested in context (compliance).

## Inventory

| Permission / capability                                    | Platform      | When requested                                         | Purpose                                              |
| ---------------------------------------------------------- | ------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| Camera (`NSCameraUsageDescription` / `CAMERA`)             | iOS + Android | On Camera screen (`useCameraPermissionFlow` / capture) | Wellness selfie for server analysis                  |
| Notifications (local; `POST_NOTIFICATIONS` on Android 13+) | iOS + Android | Only when enabling **Scan reminders** in Profile       | Weekly local scan reminder                           |
| Store billing (RevenueCat / StoreKit / Play Billing)       | iOS + Android | System purchase sheets                                 | Pro subscription — not a privacy “permission” dialog |

## Explicitly not used

- Microphone / `RECORD_AUDIO` — camera plugin: `microphonePermission: false`, `recordAudioAndroid: false`
- Photo library / media picker
- Location, contacts, Bluetooth, Face ID, tracking, motion
- Background remote push — `enableBackgroundRemoteNotifications: false` (local reminders only)

## In-context checks

1. Camera: user must pass AI consent gate, then open scan/camera before OS prompt.
2. Notifications: OS prompt only after user turns on Scan reminders; deny reverts toggle.

## Config guardrails

- `apps/mobile/app.json` camera plugin extras disabled (mic / audio / barcode).
- CI: `permissionsPolicy.test.ts` asserts iOS usage keys and plugin flags.

## [verify] at store submission

- Re-check Expo SDK / Play target API and any new dependency that adds `uses-permission`.
- Confirm App Privacy / Data safety forms match this inventory (see `data-safety-worksheet.md`, DERM-063).
