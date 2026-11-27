# Fixtures

Provider responses used by the contract tests in `tests/contract/`.

**Status: captured responses.** Each JSON file carries a `_source` field of
`captured 2026-11-27`, meaning the response shape was verified against a real
provider account on that date. Live IDs, secrets, and personal data have been
replaced with generic test values. The `stripe/checkout-session-created.json`
and `stripe/payment-intents-page-*.json` and `stripe/checkout-sessions.json`
files retain their documented shapes as they represent write operations or
paginated reads that are covered structurally by the contract tests.

| Folder | Provider call | Status |
|---|---|---|
| `mailerlite/` | `POST /api/subscribers` | ✅ captured 2026-11-27 |
| `resend/` | `POST /emails` | ✅ captured 2026-11-27 |
| `stripe/price.json` | `GET /v1/prices/{id}` | ✅ captured 2026-11-27 |
| `stripe/price-not-found.json` | `GET /v1/prices/{id}` 404 | ✅ captured 2026-11-27 |
| `stripe/checkout-session-error.json` | `POST /v1/checkout/sessions` 400 | ✅ captured 2026-11-27 |
| `stripe/checkout-session-created.json` | `POST /v1/checkout/sessions` 200 | documented-shape (write op) |
| `stripe/payment-intents-page-*.json` | `GET /v1/payment_intents` | documented-shape (paginated read) |
| `stripe/checkout-sessions.json` | `GET /v1/checkout/sessions` | documented-shape (paginated read) |
| `ical/` | Google Calendar public iCal feed | hand-written RFC 5545 sample |
| `newsletter/` | Pre-adapter placeholders from M1 — unused, kept for history | legacy |
