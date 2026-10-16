# Product policy AI editing permissions and continuous maintenance

Date: 2026-10-15. Status: tooling and documentation implementation specification.

Consumers own their Crease-derived design system. They can change tokens, edit
installed component source, remove public props, introduce new product patterns,
and define local rules. The [guide series](design-system-guide-series-plan.md)
must teach how those choices become a consistent, enforceable, maintainable system.

This specification covers the supporting tooling, consumer policy, AI task
instructions, and repository integration. It complements the
[tutorial specification](design-system-tutorial-spec.md) and reuses the existing
[consumer lint delivery plan](consumer-ui-lint-delivery-plan.md).

The selected application is a focused Linear-inspired task manager, starting
with Tailwind and client-side persisted sample data, without a backend. The user
will create its separate repository, creaseui-demo. The
[discovery/version plan](tutorial-product-discovery-and-repository-plan.md) and
[Linear research](linear-task-manager-design-research.md) govern its product
scope and branches. Keep product source/policy and Crease foundation changes in
their respective repositories, with explicit cross-repository task scope.

The first local slice exposed an enforcement failure: closed product APIs hid
global component CSS and rebuilt foundations inside ignored authoring files.
The [architecture repair plan](tutorial-architecture-enforcement-plan.md)
adds the checked authoring, stylesheet ownership, reuse evidence and policy-change
fixtures required before accepting that source as a tutorial checkpoint.

## Three meanings of permission

| Permission            | Example                                                                                                                  | Mechanism and limit                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Component usage       | Feature code can use the product Button but cannot restyle or reach its internal implementation                          | Public API, typed contract, binding-aware lint and actual implementation behavior                                      |
| Task editing scope    | An AI feature task may edit feature source and its tests; a system-change task may also edit named components and policy | Task instructions and, where configured, tool/filesystem restrictions; instructions alone are advisory                 |
| Integration authority | Changes to product policy or enforcement need the project's designated review                                            | Protected integration rules and independently enforced checks; lint cannot prevent its own configuration being changed |

Document these separately. Registration means an implementation is classified
and checked; it does not prove quality or authorize arbitrary source edits.
CODEOWNERS identifies reviewers. Required owner review and protected branch or
ruleset configuration are necessary to enforce review at merge.

Do not call this application-user authorization or runtime access control.
The topic is design-system usage and development workflow permissions.

## Crease defaults and consumer decisions

Crease supplies working defaults and reusable checks. A product policy determines
which approved components, variants, placement options, themes, and page patterns
its application uses. A consumer may narrow a component or deliberately replace
a visual default without requesting upstream approval.

Keep configuration validation, exact ownership, renderer validity, unresolved
contract handling, and applicable semantic/behavior checks active. Do not encode
one product's card, tab, button density, save, or confirmation preference as a
mandatory global Crease aesthetic rule.

Strict application composition remains the default for the tutorial: raw controls,
layout, and text require an approved local component or exact registered
implementation. A new product component is a normal extension of that vocabulary.

### Policy composition

Reuse the existing configuration factory and ownership schema. Add the minimum
supported extension for consumer policy rather than a competing strict preset,
receipt, or rule engine.

The effective policy must resolve:

1. Installed artifact provenance and exact implementation/export ownership.
2. The consumer's canonical public contract for locally adapted components.
3. Applicable shared safety, renderer, token, and behavior constraints.
4. Explicit product restrictions and contextual choices.
5. Bounded migration exceptions with their effective scope.

Define and test precedence before publishing configuration examples. Conflicting
roles, ambiguous export ownership, unsupported declarations, and incompatible
versions are configuration errors. A local contract replacing a visual choice
must be distinguishable from an accidental conflicting declaration.

Consumer policy can narrow a public surface or replace an explicitly customizable
visual contract. It cannot silently turn off unresolved handling or mark every
feature file as an unchecked renderer implementation.

The local project decides its policy authority and review process. Crease does
not provide a remote permission service or require a maintainer to approve routine
consumer component edits.

## Component contracts

