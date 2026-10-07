# @teqfw/email

![npms.io](https://img.shields.io/npm/dm/@teqfw/email)
![jsdelivr](https://img.shields.io/jsdelivr/npm/hm/@teqfw/email)

> **Human-governed. Agent-built. Agent-ready.**

`@teqfw/email` lets application packages send text and HTML email through configured SMTP infrastructure without nodemailer. It is part of the Tequila Framework ([TeqFW](https://teqfw.com/)): created and evolved by coding agents under the architectural direction and final responsibility of [Alex Gusev](https://github.com/flancer64), and shipped with a version-matched Agent Skill so other agents can understand, integrate, and use it correctly.

## Why use it

Email submission should be reusable across application features, while the application keeps control of credentials, recipients, and startup.

- Send prepared text/HTML messages or use localized templates.
- Use validated TLS or STARTTLS with password authentication.
- Get explicit submission results, including a simulation mode for development.
- Share one email capability across packages through dependency injection.

## Quick start

After the host registers the package namespaces and loads email configuration through `@teqfw/cfg`, a component receives the send action:

```js
export default class Notify {
    constructor({email}) {
        this.send = function (to) {
            return email.act({to, subject: 'Welcome', text: 'Hello!'});
        };
    }
}
export const __deps__ = Object.freeze({
    default: Object.freeze({email: 'TeqFw_Email_Back_Act_Send$'}),
});
```

Settings use `TEQFW_EMAIL__*`; see [.env.example](.env.example). Success reports SMTP acceptance, or explicit simulation, rather than final recipient delivery. The [Agent Skill](skills/teqfw-email/SKILL.md) covers setup and outcome handling.

## Public API

Runtime access is through the `TeqFw_Email_` DI namespace:

- `TeqFw_Email_Back_Act_Send$` — submit a prepared message.
- `TeqFw_Email_Back_Service_Load$` — prepare localized template content.
- `TeqFw_Email_Back_Service_Send$` — prepare and submit a template.

The package supplies JSDoc and ambient types; its root export is type-only. Do not import runtime modules through `@teqfw/email/src/**`.

## Agent-ready package

The package aligns runtime code, type information, and a version-matched skill in `skills/teqfw-email`. Detailed configuration, message contracts, template lookup, integration examples, and verification guidance live in that skill. Host instructions and application architecture remain authoritative.

## Best fit

Use it in modular Node.js TeqFW applications that need shared SMTP submission and optional localized templates. For attachment-heavy workflows, OAuth, bulk campaigns, or delivery tracking, choose tooling that provides those capabilities.

## Add to a project

```sh
npm install @teqfw/email
```

Requires Node.js 20 or later and TeqFW cfg/log/di 2.x. The host registers namespaces and loads configuration before using email services. Existing `APP__EMAIL_*` settings require explicit host mapping.

## Boundaries

The package submits messages; it does not own application startup, recipient policy, a queue, or delivery tracking. TLS certificate validation is mandatory. There are no automatic retries; an unknown outcome after sending message data may already have been accepted. Attachments, CC/BCC, and OAuth are outside the current contract. Version 2.x changes configuration and composition from 0.x; see [CHANGELOG.md](CHANGELOG.md).

## Agent-Driven Development

TeqFW is built through the same development model that it is designed to enable: one human defines the intent, architecture, constraints, and acceptance criteria; coding agents implement and maintain the products; other agents use those products in different combinations to create applications.

`@teqfw/email` is part of TeqFW. The package includes a version-matched Agent Skill in `skills/teqfw-email`. The README provides a human-facing product overview; the skill provides agents with the package concepts, contracts, integration rules, examples, and boundaries.

Mount the skill into a host project:

```sh
mkdir -p .agents/skills
ln -s ../../node_modules/@teqfw/email/skills/teqfw-email \
  .agents/skills/teqfw-email
```

Each TeqFW package is both a practical software component and a working demonstration of human-governed, agent-driven development. This work follows the Agent-Driven Software Management (ADSM) approach: human intent, architectural authority, acceptance, and responsibility remain authoritative; agents act as implementation and reasoning partners.

- [Tequila Framework](https://teqfw.com/?from=github-teqfw-email)
- [Agent-Driven Software Management: A Practical Guide](http://fly.wiredgeese.com/flancer/leanpub/adsm-en/?from=github-teqfw-email)
- [Alex Gusev](https://github.com/flancer64)
