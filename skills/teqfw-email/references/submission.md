# Submission

## Action Input

`TeqFw_Email_Back_Act_Send$.act(input)` accepts:

| Field | Contract |
| --- | --- |
| `from?` | Sender mailbox, defaulting to package settings. |
| `to` | Single mailbox or array of 1–100 mailboxes. |
| `subject` | String, including empty; no CR/LF/NUL. |
| `text?` | Text body; supply text and/or html. |
| `html?` | HTML body; callers own content safety. |
| `headers?` | Record of validated ASCII string values. |

Mailbox forms are `local@domain` and `Display Name <local@domain>`. The bounded
grammar rejects quoted local parts, groups, comma-separated recipient strings,
SMTPUTF8 addresses, and address literals. Local parts are at most 64 characters;
full addresses at most 254, domain labels at most 63. Reject CR/LF/NUL,
consecutive or edge local-part dots, and invalid domain labels.

Display names and subjects use folded UTF-8 encoded words. Bodies are UTF-8
base64 with CRLF line endings; text plus HTML uses multipart/alternative.
The composer generates Date and Message-ID. Custom headers cannot override
From/To/CC/BCC/Subject/Date/Message-ID/MIME-Version/Content-*/Return-Path/Received.
Header names use ASCII letters, digits, and hyphens; values use printable ASCII
and the combined name/value length must not exceed 990. Attachments, CC/BCC,
OAuth, and arbitrary nodemailer options are not implemented; do not pass them
assuming they will be honored.

## Outcomes

- `{success: true, messageId}`: provider accepted the final DATA transaction.
- `{success: true, messageId, simulated: true}`: composition validated, SMTP skipped.
- `{success: false, error}`: sanitized failure code, no message ID.

A simulated result never means provider acceptance. Accepted submission never
proves final recipient delivery. The action logs component-bound outcomes and
message IDs, without raw replies, auth payloads, configuration, or bodies.

## Transport Policy

One connection per call; no pool, queue, persistence, or automatic retry.
SECURE=true chooses implicit TLS. SECURE=false requires advertised STARTTLS,
then TLS and another EHLO before credentials or MAIL. TLS >=1.2 and trusted
certificate/hostname validation remain enabled. Private trust roots belong to
the Node.js host, not an insecure package option.

If credentials exist, select advertised AUTH PLAIN, otherwise AUTH LOGIN.
Without credentials, TLS-capable unauthenticated submission is possible.
The configured deadline spans connection, handshake, authentication, and SMTP
transaction/QUIT. Replies are framed across packets, bounded, and validated.
Each envelope recipient must be accepted before DATA; any rejection aborts the
transaction. DATA uses dot transparency. Sockets are destroyed on completion or
failure. A QUIT failure after acceptance still returns success.

## Failure Interpretation

Validation produces EMAIL_INVALID_ADDRESS, EMAIL_INVALID_RECIPIENT_COUNT,
EMAIL_INVALID_CONTENT, or EMAIL_INVALID_HEADER. SMTP failures include:

| Code | Interpretation |
| --- | --- |
| `EMAIL_SMTP_STARTTLS_REQUIRED` | Required upgrade unavailable. No credentials sent. |
| `EMAIL_SMTP_AUTH_UNSUPPORTED` | Neither supported password-auth mechanism advertised. |
| `EMAIL_SMTP_REJECTED_<code>` | SMTP command or final DATA explicitly rejected. |
| `EMAIL_SMTP_CONNECTION`, `EMAIL_SMTP_CLOSED` | Connection/handshake failed or closed. |
| `EMAIL_SMTP_TIMEOUT` | Operation deadline reached before an unknown DATA outcome. |
| `EMAIL_SMTP_INVALID_GREETING`, `EMAIL_SMTP_INVALID_REPLY` | Server protocol response invalid. |
| `EMAIL_SMTP_REPLY_TOO_LARGE`, `EMAIL_SMTP_UNEXPECTED_REPLY` | Response bounds exceeded. |
| `EMAIL_SMTP_OUTCOME_UNKNOWN` | DATA transmitted, final acceptance reply not observed. |
| `EMAIL_SEND_FAILED` | Unexpected error sanitized by the action. |

An unknown outcome may already have been accepted. Never retry it automatically;
let application policy decide follow-up. The action suppresses raw exceptions;
absence of a result message ID is not proof that the provider rejected delivery.
