import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import { remainingDays } from '../lib/format';
import type { ReadOfferDTO } from '../model/offer';
import './offer-card.css';

@customElement('app-offer-card')
export class OfferCard extends LightElement {
  @property({ attribute: false }) offer?: ReadOfferDTO;

  protected override render() {
    const o = this.offer;
    if (!o) return;
    return html`
      <div class="offer-card__container">
        <img src=${o.photos[0] ?? ''} alt="" />
        <div class="offer-card__text">
          <span class="offer-card__title">${o.title}</span> <br />
          <span class="offer-card__subtitle">noch ${remainingDays(o.available_until)} Tage</span>
          <span class="offer-card__subtitle"> · ${o.category === 'bike' ? 'Fahrrad' : 'Möbel'}</span>
        </div>
        <div class="offer-card__trailing">#${o.number}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-offer-card': OfferCard;
  }
}
