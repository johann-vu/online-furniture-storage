import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import { navigate } from '../router';
import { createOffer } from '../api';
import type { CreateOfferDTO } from '../model/offer';
import '../components/offer-form';
import './offer.css';

@customElement('page-offer')
export class OfferPage extends LightElement {
  private async handleSubmit(e: CustomEvent<CreateOfferDTO>) {
    try {
      const id = await createOffer(e.detail);
      navigate(`/success?id=${encodeURIComponent(id)}`);
    } catch (error) {
      console.error(error);
      alert(JSON.stringify(error, undefined, ' '));
    }
  }

  protected override render() {
    return html`
      <div class="offer__wrapper responsive-width topbar-space">
        <div class="offer__text">
          <div class="offer__text-sticky">
            <h2>Angebot erstellen</h2>
            <p>
              Nimm Dir bitte einen Augenblick Zeit, je besser das Angebot beschrieben wird, desto leichter fällt uns
              das Vermitteln.
            </p>
            <img class="offer__image" src="/assets/undraw_note.svg" alt="" />
          </div>
        </div>
        <div class="offer__spacer"></div>
        <app-offer-form class="offer__form" @offer-submit=${this.handleSubmit}></app-offer-form>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-offer': OfferPage;
  }
}
