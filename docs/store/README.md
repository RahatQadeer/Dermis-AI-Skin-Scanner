# Store assets (`docs/store`)

Working files for App Store / Play listing (DERM-069). Do **not** invent legal text or prices — fill `TODO(spec)` with legal/product-approved values.

| Path                       | Purpose                                          |
| -------------------------- | ------------------------------------------------ |
| `listing-copy.draft.md`    | Title / descriptions draft                       |
| `screenshot-guide.md`      | Capture list + claim checks                      |
| `demo-account.template.md` | Reviewer login template (no real secrets in git) |
| `public-urls.md`           | Privacy, Terms, Support, deletion URL map        |
| `ios/`                     | Drop iOS screenshot PNGs here                    |
| `android/`                 | Drop Play screenshots + feature graphic here     |

CI: `apps/mobile/src/lib/storeAssets.test.ts` guards Expo icon/splash dimensions and bans D4 claims in listing draft + store compliance copy.
