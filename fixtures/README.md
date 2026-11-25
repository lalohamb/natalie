# Fixtures

Provider responses used by the contract tests in `tests/contract/`.

**Status: documented shapes, not captured responses.** Each JSON file carries
a `_source` field. Where it says `documented-shape`, the body was written from
the provider's public API reference and from the fields this application
reads — it has not been recorded from a real account. Replace a file with a
real recorded response (test-mode / sandbox account, secrets and personal data
removed) and change `_source` to `captured <date>` to complete the contract
(docs/KNOWN-GAPS.md G-28).

| Folder | Provider call |
|---|---|
| `mailerlite/` | `POST /api/subscribers` |
| `resend/` | `POST /emails` |
| `stripe/` | `GET /v1/payment_intents`, `GET /v1/checkout/sessions`, `GET /v1/prices/{id}` |
| `ical/` | Google Calendar public iCal feed (hand-written RFC 5545 sample) |
| `newsletter/` | Pre-adapter placeholders from M1 — unused, kept for history |
