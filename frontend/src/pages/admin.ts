import { html, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import { navigate } from '../router';
import { isLoggedIn, logout } from '../api';
import './admin.css';

// Layout of the admin area: the yellow navigation bar above `content`. Sends visitors who aren't logged in to /login.
@customElement('page-admin')
export class AdminPage extends LightElement {
  @property({ attribute: false }) content?: TemplateResult;

  protected override render() {
    if (!isLoggedIn()) {
      // navigate after this render, not during it
      queueMicrotask(() => navigate('/login', { replace: true }));
      return nothing;
    }

    return html`
      <div class="admin__wrapper topbar-space">
        <nav class="admin__top-bar">
          <div class="admin__top-bar-content responsive-width">
            <a href="/admin/overview">Angebote</a>
            <a href="/admin/profile">Profil</a>
            <div class="spacer"></div>
            <a href="/" @click=${logout}>Abmelden</a>
          </div>
        </nav>
        ${this.content}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-admin': AdminPage;
  }
}
