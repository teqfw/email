# Integration

## Package And Host Boundary

Install `@teqfw/email` in a Node.js >=20 host. Runtime dependencies are
`@teqfw/cfg` ^2.1.0, `@teqfw/log` ^2.1.2, and `@teqfw/di` ^2.11.0.
There is no nodemailer dependency. Verify actual installed versions before
relying on platform APIs.

The canonical `package.json#teqfw.fw.di.namespaces` entry is:

```json
{"prefix": "TeqFw_Email_", "path": "./src", "ext": ".mjs"}
```

The host registers the dependency graph before first resolution, loads cfg once,
and selects shared logging policy. Email does not create a Container, participate
in a CLI lifecycle, or own a metadata extension point.

| Identifier | Supported role |
| --- | --- |
| `TeqFw_Email_Back_Act_Send$` | Submit prepared content through `act(input)`. |
| `TeqFw_Email_Back_Service_Load$` | Prepare template content through `execute(input)`. |
| `TeqFw_Email_Back_Service_Send$` | Prepare and submit a template through `execute(input)`. |
| `TeqFw_Email_Config$` | Get validated immutable settings through `get()`. |

Message composition, path selection, and SMTP transport are supporting
components. Consumer features should normally use the action or service rather
than bypass their validation and outcome boundaries.

## Inject A Consumer

```js
// @ts-check
/**
 * @namespace App_Notify
 * @description Sends an application notification.
 */
export default class Notify {
    /**
     * @param {object} deps
     * @param {TeqFw_Email_Back_Act_Send} deps.send
     */
    constructor({send}) {
        /**
         * @param {string} to
         * @returns {Promise<TeqFw_Email_SendResult>}
         */
        this.execute = function (to) {
            return send.act({to, subject: 'Welcome', text: 'Hello!', html: '<p>Hello!</p>'});
        };
    }
}
export const __deps__ = Object.freeze({
    default: Object.freeze({send: 'TeqFw_Email_Back_Act_Send$'}),
});
```

Runtime components receive dependencies; only the host composition root resolves
Container entry points. Host-selected cfg Sources must finish loading before
email settings are materialized.

## Standalone Namespace Composition

These public imports belong only to a Node.js composition root:

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import Container from '@teqfw/di';
import NamespaceRegistry from '@teqfw/di/node/registry/namespace';

const appRoot = '/absolute/path/to/application';
const entries = await new NamespaceRegistry({fs, path, appRoot}).build();
const container = new Container({
    namespaces: entries.map(({prefix, dirAbs, ext}) => ({prefix, target: dirAbs, defaultExt: ext})),
});
```

Register all namespace mappings before resolution and use sequential deliberate
bootstrap/application entries. A CLI host uses its own composition and startup
protocol instead of creating a second Container.

## Types And Migration

The root export of `@teqfw/email` is type-only. No runtime bare import or
`@teqfw/email/src/**` import is supported. The host compiler includes the
package's ambient declarations; one TypeScript-facing inclusion is
`import type {} from '@teqfw/email';` in a host declaration module.
JSDoc component instance aliases use base names such as
`TeqFw_Email_Back_Act_Send`; `$` is only for runtime identifiers.
Verify compiler wiring with an actual consumer typecheck.

2.x replaces core configuration, implicit constructor dependency keys, old DTOs,
and `teqfw.json`. Existing send/service identifiers keep their responsibilities,
but localized template calls now require an explicit host root. This is a
breaking migration from 0.x, not a compatibility shim.
