# Gemini consistency report (DERM-045)

**Date:** 2026-10-05  
**Prompt version:** `gemini-scan-v1`  
**Default model:** `gemini-2.0-flash`  
**Temperature:** `0.2`

## Method

1. **Contract tests** (`backend/src/adapters/gemini/geminiContract.test.ts`): good JSON accepted; partial (missing zones) rejected; out-of-range scores rejected; HTTP 500 retries then fails.
2. **Consistency unit test** (`geminiConsistency.test.ts`): same image bytes + identical stubbed model text → five identical Zod-parsed analyses; cost lines logged each time.
3. **Live API (optional):** set `GEMINI_API_KEY` and re-run the same selfie N times against production Gemini. Record index/concern deltas. Not executed in CI (no secret / network).

## CI results (this ticket)

| Check                         | Result |
| ----------------------------- | ------ |
| Good payload                  | Pass   |
| Partial / bad payload         | Reject |
| Retry on 500                  | Pass   |
| Same photo ×5 identical parse | Pass   |

## Live Gemini expectation

With temperature 0.2, scores may still vary slightly across calls. Product rule: **persist whatever the server validated for that scan**; do not average client-side. If live variance is too high for UX, lower temperature further or pin a newer model in `GEMINI_MODEL` after a supervised bake-off.

## Cost log

Each successful analyze emits one JSON line: `{ "type": "scan_cost", requestId, userId, model, promptVersion, token counts, estimatedCostUsd }`. Rates in code are placeholders (`TODO(spec)`).
