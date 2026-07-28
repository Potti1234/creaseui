# Registry installation

Crease UI uses shadcn's public GitHub registry transport. The registry can be
inspected and validated directly:

```sh
npx shadcn@latest registry validate Potti1234/creaseui
npx shadcn@latest list Potti1234/creaseui
```

Foldkit consumers need a `components.json` with TypeScript output and aliases:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

`tsx` must be `true`: the shadcn CLI uses this flag to select TypeScript output,
even though Crease UI contains no JSX or React.

Install a stateless and a stateful component with:

```sh
npx shadcn@latest add Potti1234/creaseui/button
npx shadcn@latest add Potti1234/creaseui/dialog
```

The repository's end-to-end proof creates a disposable Foldkit/Vite consumer,
installs both items from GitHub, and runs its typecheck and production build:

```sh
npm run test:registry
```
