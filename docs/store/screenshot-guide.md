# Screenshot guide (DERM-069)

## Capture set (minimum)

Prefer real device / simulator captures into `docs/store/ios/` and `docs/store/android/`. Sizes **[verify]** against current Apple / Google console docs at submission.

| #   | Screen     | Route / notes           | Must show                                                            |
| --- | ---------- | ----------------------- | -------------------------------------------------------------------- |
| 1   | Welcome    | `/(onboarding)/welcome` | Not-a-medical-device footnote / disclaimer                           |
| 2   | AI consent | `/(scan)/ai-consent`    | Google Gemini named; consent before scan                             |
| 3   | Paywall    | `/(onboarding)/paywall` | Price period, Restore, auto-renew / cancel, Terms+Privacy (DERM-065) |
| 4   | Home       | `/(tabs)/home`          | Wellness framing; no banned claims                                   |
| 5   | Results    | `/(tabs)/results`       | Health disclaimer visible                                            |
| 6   | Profile    | `/(tabs)/profile`       | About disclaimer; account controls                                   |

Optional: Camera (no real user faces in marketing if policy forbids), Routine, Progress.

## Claim / honesty checklist

- [ ] No PRODUCT.md D4 banned phrases in chrome or overlays
- [ ] No fake clinical / dermatologist endorsement badges
- [ ] Screenshots match shipping UI (honest listings — compliance)
- [ ] Paywall disclosures readable (fold QA)
- [ ] After DERM-066: pink/green contrast still looks on-brand

## Play feature graphic

Add `docs/store/android/feature-graphic.png` at **1024×500** before Play listing upload.
