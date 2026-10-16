# Shadcn registry metadata probes

Research recorded 2026-10-16 with shadcn 4.21.5. These files preserve the local
CLI/MCP visibility experiment behind the
[Foldkit discovery plan](../../plan/shadcn-registry-and-foldkit-discovery-plan.md).

## Fixture and results

- metadata-probe.json is a local universal item with custom meta.crease, docs,
  categories and two explicit file targets. Its metadata shape is a research
  example, not an implemented Crease contract.
- metadata-probe-view.json is the direct CLI view response. It retains the
  metadata, documentation, categories and source content.
- metadata-probe-mcp.json is the actual stdio MCP response for the same fixture.
  It includes the name, description, item type and file count. It does not include
  meta.crease, docs or source content.
- observations.json records the comparisons and artifact hashes.

No probe source or guide was installed into the consumer. This experiment proves
inspection behavior, not safe installation/merging of arbitrary project config.

## Reproduction

From the Crease repository root, inspect the fixture with:

```sh
npx --yes shadcn@4.21.5 view ./docs/research/shadcn-registry-2026-10-16/metadata-probe.json
```

For the MCP comparison, start shadcn 4.21.5 in mcp mode with a compatible stdio
client and the same working directory, then call:

```json
{
  "name": "view_items_in_registries",
  "arguments": {
    "items": [
      "./docs/research/shadcn-registry-2026-10-16/metadata-probe.json"
    ]
  }
}
```

The original probe ran from creaseui-demo using the fixture under
output/shadcn-research. The recorded payloads are copied without rewriting their
contents. The installed package's formatter was inspected to confirm the
summary projection. Retest after changing the tool version.

## Other observed discovery behavior

The pinned Crease repository at 244b4c79cf901a28f7e2e8d57a9b4dd59aaee390 was
searchable for Sidebar and dashboard-01 through the CLI. Its Sidebar item did not
contain meta, docs or categories.

In the archived consumer, info --json returned Vite, Tailwind v4, Radix base,
React documentation links, only the default shadcn registry and components: [].
Crease component source was nevertheless present under src/ui. This is the
observed project-context mismatch; the metadata probe does not determine the
upstream implementation's component-detection algorithm.

One dashboard search invocation printed a Windows libuv assertion after returning
its result. The successful view and MCP probes recorded here completed normally.
