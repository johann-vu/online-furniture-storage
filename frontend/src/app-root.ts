import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { LightElement } from './lib/light-element';
import { RouteController, matchRoute, type Route } from './router';
import './components/topbar';
import './components/footer';
import './pages/home';
import './pages/imprint';
import './pages/offer';
import './pages/success';
import './app-root.css';

const routes: Route<unknown>[] = [
  { path: '/', render: () => html`<page-home></page-home>` },
  { path: '/offer', render: () => html`<page-offer></page-offer>` },
  { path: '/success', render: () => html`<page-success></page-success>` },
  { path: '/imprint', render: () => html`<page-imprint></page-imprint>` },
];

@customElement('app-root')
export class AppRoot extends LightElement {
  private route = new RouteController(this);

  protected override render() {
    const match = matchRoute(routes) ?? matchRoute(routes, '/')!;
    return html`
      <app-topbar></app-topbar>
      <div class="app__wrapper">
        <main>${match.route.render(match.params)}</main>
        <app-footer></app-footer>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppRoot;
  }
}
