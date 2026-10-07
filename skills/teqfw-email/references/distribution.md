# Skill Distribution

The package maintains this guidance at skills/teqfw-email and publishes it with
its runtime and type assets. The skill describes the installed package version;
verify contracts again after upgrading. It is cognitive guidance, not a runtime
component, DI namespace, executable bootstrap, or metadata extension point.

The host selects discovery. Installation must not mutate the host's agent
configuration or create links through postinstall hooks.

For a root-level .agents/skills catalog:

```sh
mkdir -p .agents/skills
ln -s ../../node_modules/@teqfw/email/skills/teqfw-email \
  .agents/skills/teqfw-email
```

Inspect any existing directory/link before mounting. The relative target is
resolved from .agents/skills, selecting the installed npm version. A package
upgrade changes the guidance selected through that link.

Global skill installation is an alternative, using the agent environment's
supported mechanism. Prefer the local link for version-aligned package guidance;
no package-owned global installer command is defined.

The entry SKILL.md is a navigator over six topical leaves, each one hop below
it. All skill documents stay inside the skill directory. Host instructions and
product/architecture decisions retain authority over package consumer guidance.
