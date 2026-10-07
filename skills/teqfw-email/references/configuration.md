# Configuration

## Ownership And Lifecycle

The host selects cfg Sources and awaits one load before using email consumers.
Email reads a detached raw fragment with `Reader.get('TEQFW_EMAIL')` and owns
conversion, validation, defaults, and freezing. It never reads process.env or
APP settings implicitly. DI and configuration namespaces are separate concepts.

`TeqFw_Email_Config$.get()` materializes settings lazily. Failed reads are not
cached; a later read can succeed after configuration loading. The first
successful result and nested auth are frozen and cached. No hot reload exists.
A failed cfg load still follows cfg's own terminal-failure contract.

## Parameters

Complete keys use `TEQFW_EMAIL__` followed by the parameter below.

| Parameter | Meaning | Default |
| --- | --- | --- |
| `HOST` | SMTP hostname/IP, required unless simulating. | Empty |
| `PORT` | Integer 1–65535. | 465 when secure, otherwise 587 |
| `SECURE` | Implicit TLS when true; mandatory STARTTLS when false. | true |
| `AUTH_USER` | Optional username. | Empty |
| `AUTH_PASS` | Password, paired with username. | Empty |
| `FROM` | Non-empty default sender mailbox. | AUTH_USER |
| `TIMEOUT_MS` | Total operation deadline, integer 1–2147483647. | 30000 |
| `CLIENT_NAME` | EHLO name; ASCII letters, digits, dots, hyphens. | localhost |
| `SILENT_MODE` | Validate and simulate, skipping the SMTP transport. | false |

Null or absent raw values select defaults. String fields reject non-strings,
CR/LF, and NUL. HOST rejects whitespace and angle brackets. Booleans accept only
true/false or exact strings `true`/`false`. Integers accept numeric integers or
digit strings, within the bounds above. A default FROM is required even when an
individual message supplies its own sender; actual mailbox validation happens
when composing a message. AUTH_USER/PASS must either both be non-empty or absent.

Example dotenv settings:

```dotenv
TEQFW_EMAIL__HOST=smtp.example.com
TEQFW_EMAIL__PORT=587
TEQFW_EMAIL__SECURE=false
TEQFW_EMAIL__AUTH_USER=sender@example.com
TEQFW_EMAIL__AUTH_PASS=replace-with-a-secret
TEQFW_EMAIL__FROM=Example Sender <sender@example.com>
```

Load secrets from host-selected Sources; never copy production credentials into
skills, fixtures, diagnostics, or source control. A sender is required in
simulation, but HOST may be empty.

## Explicit APP Mapping

Applications with APP__EMAIL_* keep ownership of that namespace. A host Source
can retain its entries while adding package-owned keys:

```js
const map = {
    APP__EMAIL_HOST: 'TEQFW_EMAIL__HOST',
    APP__EMAIL_PORT: 'TEQFW_EMAIL__PORT',
    APP__EMAIL_SECURE: 'TEQFW_EMAIL__SECURE',
    APP__EMAIL_AUTH_USER: 'TEQFW_EMAIL__AUTH_USER',
    APP__EMAIL_AUTH_PASS: 'TEQFW_EMAIL__AUTH_PASS',
};
// source is an explicitly selected cfg Source, such as a dotenv descriptor.
const mapped = {
    id: 'application-email-mapping',
    async load() {
        const entries = await source.load();
        return [...entries, ...entries.filter(({key}) => Object.hasOwn(map, key))
            .map(({key, value}) => ({key: map[key], value}))];
    },
};
// The host includes mapped in its one Loader.load([...]) call.
```

APP__EMAIL_TO is not mapped. The application reads its APP fragment, validates
its recipient policy, and passes `to` explicitly. If the SMTP username is not a
valid mailbox, the host must also provide TEQFW_EMAIL__FROM.
For multiple Sources, map each intended source and preserve the host-selected
precedence. Decide explicitly which representation wins if a source contains
both APP and TEQFW_EMAIL settings. Do not perform a second cfg load in a CLI
host; supply the Source through its startup configuration mechanism.

## Failure Codes

Configuration failures use EMAIL_CONFIG_INVALID_<PARAMETER>,
EMAIL_CONFIG_INVALID_HOST_OR_CLIENT_NAME, EMAIL_CONFIG_INCOMPLETE_AUTH, or
EMAIL_CONFIG_MISSING_FROM. The action sanitizes unexpected infrastructure errors
to EMAIL_SEND_FAILED. Diagnose key names and bootstrap ordering without logging
raw configuration values.