A product contract needs enough information to describe actual source:

- Stable contract identity and the exact public exports it covers.
- Export classification: rendering helper, Submodel, or non-rendering utility.
- Public semantic and behavioral props, content/region slots, finite variants,
  default behavior, and prohibited appearance inputs.
- Component-specific placement fields and allowed values or constructors.
- Contextual options such as a named toolbar size, with their scope.
- Implementation-only exports and the exact files allowed to compose them.
- Applicable rendered metadata and behavior obligations.
- Links to intent, guidance, examples, and verification.

Extend the canonical registry/local contract model from the existing plans.
Machine-readable ownership and human rationale serve different purposes, but
must refer to the same component identities. Avoid parallel per-renderer policy
lists and manual copies of every variant union in unrelated manifests.

The implementation can generate some fields from source and require explicit
semantic declarations for others. Specify the authoritative source for each
field and verify agreement among types, runtime branches, lint metadata, and docs.
Type inference alone cannot recover intent, focus responsibility, or save policy.

### Normal customization operations

| Change                 | Update together                                                 | Required check                                                   |
| ---------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------- |
| Remove a prop          | Public type, runtime use/forwarding, contract and examples      | Fresh literal plus variable/spread negative                      |
| Remove a variant       | Type/definition, implementation branch, contract and callers    | Removed value fails, supported runtime choices pass              |
| Add a semantic variant | Named implementation choice, finite contract, guidance          | States and placement remain valid                                |
| Change theme values    | Registered theme and affected role mapping                      | Applicable contrast, states, scope and visual checks             |
| Add a pattern          | Structured API, rationale, composition and state responsibility | Positive and misuse examples plus actual interaction if stateful |
| Introduce an adapter   | Exact implementation/lifecycle contract                         | Dynamic properties, cleanup and accessibility as applicable      |

Do not teach consumers that deleting a property from documentation or applying
Omit alone creates an exact runtime surface. Explain structural typing and props
forwarding. Use explicit runtime mapping or direct source removal and check the
contracted fields.

If the source is locally edited, preserve ownership and provenance. Detect stale
contract/type/runtime relationships and give a precise repair action. A source
hash change is useful upgrade information; it is neither an automatic lint
exemption nor proof that every contract field is wrong.

## Common restrictions through configuration

Provide declarative support before asking users to write a rule for common cases:

- Approved public components and implementation visibility.
- Allowed variants, forbidden props and required semantic props.
- Component-specific placement, including component-owned height/shape.
- Supported structured content/region constraints.
- Explicit contexts for additional product choices.
- Exact implementation roles and bounded migration scope.

Validate the configuration schema and report unsupported constraints. Do not
accept an option merely to ignore it later. Where arbitrary dynamic composition
cannot be proven, require a more structured API, report the unresolved supported
case, or document the separate verification; do not claim universal AST inference.

Show how another product can legitimately choose different commit or composition
policies. Within the task manager, a quick property selection and a multi-field
composer already illustrate different commit boundaries. Keep that distinction
without weakening generic source checks or banning all dialogs.

## Public rule authoring support

Current internal resolver modules are not a supported consumer API. D1 must
inventory the merged implementation and deliver a documented, versioned public
surface before the tutorial imports any helper.

Specify capabilities first; choose final export names and package subpaths in
the implementation brief. Any names in prose examples before that decision are
illustrative and cannot appear as copyable release instructions.

### Required helper capabilities

1. Resolve a call or referenced export to its actual component/contract identity
   using the consumer TypeScript project and scope bindings.
2. Follow supported import aliases, local const aliases, namespace aliases,
   destructuring, constant computed access, relative paths and barrel re-exports.
3. Read the relevant props argument, supported static spreads, overwrite order,
   branch choices, and finite runtime variants.
4. Expose effective application/implementation scope and public visibility.
5. Return structured known, unresolved, or not-a-contracted-UI-operation results.
6. Produce consistent diagnostic locations, contract IDs, guidance and replacements.
7. Reuse the existing cached program/resolution service instead of constructing
   an independent TypeScript program for each custom rule.

