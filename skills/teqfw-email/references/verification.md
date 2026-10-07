# Verification

## Consumer Integration

Before reporting successful integration:

- Inspect the installed manifest's versions, namespace mapping, export surface,
  and publication assets; do not infer them from a legacy package.
- Register actual dependency namespaces and resolve the action/service through
  a real Container. Verify the host's cfg Source load completes first.
- Exercise typed settings conversion and invalid/missing key handling without
  exposing values. Check explicit APP mapping when the host uses that namespace.
- Run a consumer compiler check including the package's ambient types.
- Use simulation for network-free content validation; inspect simulated results
  separately from actual SMTP acceptance.
- Use a controlled SMTP/TLS fixture to verify TLS trust, STARTTLS re-EHLO,
  authentication, recipient rejection, deadlines, and cleanup when changing
  transport integration. Do not treat fixture success as live delivery proof.
- Verify template lookup priority, caller-provided root, variable safety, and
  failure results when adopting the template services.

If modifying this package, run its npm tests and typecheck, the TeqFW topology
validator, and base/type-regular ESM validation against the source scope.
Unit modules own one production component; composition tests belong at
integration level. Use the repository's current instructions for exact commands.
Do not require unrelated host code to follow this package's test layout.

## Skill And Artifact Review

Check valid frontmatter, internal Markdown links, bounded navigator fan-out,
self-contained references, and consistency with current runtime contracts.
Inspect `npm pack --dry-run`: the skill and runtime/type assets must be included;
private context, host agent configuration, tests, and test credentials excluded.
A packed-consumer check should verify that runtime and type resolution work from
an unpacked artifact, rather than accidentally using development source.

Do not send live test messages solely because credentials are available. Follow
host authorization and recipient policy. Report the bounded checks performed
and any provider/TLS/authentication facts not observed.
