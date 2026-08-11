# Security policy

## Supported versions

Crease UI is pre-1.0. Until the first tagged release, security fixes target the
latest commit on `main`. After releases begin, the current minor line receives
security fixes; older minor lines receive fixes only when explicitly listed
here.

| Version | Supported |
| --- | --- |
| `main` / latest `0.x` | Yes |
| Older `0.x` lines | No |

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub's private
vulnerability reporting or open a private security advisory in
`Potti1234/creaseui`. Include affected registry items, a minimal reproduction,
impact, and any known mitigation.

Maintainers should acknowledge a report within seven days, confirm severity and
scope privately, prepare a fix and regression test, and coordinate disclosure
after a patched commit or tag is available. No response-time promise should be
read as a warranty; Crease UI is provided under the MIT license.

## Security boundaries

Registry items copy TypeScript and CSS into the consumer. Review generated files
before accepting changes, pin installs to a trusted tag or commit for production,
and retain the consumer application's dependency and content-security policies.
Create presets may include Google Fonts imports; self-host or remove them where
remote font requests are not permitted.
