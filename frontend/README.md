# Frontend

The frontend of the Online Möbellager, built with [Lit](https://lit.dev) web components, TypeScript and [Vite](https://vite.dev). It talks to the PocketBase backend with the [PocketBase JS SDK](https://github.com/pocketbase/js-sdk).

## Development

The dev server expects the backend on `http://127.0.0.1:8090`. The backend embeds the built frontend, so build it once before starting the backend (or after a fresh clone):

```sh
cd frontend
npm install
npm run build

cd ../backend
STORAGE_SECRET=<32 characters> go run ./cmd serve
```

Then start the dev server, it reloads on every change:

```sh
cd frontend
npm run dev
```

and open http://localhost:5173.

## Build

`npm run build` type-checks the code and writes the production build to `../backend/cmd/frontend/browser`, where the Go binary embeds it. In production the frontend uses the API on its own origin.

## Structure

```
index.html         entry page
public/            static files (images, favicon), served as they are
src/
  main.ts          imports the global styles and the app
  app-root.ts      shell (topbar, page, footer) and the route table
  router.ts        small history-based router: navigate(), matchRoute(), link handling
  api.ts           all calls to PocketBase
  components/      reusable elements, e.g. app-offer-form, app-image-viewer
  pages/           one element per route, e.g. page-offer, page-admin-detail
  lib/             validators, error messages, date formatting, image resizing
  model/           data types
  styles/          global css: variables, typography, buttons, inputs, animations
```

## Conventions

- Elements extend `LightElement` (`src/lib/light-element.ts`) and render without shadow DOM, so the global styles for buttons, inputs and typography apply everywhere.
- Every element has a `.css` file next to it, imported from its `.ts` file. Its rules are nested under the tag name (`app-footer { … }`) so they don't leak into other elements.
- Plain CSS, no preprocessor. Colors, fonts and spacing are CSS variables in `src/styles/variables.css`. Media queries use the literal breakpoints (680px for small screens).
- Elements report changes with custom events (`value-change`, `offer-submit`, …) instead of two-way binding.
- Forms have a `validate()` method built from the functions in `src/lib/validators.ts`. Errors show only for touched fields, which get `aria-invalid="true"`.
- Links are normal `<a href>` elements, the router takes over clicks on links within the app. Use `navigate('/path')` from `src/router.ts` in code.