Do not expose mutable internal ownership maps or require consumers to depend on
private file layouts. A helper failure cannot return the same result as proven
non-UI code. Avoid duplicate reports when the base strict rule already owns an
unresolved operation; define which rule reports the issue.

Source-only rule authoring must not import browser audits, launch a browser, or
depend on the documentation app. Verify the public helpers and declarations from
the packed lint artifact in a clean consumer.

### Local plugin tutorial

Teach a conventional local ESLint plugin and flat-config integration.
The first example, with proposed local rule ID product/no-base-component-in-features,
requires the product facade for declared feature scope.

The rule identifies export origin and contract identity rather than matching
callee spelling. It allows the internal implementation to compose the base
component in its exact declared role. It preserves legitimate type, state,
Message, init/update, and non-rendering imports.

The second example, with proposed local rule ID product/use-property-picker,
checks an explicitly declared issue-property editing slot against the product's
approved picker contract. Declare how the slot is identified and which API
construction the rule supports. Do not infer intent merely from a filename,
ban every Dialog, or claim to analyze arbitrary dynamic Html trees. Prefer a
structured product API with a clear, testable boundary.

Each rule lesson includes its rationale, schema, implementation, configuration,
diagnostics, positive/negative tests, analysis limits, and safe migration guidance.
Messages name the product decision and a usable alternative.

Required cases include direct and renamed imports, namespace/local aliases,
destructuring, re-export chains, shadowed bindings, supported spreads, opaque
values, finite runtime choices, and unrelated business objects. A test must
assert the intended rule/diagnostic rather than any generic lint failure.

Automatic fixes are limited to proven equivalent edits. Changing save semantics,
inserting a stateful dialog, or choosing a destructive workflow needs deliberate
code changes and verification.

## AI context and discovery

Provide one concise consumer agent entry document, with nested guidance only
where useful. Include:

- The product purpose, active renderer and compatibility baseline.
- Links to principles, public components, named patterns, and complete examples.
- The effective feature versus system editing scopes.
- Actual lint, type, behavior and browser check commands.
- How to report a missing capability and how authorized system changes proceed.
- The expected evidence and change report.

Use a structured catalog linking intent, use-when/avoid-when guidance, public
exports, examples, and contract IDs. Generate discovery from the same authored
sources as the docs and registry. Extend existing search/agent outputs when
present; do not make a new server or protocol a prerequisite.

Expose a small context bundle per pattern, including relevant source and tests.
Record its version so AI work does not unknowingly combine instructions from one
contract release with source from another.

Names such as ToolbarAction or IssuePropertyPicker refer to consumer
patterns. The guide must not suggest they are pre-existing Crease exports.

## Editing scopes and task authorization

Offer a concrete default for the task manager that consumers can adapt:

| Task                      | Intended edit scope                                                                       | Requires an explicit broader task when absent                                 |
| ------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Feature implementation    | Feature Model/Message/update/view, content, feature tests and examples                    | New system API, raw renderer implementation, policy or CI changes             |
| Component or theme change | Named system source, its contracts, examples, tests and affected callers                  | Unrelated patterns, global enforcement changes, unrelated dependency upgrades |
| Policy or rule change     | Named policy/rule source, fixtures, docs and migrations                                   | Weakening unrelated checks or granting broad implementation access            |
| Upstream update           | Declared artifacts, dependency/compatibility changes needed by them, migrations and proof | Overwriting unrelated local customization                                     |

These are default task scopes, not a permanent ban on system edits. User or
project-owner authorization persists for the task and may already cover the
necessary next action. Do not add repeated approval requests for routine work.
An agent with a system-change assignment should finish the authorized source,
tests, migration, and reviewable result.

If an ordinary feature task encounters a genuine missing concept, produce a short
gap report: requested outcome, closest existing pattern, the missing decision,
proposed small extension, and affected evidence. Continue independent authorized
work. Do not silently modify policy to make the feature pass.

### Feature task template

