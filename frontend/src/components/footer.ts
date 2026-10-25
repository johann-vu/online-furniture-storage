import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import './footer.css';

// set by the build workflow, local builds show "dev"
const commitHash: string | undefined = import.meta.env.VITE_COMMIT_HASH;

@customElement('app-footer')
export class Footer extends LightElement {
  private renderVersion() {
    if (!commitHash) {
      return html`<span>dev</span>`;
    }
    return html`
      <a href="https://github.com/johann-vu/online-furniture-storage/commit/${commitHash}" target="_blank" rel="noopener">
        ${commitHash.slice(0, 7)}
      </a>
    `;
  }

  protected override render() {
    return html`
      <footer class="footer__wrapper">
        <div class="footer__container responsive-width">
          <div class="footer__contact">
            <p>Ein Service der</p>
            <p class="footer__contact-title">Pfarrgemeinde St. Peter und Paul</p>
            <p>Kirchplatz 3<br />46342 Velen</p>
          </div>
          <div class="footer__links">
            <a href="/login">Administration</a>
            <a href="/imprint">Impressum</a>
            <a href="/imprint#datenschutzerklaerung">Datenschutzerklärung</a>
          </div>
          <div class="footer__version">${this.renderVersion()}</div>
        </div>
      </footer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-footer': Footer;
  }
}
