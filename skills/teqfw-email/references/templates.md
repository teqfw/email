# Localized Templates

## Consumer Calls

`TeqFw_Email_Back_Service_Load$.execute(input)` prepares content.
`TeqFw_Email_Back_Service_Send$.execute(input)` prepares it and calls the send
action. Supply `root`, `pkg`, `templateName`, optional `vars`, and optional
`locale`, `localeDef`, `localePlugin` (each defaults to en-US). Send also needs
`to` and accepts `from`/`headers`.

```js
const result = await service.execute({
    root: applicationRoot,
    pkg: '@vendor/plugin',
    templateName: 'Welcome',
    to: recipient,
    locale: 'fr-FR',
    localeDef: 'en-US',
    localePlugin: 'en-US',
    vars: {name: 'Alex'},
    headers: {'X-Application': 'example'},
});
```

The root is an absolute host path supplied by the caller. In a CLI application
it comes from the host's computed applicationRoot; email itself has no CLI or
process cwd dependency. The host owns that fact, not email configuration.

## File And Lookup Contract

Each candidate directory contains `meta.json` with a string subject, and
`body.txt` and/or `body.html`. File contents are UTF-8. Lookup proceeds in order:

1. Unscoped host overrides: root/tmpl/email/<locale>/<template>.
2. Package-scoped host overrides: root/tmpl/email/<locale>/<pkg>/<template>.
3. Installed package templates: root/node_modules/<pkg>/etc/email/<locale>/<template>.
4. Final unscoped host override for the plugin's default language.

The first two areas try requested locale, requested language, default host
locale, then default host language. The package area also tries plugin default
locale and language. Locale path segments are lowercased; duplicates are removed
while preserving priority. Do not simplify this to one global locale-first
search: area precedence is significant.

Missing metadata continues lookup. An unreadable/malformed selected metadata
file, invalid subject, or selected template with neither body fails preparation;
it does not silently fall through to another candidate. Template files and
symlinks are trusted deployment content. Package, template, and locale arguments
use bounded grammars rejecting path traversal.

## Substitution And Results

`{{variable}}` and `{{ variable }}` match word-character names. Values are own
properties of vars, converted to strings; false and zero remain valid values.
Absent variables retain their placeholder. Substitution is literal, with no
HTML escaping or expression evaluation. The caller escapes untrusted HTML data.

Load returns `{resultCode: 'SUCCESS', subject, text?, html?}` or
`{resultCode: 'UNKNOWN_ERROR'}` for preparation failure. Send never submits
failed preparation; its results use SUCCESS/UNKNOWN_ERROR plus optional
messageId/simulated fields. Both services expose frozen `getResultCodes()`.
Send propagates the action's simulation marker; service SUCCESS alone does not
prove provider acceptance. Detailed transport failure codes are available on
the direct send action, not the template-service result.