```text
Implement <feature> in the <product> application using <named pattern>.
Read <agent entry>, the relevant pattern guidance, and its complete example.
Use public product components and the current <renderer> contract.
The task permits edits to <feature files and tests>.
Preserve system source, policy, registration, dependencies, and verification scope
unless this task or existing project authorization explicitly covers a change.
Run <actual focused commands> and the applicable interaction checks.
If the current vocabulary cannot express the feature, report the specific gap and
the smallest proposed system change; continue independent work within scope.
Report changed behavior, evidence, remaining gaps, and any system-change need.
```

### System change task template

```text
Change <named component/pattern/theme> to support <product decision>.
This task authorizes edits to <system source>, its contract/guidance/tests,
the necessary affected callers, and <explicit policy or registration changes>.
Preserve <existing invariants> and the feature boundary.
Update public types, runtime behavior, contract metadata, examples, and callers.
Run <actual checks>, including <specific misuse and behavior scenarios>.
Produce the complete reviewable change and migration note.
Do not weaken unrelated checks or broaden implementation ownership.
```

Publish a matching migration and upgrade template with the exact artifact scope,
expected retained local decisions, and compatibility evidence. Keep templates
short; link detailed guidance rather than copying the entire system into every task.

The task envelope also identifies repository, working branch, baseline commit
and permitted version updates. Ordinary product work happens in creaseui-demo;
it does not automatically authorize edits in Crease. A missing generic capability
gets a scoped foundation change, then an explicit dependency update in the app.
Version creation and publication follow the selected task scope and the user's
repository setup; this planning work does not create a remote repository.

## Enforcing the intended boundary

The guide must distinguish local development guidance from an enforced integration
gate. If an agent can edit policy, tests, workflows, and the source at the same
time, a passing local command alone cannot establish that the policy was preserved.

Teach these complementary controls:

1. Public APIs and runtime mappings limit ordinary component use.
2. Strict source rules reject raw composition, appearance escapes, private export
   access, and unsupported unverifiable contracted operations.
3. Independent integration checks detect edits outside the declared scope and
   changes to policy, registration, ignore lists, dependencies, tests or workflows.
4. Project-owned review/branch rules control integration of sensitive system changes.
5. Execution tools can restrict filesystem or command access where the selected
   agent environment actually supports it.

A repository-local instruction file does not restrict filesystem access.
CODEOWNERS alone does not prevent edits or merges. CI files inside a change are
themselves editable source. Explain where each project enforces its trusted check:
for example a separately controlled integration workflow and required review on
policy/workflow paths. Describe the default branch and bypass settings needed for
that setup, and verify them in the chosen hosting environment.

Show a provider-neutral setup first and an optional GitHub example. The GitHub
example includes owner coverage for the ownership file itself, lint policy,
workflows, and system contracts; required code-owner review/status checks on the
integration branch; and the relevant bypass limitations. Creating those files
does not automatically activate hosting protections.

Do not execute untrusted proposed code with elevated repository credentials in
order to run a policy check. Use the host's documented trust model and ordinary
isolated test execution. The tutorial frontend itself requires no service credentials.

The implementation assignment is to document and test the example workflow. It
does not authorize changing the user's hosting permissions, adding reviewers,
publishing a package, or enabling a remote protection policy.

### Permission acceptance exercises

- Ordinary feature use of a public product component passes.
- The same feature's direct/aliased access to an implementation export fails.
- A neighboring file cannot inherit a raw grant from a directory name.
- An unscoped task that changes an ignore list or ownership grant is caught by the
  configured independent integration check.
- Editing policy and its local lint configuration together does not constitute
  proof that the protected integration check passed.
- A properly authorized system-change task can update source, contract and tests
  without suppressing applicable authoring checks.
- The guide states when a workflow is only advisory and which configured control
  actually blocks integration. Unsupported controls are not shown as active.

These exercises concern source/integration permissions, not runtime user roles.

## Continuous evolution and maintenance

Teach one repeatable loop:

