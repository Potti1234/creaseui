# Foldkit discovery through the shadcn registry

2026-10-16. Research and implementation handoff. Keep the compatible registry
format and transport; add Foldkit-aware project information, inspection and agent
guidance. A registry fork is not justified by the metadata requirements found so far.

The intended experience is a normal request in a new project: build a Foldkit/Vite
dashboard using Crease Sidebar, a table and charts. The agent discovers, installs,
reads and composes those components. Users should not need to prepare a component
map, choose a dashboard template or approve a series of architecture documents.

This supplements the [architecture repair](tutorial-architecture-enforcement-plan.md)
and [distribution contract](04-registry-cli-and-distribution.md). It changes the
startup proposal: improve the ordinary component workflow before introducing
special-purpose tutorial scaffolding.

## Findings from the actual consumer and registry

The archived demo is commit f723c380ca66da05acca50727b0f210949840342 on local branch
archive/tutorial-attempt-01 in creaseui-demo. The inspected Crease source is
244b4c79cf901a28f7e2e8d57a9b4dd59aaee390. Reconcile with the implementation agent's
newer branch before editing; these findings do not describe unreviewed later code.

| Probe with shadcn 4.21.5                                     | Observed result                                                                               |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| search the pinned Crease repository for sidebar              | Finds Tailwind, StyleX and Pleat Sidebar items                                                |
| search that repository for dashboard                         | Finds dashboard-01, which declares real Sidebar/Chart/DataTable dependencies                  |
| inspect the pinned Sidebar payload                           | Contains source and dependencies, but no meta, docs or categories                             |
| info --json inside the demo                                  | Reports Vite/Tailwind v4, Radix base, React documentation links and an empty components array |
| view a local item containing custom meta, docs and two files | Preserves meta, docs, categories, targets and file contents                                   |
| call MCP view_items_in_registries for that same item         | Returns name, description, type and file count; omits the custom metadata, docs and source    |

The MCP result was tested through a real stdio client, not inferred from its tool
description. The installed 4.21.5 formatter was also inspected. Do not assume the
same projection in other versions or that the CLI and MCP expose identical data.
The [probe evidence](../research/shadcn-registry-2026-10-16/README.md) is preserved.

Crease already has a component catalog, API inventory, docs-index.json, llms.txt,
llms-full.txt and a registry dependency graph. Use and improve these existing
sources. Do not invent a second catalog. The tutorial's failure also involved
ignoring available components; metadata alone cannot excuse or fix that decision.

## What the existing format can carry

