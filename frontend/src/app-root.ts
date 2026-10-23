import { html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { LightElement } from './lib/light-element';
import { RouteController, matchRoute, type Route } from './router';
import './components/topbar';
import './components/footer';
import './pages/home';
import './pages/imprint';
import './pages/offer';
import './pages/login';
import './pages/admin';
import './pages/admin-overview';
import './pages/admin-detail';
import './pages/admin-profile';
import './pages/success';
import './app-root.css';

const admin = (content: TemplateResult) => html`<page-admin .content=${content}></page-admin>`;

const routes: Route<unknown>[] = [
  { path: '/', render: () => html`<page-home></page-home>` },
  { path: '/offer', render: () => html`<page-offer></page-offer>` },
  { path: '/success', render: () => html`<page-success></page-success>` },
  { path: '/login', render: () => html`<page-login></page-login>` },
  { path: '/admin', render: () => admin(html`<page-admin-overview></page-admin-overview>`) },
  { path: '/admin/overview', render: () => admin(html`<page-admin-overview></page-admin-overview>`) },
  { path: '/admin/profile', render: () => admin(html`<page-admin-profile></page-admin-profile>`) },
  {
    path: '/admin/detail/:id',
    render: ({ id }) => admin(html`<page-admin-detail .offerId=${id}></page-admin-detail>`),
  },
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