1. Observe a recurring override request, exception, awkward call site, or bug.
2. Identify whether the cause is a missing variant, an implementation defect,
   a new product pattern, unclear guidance, or an intentional one-off need.
3. Record the decision and authorized scope.
4. Update the canonical source/API/contract and applicable examples/tests.
5. Migrate callers and remove obsolete exceptions or compatibility paths.
6. Verify behavior, rendering, source boundaries and the actual installed artifact.
7. Update discovery/guidance and record the resulting version.

Keep an inventory of suppressions, local extensions, repeated variant requests,
component edits and CSS that targets component internals. Group by stable contract
and reason, not generated engine class names. An inventory exposes maintenance
needs; counts alone do not establish that a customization is good or bad.

For each exception record purpose, exact scope, responsible owner/team, intended
replacement or reason it remains valid, and a review trigger. Expiration can be
useful but is a product policy choice. Report unused/obsolete exceptions. Prevent
an exception from silently disabling source checks across the application.

### Local API migration

The tutorial removes an option and migrates its actual call sites, guidance and
negative fixtures. Where a staged migration is needed, scope compatibility to
named old consumers/files and keep new code strict. Present migration helpers
only for transformations that preserve behavior; review semantic workflow changes.

Policy changes have their own impact: a new rule can break consumers even when a
component's type did not change. Document the policy and component compatibility
together. Avoid freezing every visual decision forever through undocumented rules.

### Upstream source updates

Retain the installed upstream reference, the earlier base source or a retrievable
pinned equivalent, local modifications, and dependency information needed for an
upgrade comparison. Reuse existing install/receipt provenance.

The exercise compares earlier upstream, local adapted source, and newer upstream.
Integrate a real fix while preserving the product's public API and policy. Review
conflicts at the affected contract rather than overwriting the local component.
Then update types, behavior, CSS, metadata and consumer proof as applicable.

If an upgrade preview command does not exist on the delivered baseline, teach the
working manual comparison and label proposed automation as future work. The series
may not present a fictional CLI as a completed maintenance capability.

### Sharing a product system

Start with the separate creaseui-demo application repository. Then show how a product can distribute components,
tokens, patterns, contracts, guidance and lint policy through its chosen registry
or package. Include the consumer setup and version compatibility.

The receiving project installs its chosen renderer and public vocabulary.
Product-specific policy does not become a global Crease default merely because
the product publishes it.

## Verification and delivery

The D1/D4 implementation work must prove schema validation, consumer policy
precedence, source/contract consistency, public helper packaging, meaningful
resolver cases, diagnostic quality, and optional browser isolation.

D5 must include actual example task artifacts for both scopes and the permission
acceptance exercises. Where evaluating an AI run is part of the guide, record
tool environment, available controls, instructions and source result. A polished
transcript alone is insufficient evidence that a boundary was enforced.

D6 must include a real migration, bounded exception lifecycle, upstream comparison
and second consumer installation. Reuse the existing implementation ledger and
quality vocabulary. Report partial capabilities rather than substituting a
mock implementation.

The final docs should help a reader answer four questions for any change: which
decision belongs to the product, where it is encoded, who may change it in this
task, and what verifies the resulting behavior.

## Source references

- [ESLint custom rules](https://eslint.org/docs/latest/extend/custom-rules):
  rule structure, schemas, diagnostics, suggestions and rule tests.
- [ESLint plugins](https://eslint.org/docs/latest/extend/plugins):
  local or distributed plugin integration.
- [TypeScript object types](https://www.typescriptlang.org/docs/handbook/2/objects.html#excess-property-checks):
  structural typing and the limits of excess-property checks.
- [GitHub code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners):
  owner matching and required-review configuration.
- [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches):
  protected integration settings and bypass behavior.
- [Rothenberg on component overrides](https://mattrothenberg.com/notes/classname-considered-harmful/),
  [named design vocabulary](https://mattrothenberg.com/notes/design-system-language/),
  and [reusable product decisions](https://mattrothenberg.com/notes/you-dont-have-a-design-system/):
  background for customization inventories, discoverable patterns and product policy.
