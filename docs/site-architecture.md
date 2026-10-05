# Renderer sites

`creaseui.com` serves the Tailwind build. `stylex.creaseui.com` serves the
StyleX build. Both expose the landing page, component documentation, Create,
charts, and blocks at the same paths. The header links to the counterpart URL,
including its query string and fragment. Theme preferences and interactive
state belong to each origin; following the link starts a new application.

## Local development and builds

| Site     | Development                   | Production preview                | Build output    |
| -------- | ----------------------------- | --------------------------------- | --------------- |
| Tailwind | `npm run dev:tailwind` (5173) | `npm run preview:tailwind` (4173) | `dist/tailwind` |
| StyleX   | `npm run dev:stylex` (5174)   | `npm run preview:stylex` (4174)   | `dist/stylex`   |

Run the two servers in separate terminals. The header recognizes localhost
and 127.0.0.1 and links between the matching development or preview ports.
`npm run build` builds both outputs; `build:tailwind` and `build:stylex` build
one. The default `dev` and `preview` commands use Tailwind.

Vite chooses a renderer at build time. The shared Foldkit route/model/update
program uses that fixed renderer; page-level renderer controls are removed.
Build aliases select the documentation shell, gallery, header styles, and
landing component adapters. Authored content and interaction models stay shared.
Some shared program modules still reference both renderer implementations, so
this split does not promise complete JavaScript dependency pruning.

The StyleX entry loads `src/site/stylex.css` and the shared theme variables in
`src/theme.css`. Its CSS sets only document presentation. Element defaults live
in component StyleX recipes, not a global preflight replacement. The build
rejects Tailwind CSS in the StyleX output. Tailwind's plugin runs only for the
Tailwind build, which loads `src/styles.css`.

## Hosting

The Docker image includes both build directories. `nginx.conf` chooses the
StyleX directory for the Host header `stylex.creaseui.com` and the Tailwind
directory for other hosts. Both support direct links and reloads through an
`index.html` SPA fallback. Assets resolve within the selected site's directory.

To publish the split, configure DNS for `stylex.creaseui.com`, route both domains
to this container, and provision HTTPS for both names at the existing reverse
proxy. Preserve the original Host header when proxying requests. These DNS,
certificate, and deployment changes are external to this repository.

For separate static hosting projects, publish `dist/tailwind` to `creaseui.com`
and `dist/stylex` to `stylex.creaseui.com`, with an SPA fallback on each host.
Build modes work independently of the hostname; pointing a new domain at the
Tailwind output alone does not create a StyleX site.

Legacy block URLs remain accepted, but the current site's renderer determines
the rendered block even if the legacy URL contains the other renderer's name.

## Regression checks

`npm run test:sites` builds both sites and checks every catalog page, desktop
and mobile navigation, counterpart links, themes, client navigation, and direct
reloads. On StyleX pages it compares visible example geometry and computed
styles in light and dark themes before and after adding actual Tailwind preflight.
External images and fonts are disabled for deterministic comparisons, and JavaScript animation time
is frozen during the CSS measurement.

`npx playwright test e2e/stylex-preflight.spec.ts --project=chromium` separately
builds a consumer fixture with StyleX only. It checks light/dark screenshots,
menus, dialog/command interactions, and expanded/collapsed/mobile sidebars.
The existing browser suite also serves both production builds and follows site
links when its interaction cases need the StyleX renderer.
