---
name: teqfw-email
description: Use when integrating, using, testing, or reviewing @teqfw/email SMTP submission, package configuration, message outcomes, or localized email templates in Node.js TeqFW applications.
---

# @teqfw/email

Version-matched consumer guidance for the 2.0.0 package. The host project's
instructions and architecture remain authoritative.

## Apply

1. Use the package's published DI namespace for runtime components. The root
   export is type-only; do not import runtime components through package subpaths.
2. Let the host own Container composition and the one cfg load. Inject email
   components through frozen `__deps__`; do not use Container as a service locator.
3. Keep `TEQFW_EMAIL` settings package-owned and recipients application-owned.
   Map existing `APP__EMAIL_*` explicitly; there is no process.env fallback.
4. Choose prepared-message submission or template preparation. Supply an absolute
   host root for templates and escape untrusted HTML values in the caller.
5. Interpret success as SMTP acceptance or explicit simulation, not delivery.
   Never automatically retry an unknown post-DATA outcome.
6. Keep TLS certificate validation enabled and credentials/bodies out of logs.
   Verify exact APIs, defaults, published files, and infrastructure versions in
   the installed package and relevant tests before changing integration.

## Select References

| Task | Read |
| --- | --- |
| Register namespaces, inject components, or wire consumer types | [Integration](references/integration.md) |
| Load settings, map APP values, or diagnose configuration lifecycle | [Configuration](references/configuration.md) |
| Prepare content, submit messages, or interpret transport failures | [Submission](references/submission.md) |
| Load templates, select locales, or substitute variables | [Templates](references/templates.md) |
| Verify behavior and consumer integration | [Verification](references/verification.md) |
| Mount or publish the version-matched skill | [Distribution](references/distribution.md) |

The package submits email with native Node.js SMTP and retains localized template
preparation. It does not own an application bootstrap, queue, delivery tracker,
recipient policy, or logging backend. Skill discovery is host-owned and separate
from runtime DI metadata.
