# Changelog

## Unreleased

- Add source-bound debug/trace process diagnostics, warning-level transport
  anomalies, and structured timing/stage metadata without exposing credentials
  or message content. Keep logging levels under host Policy control.

## 2.0.0

- Rewrite runtime components as agent-written native ESM with explicit TeqFW DI
  dependencies and canonical namespace metadata.
- Replace core/nodemailer/test with cfg/log/di 2.x and native Node.js SMTP.
- Require implicit TLS or STARTTLS; support AUTH PLAIN/LOGIN, UTF-8 MIME,
  validated addressing, sanitized failures, finite deadlines, and cleanup.
- Retain localized template preparation and host/package fallback; require an
  explicit host root and forward optional headers.
- Add ambient types, unit tests, real-container SMTP/TLS integration tests, and
  artifact validation. Preserve legacy sources on the v0.x branch.
- Change configuration and composition contracts; this is not a drop-in upgrade.
