# Upstream provenance

crease/ui is an independent implementation informed by several open-source
projects:

- [shadcn/ui](https://github.com/shadcn-ui/ui) supplies the design language,
  component inventory, token conventions, and showcase references.
- [Foldkit](https://github.com/foldkit/foldkit) and Foldkit UI supply the runtime,
  application architecture, and accessible interaction primitives.
- [Apache ECharts](https://github.com/apache/echarts) powers chart rendering.
- [Lucide](https://github.com/lucide-icons/lucide) supplies icons.

The initial prototype was assembled from the public shadcn/ui site and registry
during July 2026. The catalog and documentation were subsequently audited and
refreshed against shadcn/ui commit `41bbc12cfd39ed8d9cb8da04275479ee7ecc0612`
on 2026-08-11. That reference
records the comparison baseline; Crease remains an independent Foldkit-native
implementation rather than a byte-for-byte port.

## Policy for new and refreshed ports

Every substantial upstream refresh should record:

1. the upstream repository and commit or release,
2. the source component or registry item,
3. intentional behavioral or visual deviations, and
4. the date the comparison was verified.

Prefer a short source note in the component for local deviations and update
[component-parity.md](component-parity.md) when coverage changes. Do not vendor an
entire upstream checkout merely to preserve a reference; a commit URL and focused
notes are easier to audit.

The source-file snapshot in [upstream-shadcn.json](upstream-shadcn.json) records
the upstream UI registry inventory and Git blob ids. The weekly upstream parity
workflow fails when those focused sources change, making a refresh request
visible without vendoring the upstream repository.

Names and trademarks remain the property of their respective owners. crease/ui
is not endorsed by or affiliated with shadcn/ui.
