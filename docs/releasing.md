# Release procedure

1. Synchronize upstream parity and review every reported drift:

   ```sh
   npm run parity:upstream
   npm run parity:check
   ```

2. Update `compatibility.json`, `CHANGELOG.md`, and the package version. Move the
   Unreleased entries into a dated version section.
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
   commit and tag. The release workflow repeats the deterministic checks and
   uploads the built site, registry JSON, and browser report.
7. Create GitHub release notes from the changelog. Verify registry installs
   against both the tag and its full commit SHA before announcing the release.

Do not publish a release from a dirty tree or update generated artifacts without
their source inputs and generator changes.
