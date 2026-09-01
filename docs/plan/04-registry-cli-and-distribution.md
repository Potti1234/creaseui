# Registry, CLI, and distribution plan

## Distribution strategy

Use the shadcn registry as a source transport and dependency resolver. Build Crease
configuration, diagnostics, architecture metadata, and wiring generation on top of it.

The transport is replaceable. The installed output must remain ordinary Foldkit source
that does not require a hidden Crease runtime.

## Crease project configuration

Introduce `crease.json` with a versioned JSON Schema.

```json
{
  "$schema": "https://creaseui.com/schema/crease.json",
  "style": "tailwind",
  "theme": "crease",
  "icons": "lucide",
  "rendering": "spa",
  "aliases": {
    "ui": "@/ui",
    "features": "@/features",
    "lib": "@/lib"
  },
  "compatibility": {
    "foldkit": "0.152.x",
    "foldkitUi": "0.152.x",
    "effect": "4.0.0-rc.x"
  }
}
```

Required fields:

- styling backend;
- theme preset;
- icon adapter;
- rendering mode: SPA, SSG, SSR, or embedded;
- output aliases;
- supported compatibility channel.

Optional fields:

- direction strategy;
- reduced-motion policy;
- registry namespaces;
- experimental feature opt-ins;
- code style and formatter integration;
- default feature output directory.

Continue reading `components.json` for shadcn transport settings. `crease.json` owns
Foldkit-specific meaning so users are not forced to encode it in React-oriented fields.

## Registry metadata extensions

Every registry item must expose generated Crease metadata:

```json
{
  "crease": {
    "kind": "interaction-submodel",
    "stability": "stable",
    "stateOwnership": {
      "component": ["isOpen", "activeIndex"],
      "parent": ["selectedValue"]
    },
    "requires": {
      "commands": true,
      "subscriptions": false,
      "mount": false,
      "services": []
    },
    "rendering": "supported",
    "skins": ["tailwind", "stylex"],
    "compatibility": {
      "foldkit": "0.152.x",
      "foldkitUi": "0.152.x"
    },
    "evidence": {
      "behavior": "verified",
      "accessibility": "verified",
      "visual": "verified",
      "composition": "verified"
    }
  }
}
```

If the shadcn registry schema cannot carry custom fields safely, publish a parallel
generated `crease-registry.json` keyed by item name and version.

## CLI command contract

### `crease init`

Responsibilities:

1. inspect package manager and existing project files;
2. detect Foldkit, Effect, Vite plugin, Tailwind, and StyleX versions;
3. ask only for choices that cannot be inferred safely;
4. write or merge `crease.json`;
5. install theme and selected icon adapter;
6. validate aliases across TypeScript, Vite, tests, and the registry transport;
7. print the exact compatibility baseline;
8. make no unrelated application changes.

### `crease list`

Show:

- artifact name;
- classification;
- stability;
- installed state;
- supported skins;
- SSR policy;
- required integration mechanisms;
- current quality evidence.

Support filters by kind, stability, skin, and capability.

### `crease inspect <artifact>`

Print before installation:

- source files and destinations;
- package and registry dependencies;
- state ownership summary;
- exported public API;
- parent integration requirements;
- compatibility range;
- quality evidence;
- intentional differences and limitations.

### `crease add <artifact...>`

Required behavior:

1. run strict compatibility checks;
2. resolve the chosen skin and icon adapter;
3. preview collisions with existing files;
4. install through the registry transport;
5. never overwrite changed files without explicit authorization;
6. run a focused typecheck or report why it cannot;
7. print required next integration steps.

For stateless helpers, installation ends with an import example.

For stateful artifacts, installation prints or writes a parent integration guide with:

- Model field;
- init field;
- `Got*Message` wrapper;
- child fold configuration;
- OutMessage fold;
- `h.submodel` call;
- required Commands, Subscriptions, Mounts, or layers.

### `crease add <artifact> --integration <feature>`

Generate an explicit integration capsule inside the chosen feature directory. The CLI
must parse existing code before editing it. If it cannot identify a safe insertion
point, generate standalone files and print manual steps instead of guessing.

Generated wiring must be readable and owned by the consumer. It may not import an
opaque runtime wrapper that hides update delegation.

### `crease diff <artifact>`

Show:

- current local file versus registry source;
- compatibility changes;
- generated-file changes separately from authored-file changes;
- public API changes;
- migration notes;
- changes in quality status.

### `crease upgrade <artifact...>`

Default to preview. Applying changes requires an explicit write flag. Before writing:

- detect local modifications;
- stop on conflicts;
- preserve consumer-owned code;
- run available codemods only after preview;
- back up or use version control awareness for changed files;
- validate the consumer after the merge.

### `crease doctor`

Strict doctor checks:

- `package.json` exists and uses a supported Node version;
- Foldkit, `@foldkit/ui`, Effect, Vite plugin, Vite, and styling packages are compatible;
- only one effective Foldkit version is installed;
- `crease.json`, `components.json`, aliases, and CSS entry points agree;
- generated theme markers and semantic variables exist;
- icon adapter matches registry imports;
- TypeScript module resolution supports configured aliases;
- Vite and test aliases agree;
- current rendering mode is compatible with installed artifacts;
- installed artifact metadata is available;
- generated files are not stale;
- known deprecated APIs are reported with migrations.

Doctor output must distinguish errors, warnings, and informational findings. Add a
machine-readable JSON output mode for CI and agents.

## Compatibility policy

Maintain a generated compatibility matrix containing:

- Crease release line;
- exact tested Foldkit version;
- compatible Foldkit range;
- exact tested `@foldkit/ui` version;
- exact tested Effect version;
- Vite plugin range;
- rendering modes tested;
- Tailwind and StyleX versions;
- known breaking differences;
- date and commit of the last full verification.

Rules:

- package dependencies, compatibility JSON, registry metadata, prose docs, examples,
  and CI fixtures must derive from one canonical baseline file;
- CI fails on disagreement;
- minor Foldkit upgrades require a branch or explicit work item;
- registry URLs should support tag or commit pinning;
- published examples use a released compatibility baseline, not floating latest.

## Registry item groups

Organize discoverability without forcing runtime packages:

```text
@crease/theme/*
@crease/icons/*
@crease/tailwind/*
@crease/stylex/*
@crease/recipe/*
@crease/block/*
@crease/tooling/*
```

If the public registry remains GitHub-addressed initially, reflect these groups in item
names and metadata until a namespace is available.

## Upgrade safety

- Never use unconditional overwrite as the standard upgrade path.
- Track installed artifact version and source hash in a local lock file.
- Distinguish untouched upstream source from consumer modifications.
- Produce three-way merge inputs where possible.
- Make generated style files reproducible so they can be replaced safely.
- Keep authored integration code separate from replaceable generated artifacts.
- Document every breaking public API change in a migration ledger.

## Acceptance criteria

- [ ] A clean Foldkit consumer can initialize Crease without React.
- [ ] `crease doctor --json` identifies a deliberately mismatched Foldkit version.
- [ ] Installing a render helper requires no fake Model wiring.
- [ ] Installing a Submodel explains and optionally generates complete parent wiring.
- [ ] Installing a recipe writes multiple files to the configured feature alias.
- [ ] Tailwind and StyleX resolve the same behavior artifact.
- [ ] Upgrade preview detects a locally modified component.
- [ ] No normal command overwrites local changes without explicit authorization.
- [ ] Version drift between package, metadata, and docs fails CI.

