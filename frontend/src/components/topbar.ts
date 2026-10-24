import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import './topbar.css';

@customElement('app-topbar')
export class Topbar extends LightElement {
  @state() private isScrolled = false;

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener('scroll', this.onScroll);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('scroll', this.onScroll);
  }

  private onScroll = () => {
    this.isScrolled = window.scrollY > 0;
  };

  protected override render() {
    return html`
      <header class="topbar__wrapper ${this.isScrolled ? 'shadow' : ''}">
        <div class="topbar__container">
          <a href="/">
            <div class="topbar__title-container">
              <span class="topbar__title">Online Möbellager</span>
              <span class="topbar__subtitle">der Pfarrgemeinde St. Peter und Paul</span>
            </div>
          </a>
        </div>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-topbar': Topbar;
  }
}
