import { html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import { navigate } from '../router';
import { hero } from '../components/hero';
import '../components/steps-widget';
import './success.css';

@customElement('page-success')
export class SuccessPage extends LightElement {
  private shareContent() {
    navigator.share({
      title: 'Online Möbellager',
      text: 'Über das Online Möbellager kannst Du Möbel und Fahrräder spenden. Sieh es Dir doch mal an!',
      url: 'https://online-moebellager.de',
    });
  }

  protected override render() {
    return html`
      ${hero(
        '/assets/undraw_heart.svg',
        html`
          <h2>Dein Angebot wurde erstellt.</h2>
          <p class="success__subtitle">Wenn das mal kein Grund zur Freude ist!</p>
        `,
        { compact: true },
      )}
      <div class="success__text responsive-width">
        <p>
          Vielen Dank für dein Angebot! Wir sichten die Angebote regelmäßig und melden uns bei Dir, wenn es einen
          entsprechenden Bedarf gibt. Nach Ablauf der von Dir angegebenen Bereitstellungszeit wird der Eintrag von
          uns gelöscht.
        </p>
        <p>Das könnten Deine nächsten Schritte sein:</p>
        <div class="success__buttons">
          <button @click=${() => navigate('/offer')}>Weiteres Angebot erstellen</button>
          ${'share' in navigator
            ? html`<button class="black-outline" @click=${this.shareContent}>Diese Seite teilen</button>`
            : nothing}
          <button class="black-outline" @click=${() => navigate('/')}>Zur Startseite zurückkehren</button>
        </div>
      </div>
      <section class="success__next">
        <div class="responsive-width">
          <h3>So geht es weiter</h3>
          <app-steps-widget completed="1"></app-steps-widget>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-success': SuccessPage;
  }
}
