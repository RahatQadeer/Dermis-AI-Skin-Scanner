# Android 16 / API 36 compliance audit (DERM-067)

**Date:** 2026-10-05  
**Policy:** target API 36+, predictive back, 16 KB page size **[verify]** with Expo SDK (`.cursor/rules/compliance.mdc`).  
**Stack:** Expo `~57.0.26`, React Native `0.86.3`, CNG (no committed `android/`).

## Inventory

| Item                        | Value / status                                                           |
| --------------------------- | ------------------------------------------------------------------------ |
| Expo                        | `~57.0.26` (`apps/mobile/package.json`)                                  |
| React Native                | `0.86.3`                                                                 |
| Effective `compileSdk`      | **36** (`node_modules/react-native/gradle/libs.versions.toml`)           |
| Effective `targetSdk`       | **36**                                                                   |
| Effective `minSdk`          | 24                                                                       |
| AGP                         | 8.12.0 (via RN catalog)                                                  |
| `expo-build-properties` pin | Not used — SDK levels follow RN defaults (no new dependency this ticket) |
| `eas.json`                  | **Missing** — release builds tracked under DERM-081                      |
| `expo-doctor` (2026-10-05)  | 21/21 passed                                                             |

## Predictive back

| Requirement                                  | Status                                                                        |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| `android.predictiveBackGestureEnabled: true` | **OK** (was `false`; enabled DERM-067)                                        |
| No custom `BackHandler` intercepts           | OK (none in app source)                                                       |
| Stack back matches system back               | `[verify]` on device (tabs, paywall, camera, consent, `router.replace` roots) |

Prebuild sets `android:enableOnBackInvokedCallback` from this flag.

## Edge-to-edge (Android 15/16)

- Expo prebuild applies edge-to-edge by default for this SDK path.
- UI uses `Screen` + safe-area edges on primary flows.
- `[verify]` inset QA: camera overlay, sheets, tab bar, paywall CTA above nav gesture.

## 16 KB page size

| Layer        | Notes                                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| Config       | No repo toggle; alignment is native-binary / NDK packaging                                                      |
| Native risk  | Hermes/RN, `react-native-reanimated`, `react-native-worklets`, `react-native-purchases`, `expo-camera`          |
| Verification | **[verify]** after first EAS Android AAB: Play pre-launch / `llvm-readelf -l` on `.so` for `LOAD` align 2\*\*16 |

Cannot fully prove 16 KB from lockfile alone — document as submission gate with DERM-081 builds.

## CI guard

`apps/mobile/src/lib/androidCompliance.test.ts`:

1. Predictive back must stay `true` in `app.json`.
2. Expo 57 + RN 0.86 dependency range.
3. RN gradle catalog `targetSdk` / `compileSdk` === `36`.

## Remaining `[verify]` / follow-ups

1. Device predictive-back matrix (onboarding → tabs → modal sheets → camera).
2. First Android EAS build + 16 KB evidence (DERM-081).
3. Add `android.package` / versionCode before Play upload (DERM-081).
4. Re-run `expo-doctor` and permissions audit when adding native deps.
5. Optional later: `expo-build-properties` to pin SDK 36 explicitly (ask before adding dep).
