# Rewrite frontend: Angular 18 → Lit

## Context
The frontend (`frontend/`, ~2.9k lines across 10 pages/components, 5 validator directives, 1 pipe, 2 services) is an Angular 18 NgModule app. Angular brings a heavy toolchain (CLI, zone.js, rxjs, Karma) for what is a small app: a public offer form, a success page, an imprint, and a small admin area (login, offer list, offer detail with comments, password change) on top of PocketBase. Goal: same features, same look, same URLs, same build output location — but built with **Lit + Vite + TypeScript** and as few extra dependencies as possible.

## Guiding decisions (keep it simple)
- **Build tool: Vite** (vanilla-ts template). Replaces Angular CLI, Karma, zone.js, rxjs.
- **Light DOM components** (`createRenderRoot() { return this }`). The app relies on global styles (`src/styles/input.scss`, `button.scss`, typography); rendering into light DOM lets these keep working unchanged and avoids duplicating CSS into every shadow root. Component-specific SCSS becomes plain CSS scoped under the component's tag name (e.g. `app-footer a { … }`), which replaces Angular's style encapsulation. Since light DOM has no slots, wrappers that took projected content (`app-hero`) become plain template functions (`hero(imageSrc, content)`).
- **Styling: plain CSS, no SCSS.** `_variables.scss` → CSS custom properties on `:root` (`--primary-color`, `--spacing-unit`, …) in `src/styles/variables.css`. `_mixins.scss` mixins are inlined or turned into small utility classes. Nesting is either flattened or kept as native CSS nesting (supported in all current browsers). `typography`, `input`, `button`, `animations` become `.css` files imported from `main.ts`; per-component `.scss` files become class-scoped `.css` files next to their component. No `sass` dependency.
- **Routing: tiny hand-written router** (~50 lines: History API + `URLPattern`/regex, click interception on `<a href>`, scroll to top on navigation). No router library needed for 8 routes.
- **State/services: plain ES modules.** `pocketbase.service.ts` → `src/api.ts` exporting a single `PocketBase` instance and the same functions (`createOffer`, `getOffers`, `getOfferById`, `deleteOffer`, `login`, `logout`, `isLoggedIn`, `changePassword`, `getComments`, `createComment`). `image-resize.service.ts` → `src/lib/resize-image.ts` (copy as-is, drop `@Injectable`).
- **Forms: one `validate()` per form, no form library.** It computes the errors from the form's current value with the pure functions in `src/lib/validators.ts` (`required`, `minLength`, `dateNotInPast`, `phoneNumber`, …); `src/lib/messages.ts` maps them to the German texts (formerly `validation-errors.pipe.ts`). Errors show only for touched fields (blur, change or a submit attempt), and such fields get `aria-invalid="true"`, which `input.css` styles red. `maxlength`/`required` stay as html attributes for the browser and screen readers, the form itself is `novalidate`.
- **Environment config:** replace `environments/*.ts` file replacement with `import.meta.env.DEV ? 'http://127.0.0.1:8090' : '/'`.
- **Keep:** `pocketbase`, `@fontsource/*`, all `src/assets/*`, `model/*.ts` (pure TS, reuse unchanged).
- **Drop `viewerjs`** in favour of a small own `<app-image-viewer>` element: fullscreen overlay showing one picture (full-size URL = thumb URL with the `thumb` param removed, as in `detail.component.ts` today), zoom in / zoom out / reset buttons (CSS `transform: scale()`), and a close button; Escape and clicking the backdrop also close it. No swiping between images, no rotation — clicking another thumbnail just opens that one.
- **Tests:** existing specs are only "should create" boilerplate — drop them. Add Vitest only if/when there's logic worth testing (validators are a good first candidate).

## Target structure
```
frontend/
  index.html            # from src/index.html (+ umami script, <app-root>, module script)
  vite.config.ts        # build.outDir = ../backend/cmd/frontend/browser, emptyOutDir
  package.json          # lit, pocketbase, @fontsource/*; dev: vite, typescript
  public/               # favicon.ico, assets/*
  src/
    main.ts             # imports styles + app-root
    router.ts           # tiny router
    api.ts              # PocketBase wrapper
    model/              # moved unchanged
    lib/                # validators.ts, resize-image.ts, messages.ts
    styles/             # plain CSS converted from the existing scss (variables.css, typography.css, …)
    components/         # app-topbar, app-footer, app-hero, app-steps-widget, app-offer-card,
                        # app-offer-form, app-photo-upload, app-category-select, app-image-viewer,
                        # app-login-form, app-change-password, app-comment-section
    pages/              # page-home, page-offer, page-success, page-login, page-imprint,
                        # page-admin (layout + auth check), page-admin-overview,
                        # page-admin-detail, page-admin-profile
```

