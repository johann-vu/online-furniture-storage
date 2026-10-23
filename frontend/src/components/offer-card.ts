import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import { remainingDays, remainingDaysLabel } from '../lib/format';
import type { ReadOfferDTO } from '../model/offer';
import './offer-card.css';

// offers that run out within this many days are marked as urgent
const URGENT_DAYS = 7;

const commentIcon = html`<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
  <path
    d="M4 5h16v11H9l-5 4z"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linejoin="round"
  />
</svg>`;

@customElement('app-offer-card')
export class OfferCard extends LightElement {
  @property({ attribute: false }) offer?: ReadOfferDTO;

  protected override render() {
    const o = this.offer;
    if (!o) return;
    const days = remainingDays(o.available_until);
    const comments = o.commentCount ?? 0;
    return html`
      <div class="offer-card__container">
        <img src=${o.photos[0] ?? ''} alt="" />
        <div class="offer-card__text">
          <span class="offer-card__title">${o.title}</span>
          <div class="offer-card__meta">
            <span class="offer-card__badge ${days < URGENT_DAYS ? 'offer-card__badge--urgent' : ''}">
              ${remainingDaysLabel(days)}
            </span>
            <span>${o.category === 'bike' ? 'Fahrrad' : 'Möbel'}</span>
            <span
              class="offer-card__comments ${comments ? '' : 'offer-card__comments--none'}"
              aria-label="${comments} ${comments === 1 ? 'Kommentar' : 'Kommentare'}"
            >
              ${commentIcon} ${comments}
            </span>
          </div>
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
