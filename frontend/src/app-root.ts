import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

// placeholder until the shell (topbar, router outlet, footer) is ported in step 3
@customElement('app-root')
export class AppRoot extends LitElement {
  protected override createRenderRoot() {
    return this;
  }

  protected override render() {
    return html`<h1>Online Möbellager</h1>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppRoot;
  }
}
