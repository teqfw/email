# Changelog

This changelog starts with the 2.x generation. Legacy 0.x sources remain on the
`v0.x` branch.

## 2.0.0

### Breaking changes

- Rewrite the plugin for TeqFW 2.x as native ESM with explicit frozen `__deps__`
  and canonical `teqfw.fw.di.namespaces` metadata. Remove the legacy `.js`
  components, DTO factories, core dependency keys, and `teqfw.json`.
- Require Node.js >=20 and cfg/log/di 2.x. Remove `@teqfw/core`, nodemailer, and
  `@teqfw/test`; use native Node.js SMTP submission.
- Move configuration to the package-owned `TEQFW_EMAIL__*` namespace. The host
  owns namespace registration, configuration Sources/loading, and logging policy.
  Existing `APP__EMAIL_*` settings require explicit host mapping; there is no
  implicit environment fallback or package-wide recipient default.
- Require implicit TLS or STARTTLS with certificate and hostname validation.
  Plaintext submission, attachments, CC/BCC, OAuth, and arbitrary nodemailer
  options are outside the new contract.
- Require an explicit absolute host root for localized template preparation.
  Runtime access uses the `TeqFw_Email_` DI namespace; the npm root export is
  type-only and runtime package subpath imports are not exposed.
- Report SMTP acceptance or explicit simulation rather than recipient delivery.
  Distinguish an unknown post-DATA outcome; do not automatically retry it.
  Version 2.0.0 is not a drop-in upgrade from 0.x.

### Capabilities

- Submit prepared text/HTML messages or prepare and submit localized templates.
  Retain host/package template fallback, literal variable substitution, and
  forwarding of validated optional headers.
- Support AUTH PLAIN/LOGIN over TLS, UTF-8 MIME content, validated mailboxes,
  header injection protection, generated message IDs, bounded SMTP replies,
  finite operation deadlines, and socket cleanup.
- Provide explicit simulation and sanitized failure results. Preserve accepted
  submission when QUIT fails; expose ambiguous acceptance after a lost DATA reply.
- Add source-bound process diagnostics: debug/trace stages, warning-level
  transport anomalies, and structured timing/stage metadata. Keep credentials,
  authentication payloads, addresses, and message content out of logs; leave
  visibility under host logging Policy control.
- Publish ambient component/input/result types and a version-matched Agent Skill
  covering composition, configuration, submission outcomes, and templates.

### Verification

- Add component unit tests and real-container SMTP/TLS integration tests,
  including configuration mapping, authentication, certificate rejection,
  sanitized diagnostics, deadlines, and ambiguous submission outcomes.
- Verify the npm archive in a fresh consumer: namespace discovery, DI resolution,
  strict JSDoc compilation, and mounting of the published skill.
- Restrict publication to runtime source, types, consumer guidance, and public
  package files; exclude private context, development tests, and fixture keys.
