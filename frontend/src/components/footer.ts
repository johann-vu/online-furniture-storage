import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import './footer.css';

@customElement('app-footer')
export class Footer extends LightElement {
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