## Mapping Angular → Lit (pattern, applies to every component)
| Angular | Lit |
|---|---|
| `@Component` + `.html` + `.scss` | `@customElement('x')` class, `render()` returns `html\`\`` |
| `@Input()` | `@property()` |
| `@Output() EventEmitter` | `this.dispatchEvent(new CustomEvent('x', { detail, bubbles: true }))` |
| `*ngIf` / `*ngFor` | `cond ? html\`…\` : nothing` / `items.map(…)` (or `repeat`) |
| `[(ngModel)]` | `.value=${v} @input=${e => …}` |
| `ControlValueAccessor` (photo-upload, category-select) | component holds value, fires `change` event; parent stores it |
| `ngOnInit` / `ngOnDestroy` | `connectedCallback` / `disconnectedCallback` (or `firstUpdated`) |
| `@ViewChild` | `@query('#id')` |
| `ActivatedRoute.params` | router passes params as a property on the page element |
| `Router.navigate` | `navigate('/path')` exported from `router.ts` |

## Routes (unchanged URLs)
`/` home · `/offer` · `/success` · `/login` · `/imprint` · `/admin` layout with `/admin/overview`, `/admin/profile`, `/admin/detail/:id`. Unknown → home. Small improvement while here: `page-admin` redirects to `/login` if `!isLoggedIn()` (currently there is no guard).

## Migration steps
The old Angular sources under `frontend/src/app/` stay in place (not compiled) as a reference until their Lit replacement exists, and are deleted step by step.

- [x] **1. Scaffold** a fresh Vite + Lit + TS setup inside `frontend/` (on a branch); move `src/assets`, `favicon.ico` to `public/`, move `src/app/model` to `src/model`. Remove `angular.json`, `tsconfig.app/spec.json`, Angular deps, `viewerjs`, `.spec.ts` files.
- [x] **2. Infrastructure:** `main.ts`, `router.ts`, `api.ts` (port of `src/app/services/pocketbase.service.ts`), `lib/` (validators, messages, resize-image), convert `src/styles/*.scss` and `src/styles.scss` to plain CSS and import them plus the fonts from `main.ts`.
- [x] **3. Shell + static pages:** `app-root` (topbar, outlet, footer), `page-home` (hero, steps-widget), `page-imprint`, `page-success` (Web Share API logic from `success.component.ts`).
- [x] **4. Offer flow (largest piece):** `app-category-select`, `app-photo-upload` (resize > 5 MB, max 3 files), `app-offer-form` (port `offer-form.component.html`, 306 lines, with native validation + touched-based error display, default date +6 weeks), `page-offer` (submit → `createOffer` → `/success`).
- [ ] **5. Admin:** `page-login`/`app-login-form`, `page-admin` layout + logout + guard, `page-admin-overview` (offer cards, pagination as today), `app-image-viewer` + `page-admin-detail` (thumbnails open the viewer, delete with confirm, comments), `page-admin-profile`/`app-change-password`.
- [ ] **6. Build/CI wiring:**
   - `package.json` scripts: `dev` (`vite --host 0.0.0.0`), `build` (`tsc --noEmit && vite build`), `preview`.
   - Vite `outDir` must be `../backend/cmd/frontend/browser` — the Go binary embeds `frontend/browser` (`backend/cmd/main.go:15-26`).
   - Production build uses API base `/` (served by the backend, same origin).
   - `.github/workflows/build.yml` / `test.yml`: rename "Build Angular Project" steps; commands (`npm ci && npm run build`) stay the same.
   - Update `.vscode/tasks.json`/`launch.json` and `frontend/README.md`, root `README.md` where they mention `ng`.
- [ ] **7. Cleanup:** remove remaining Angular files, check `.gitignore` (`.angular/` cache).

## Verification
- `cd frontend && npm run build` succeeds and writes `backend/cmd/frontend/browser/index.html`.
- `cd backend && go vet ./... && go test ./...` still pass (unchanged backend).
- Run backend + `npm run dev`, then click through manually against PocketBase:
  - create a furniture offer and a bike offer with 1–3 photos (incl. one >5 MB to hit resize), check every validation message (required, too-short title, past date, date >3 months, bad phone, >3 photos), land on `/success`, share button where supported;
  - login → overview lists offers → detail shows photos (clicking one opens the viewer at full size; zoom in/out/reset work; close via button, Escape and backdrop), add a comment, delete an offer → change password → logout; `/admin/*` without login redirects to `/login`;
  - deep link reload on `/admin/detail/<id>` works when served by the Go binary (SPA fallback via `apis.Static(..., true)`);
  - visual comparison against the current site (`docs/res/screenshot.png`) on desktop and mobile width.
