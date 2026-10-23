import type { ReactiveController, ReactiveControllerHost } from 'lit';

const ROUTE_CHANGED = 'route-changed';

export type Params = Record<string, string>;

export interface Route<T> {
  // e.g. '/admin/detail/:id'
  path: string;
  render: (params: Params) => T;
}

export function navigate(url: string, { replace = false } = {}) {
  if (replace) history.replaceState(null, '', url);
  else history.pushState(null, '', url);
  routeChanged();
  scrollToHashOrTop();
}

// finds the route for a pathname, a ':name' segment matches any segment and is returned as a param
export function matchRoute<T>(routes: Route<T>[], pathname = location.pathname) {
  const segments = pathname.split('/').filter(Boolean);
  for (const route of routes) {
    const routeSegments = route.path.split('/').filter(Boolean);
    if (routeSegments.length !== segments.length) continue;

    const params: Params = {};
    const matches = routeSegments.every((s, i) => {
      if (s.startsWith(':')) params[s.slice(1)] = decodeURIComponent(segments[i]);
      return s.startsWith(':') || s === segments[i];
    });
    if (matches) return { route, params };
  }
  return undefined;
}

// re-renders its host whenever the route changes
export class RouteController implements ReactiveController {
  constructor(private host: ReactiveControllerHost) {
    host.addController(this);
  }

  hostConnected() {
    window.addEventListener(ROUTE_CHANGED, this.onRouteChanged);
  }

  hostDisconnected() {
    window.removeEventListener(ROUTE_CHANGED, this.onRouteChanged);
  }

  private onRouteChanged = () => this.host.requestUpdate();
}

function routeChanged() {
  window.dispatchEvent(new Event(ROUTE_CHANGED));
}

function scrollToHashOrTop() {
  // Lit renders in microtasks, so the new page is in the DOM by the next frame
  requestAnimationFrame(() => {
    const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  });
}

// handle clicks on same-origin links in the app instead of reloading the page
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

  const anchor = e.composedPath().find((el): el is HTMLAnchorElement => el instanceof HTMLAnchorElement);
  if (!anchor || anchor.target || anchor.hasAttribute('download') || anchor.origin !== location.origin) return;

  e.preventDefault();
  navigate(anchor.pathname + anchor.search + anchor.hash);
});

// on back/forward the browser restores the scroll position itself
window.addEventListener('popstate', routeChanged);
