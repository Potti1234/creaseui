# Publishing @creaseui/lint

Only `packages/lint` is released by this workflow. The root `creaseui` package
and vendored `@pleat/*` workspaces are ignored by Changesets, and the publish
script explicitly selects `@creaseui/lint`.

## First publication

1. Log in with `npm login`. Your account must have publishing access to the
   `creaseui` npm organization.
2. Run `npm run release:lint:check`, review the package contents with
   `npm pack --workspace=@creaseui/lint --dry-run`, then publish from the root:

   ```sh
   npm publish --workspace=@creaseui/lint --access public
   ```

   Complete npm's interactive authentication if prompted. The initial version
   is `0.1.0`. Local publication does not request CI provenance.

3. Push the repository setup to `Potti1234/creaseui` on `main`.
4. In the npm settings for `@creaseui/lint`, add a GitHub Actions trusted
   publisher with these exact values:

   | Field                | Value                      |
   | -------------------- | -------------------------- |
   | Organization or user | `Potti1234`                |
   | Repository           | `creaseui`                 |
   | Workflow filename    | `publish-lint.yml`         |
   | Environment name     | Leave empty                |
   | Allowed actions      | Allow direct `npm publish` |

   The filename is entered without `.github/workflows/`. No npm token secret
   is needed. A new trusted publisher must complete a successful publication
   within two days; configure it when the next version is ready.

5. In GitHub Settings → Actions → General, enable **Allow GitHub Actions to
   create and approve pull requests**.

See [npm's trusted publishing documentation](https://docs.npmjs.com/trusted-publishers/).

## Subsequent releases

1. For a lint package change, run `npm run changeset`, select `@creaseui/lint`,
   choose patch/minor/major and describe the user-visible change. Commit the
   generated `.changeset/*.md` file with the implementation.
2. After merging to `main`, the Publish lint package workflow opens or updates
   a **Version Packages** PR. This bumps the package version, writes its
   changelog, and refreshes `package-lock.json`.
3. Merge the version PR after CI passes. The workflow runs the package tests,
   generated documentation check, and packed-consumer checks before publishing.
   It publishes with OIDC and provenance, then creates a package tag and GitHub
   release. Stable versions use `latest`; prereleases use their named tag.

The existing Release verification workflow remains available for registry and
site releases. Lint releases use their own workflow and package versions.

## Checks and retries

- `npm run release:lint:check`: lint package tests, generated lint documentation,
  and clean consumer installations for all renderers.
- `npm run version-packages`: consume pending changesets locally and refresh
  the npm lockfile. Normally run by the version PR workflow.
- `npm run release:lint`: run checks, then publish only the lint workspace.
  This command publishes; use the check command when preparing a release.
- `npm run release:lint:publish -- --dry-run`: check the registry and preview
  publication without publishing or creating release tags.
- Re-run **Publish lint package** on `main` using Actions → Run workflow if
  publication failed. The publish script skips versions already on npm and
  fails on authentication or network errors rather than treating them as new
  versions.

## Site and registry releases

1. Synchronize upstream parity and review every reported drift:

   ```sh
   npm run parity:upstream
   npm run parity:check
   ```

2. Update `compatibility.json`, the root `CHANGELOG.md`, and the root package
   version. Move the Unreleased entries into a dated version section.
3. Regenerate owned artifacts and review the diff:

   ```sh
   npm run docs:sources:generate
   npm run docs:metadata:generate
   npm run icons:adapters:generate
   npm run parity:generate
   npm run registry:generate
   ```

4. Run the full release gate:

   ```sh
   npm ci
   npm run check
   npm run test:browser
   npm run registry:build
   npm run test:registry
   ```

5. Review Playwright screenshots in light/dark desktop and light mobile modes.
   Confirm the clean consumer installed all components and every icon adapter.
6. Commit the release changes, create an annotated `vX.Y.Z` tag, and push the
   commit and tag. The release verification workflow repeats the deterministic
   checks and uploads the built site, registry JSON, and browser report.
7. Create GitHub release notes from the root changelog. Verify registry installs
   against both the tag and its full commit SHA before announcing the release.

Do not publish a release from a dirty tree or update generated artifacts without
their source inputs and generator changes.
