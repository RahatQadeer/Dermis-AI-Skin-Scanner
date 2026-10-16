# Copy module (DERM-004)

All user-visible strings live under `apps/mobile/src/copy/`.

- Import `getCopy()` (or `copy` from `./catalog` in copy-only code) in screens and components.
- Mascot lines, quiz text, compliance disclaimers, and future screen copy are defined here — not inline in JSX.
- **D4:** banned prototype claims are not included; Welcome/paywall strings use compliant wording.
- **i18n:** `setLocale()` / `getCopy()` in `i18n.ts` — English only today; add locale files later without changing call sites.

ESLint `react/jsx-no-literals` blocks string literals in JSX text nodes under `app/` and `src/components/`. Navigation `title` props should still use `getCopy().nav.*`.