Item fields already provide title/description/categories, custom meta, installation
docs, source files with destinations, package dependencies, registry dependencies
and theme values. Use these fields rather than unsupported top-level additions.
[Item specification](https://ui.shadcn.com/docs/registry/registry-item-json)

The schema permits arbitrary properties inside meta and defines docs as Markdown.
Put versioned Foldkit semantics under meta.crease and validate that namespace with
our own schema.
[Published item schema](https://ui.shadcn.com/schema/registry-item.json)

Universal items with explicit file targets can distribute framework-independent
code and configuration. Agent instructions and short integration guides can be
ordinary installed files, not just website links.
[Universal item examples](https://ui.shadcn.com/docs/registry/examples)

The root registry can include source-local catalogs. Crease already uses this
mechanism. Keep item metadata near its authoritative source.
[Registry composition](https://ui.shadcn.com/docs/registry/registry-json)

## Proposed item metadata

The shape below is illustrative, not an implemented schema. Reconcile it with
the existing artifact/contract work before choosing field names.

```json
{
  "name": "sidebar",
  "type": "registry:ui",
  "description": "Foldkit workspace navigation with header, content, footer, groups and active menu items.",
  "categories": ["foldkit", "navigation", "sidebar"],
  "meta": {
    "crease": {
      "schemaVersion": 1,
      "framework": "foldkit",
      "renderer": "tailwind",
      "contract": "crease.sidebar",
      "publicExports": [
        "sidebarProvider",
        "sidebar",
        "sidebarContent",
        "sidebarMenuButton"
      ],
      "capabilities": ["workspace-navigation", "controlled-sidebar"],
      "integration": {
        "kind": "controlled-helper",
        "optionalBehavior": "sidebar-state"
      },
      "styling": {
        "owner": "component-source",
        "themeEntry": "tokens-and-base"
      }
    }
  }
}
```

The full item still needs its real files and dependencies. Generate source paths,
exports, compatibility versions and contract references from existing authoritative
inputs. Author intent such as suitable use cases and required integration explicitly.
Do not infer all behavior from a filename or create a duplicate hand-maintained
variant inventory.

Provide, directly or through a versioned contract reference:

- Framework, selected renderer and actual compatibility baseline.
- Public render exports and implementation-only exports.
- Parent/child state ownership; required update, Command, subscription and lifecycle
  integration where applicable.
- A complete runnable example for the exact API and selected renderer.
- Style ownership, named customization locations and prohibited feature overrides.
- Supported use cases and related components, with specific known limitations.
- Quality evidence tied to actual versions, with unknown/incomplete status preserved.

Descriptions must carry enough useful context for summary-only discovery. Metadata
needs to remain available through detailed inspection; neither replaces the other.

## Distributing guides and agent instructions

Use ordinary registry:file entries for concise Foldkit integration guides,
versioned contract data and project guidance. registry:item can group those files.
Keep explicit targets and dependency relationships.

An example destination is ~/docs/crease/sidebar.md. Here ~ means the project root
in registry target syntax. Install actual source examples alongside their guide
where useful. Keep component-specific instructions with the component.

Offer a compact Crease skill for discover, inspect, install, compose and customize.
It must identify Foldkit and the selected renderer, load real local project context
and point to the exact source/complete example. A normal component request should
activate that workflow; users should not write a tutorial-specific startup plan.
Do not rely on every agent runtime automatically executing shell snippets in a
skill. If context is absent, the skill must request it through the available tool.

Preserve existing AGENTS.md and project configuration. Merge only a bounded Crease
section or install a separate guide and link it. A registry item that copies a file
does not itself provide a safe semantic merge or make instructions enforceable.

## Where a Foldkit layer is necessary

Keep shadcn as the distribution/dependency transport. Its documented public
registry and schema APIs support custom tooling; avoid importing private CLI
internals.
[Programmatic API](https://ui.shadcn.com/docs/registry/api-reference)

Extend the existing Crease CLI and, if needed, provide a small MCP adapter over
the same implementation. Proposed capabilities, not existing commands:

| Capability          | Required output                                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Project info        | Foldkit/Effect versions, renderer, aliases, installed artifact provenance, local adaptations and actual public imports |
| Search/list         | Matching Crease components and examples, selected-renderer availability, useful descriptions and install addresses     |
| Detailed inspection | meta.crease, contract, source, complete integration example, style owner, dependencies and limitations                 |
| Add/diff            | Existing transport, resolved destinations, safe preservation of customized source and updated ownership records        |
| Quality/doctor      | Actual source/CSS enforcement coverage and actionable failures, not a generic ready message                            |

Foldkit project context must take precedence over React/Radix defaults in this
workflow. Do not change the React-oriented base field to an unsupported 'foldkit'
value and expect upstream tooling to understand it.

Do not depend on current MCP summary output to convey nested metadata. Either
use the verified CLI/API inspection route in the skill or expose a focused adapter
tool returning those fields. An upstream improvement to the MCP projection may
be useful, but is not a prerequisite for the Crease workflow.

The existing MCP supports compatible registries; this is a gap in the inspected
projection and project semantics, not evidence that a new transport is necessary.
[Registry MCP guidance](https://ui.shadcn.com/docs/registry/mcp)

## Dependency reproducibility check

Current upstream documentation says dependency refs are not inherited; explicitly
pin dependencies that must be reproducible. The inspected Sidebar payload contains
unversioned Crease dependencies. An older Crease guide says refs are inherited.
Test the exact selected CLI version and correct that discrepancy before claiming
a pinned root item establishes a pinned dependency closure. This is a documented
risk requiring a resolver test, not a completed finding about all installs.
[GitHub dependency refs](https://ui.shadcn.com/docs/registry/github#dependency-refs)

## Implementation order for the agent

1. Reconcile the active branch with the observed baseline. Inventory existing
   generators, contracts, docs and installation paths before adding interfaces.
2. Add validated meta.crease plus useful descriptions/docs to one stateless item
   and Sidebar. Prove preservation through build, direct GitHub lookup and inspection.
3. Connect project info to installed ownership/provenance. Correctly identify the
   demo as Foldkit with installed components; keep actual aliases and local edits.
4. Publish complete registry examples and the compact Crease skill. Provide a
   detailed inspection path that demonstrably exposes metadata and source.
5. Use the existing transport for installation and dependency handling; test pin
   resolution and safe updates. Introduce an adapter only for the observed gaps.
6. Implement the authoring/CSS enforcement from the architecture repair plan.
   A copied component or metadata registration must not become a lint exemption.
7. Run the ordinary new-project request below with no bespoke product scaffold.

## Acceptance through a normal project request

Start from a clean supported Foldkit/Vite project with the documented standard
Crease setup and skill/tooling. Give the agent only the dashboard request.
It should find and install Sidebar, Table/DataTable and Chart, read the applicable
examples, compose their actual exports and run the app.

Verify source use and rendered interaction, not just imports or a screenshot.
An optional dashboard block is an example; it must not be mandatory. Repeat with
a different screen request and a feature added to the existing project.

Negative checks must cover missing metadata, wrong renderer, an ignored authoring
file, global component overrides, unused imports masquerading as reuse, and a
missing component. Missing components should produce an installation or API-gap
path, not silent reinvention.

Record prompts, versions, tool calls, installed items, resolved render calls,
quality results and source review. This experiment evaluates the normal user
experience; it does not promise that static analysis recognizes every semantic
reinvention. Keep the archived failed tutorial as regression evidence.
