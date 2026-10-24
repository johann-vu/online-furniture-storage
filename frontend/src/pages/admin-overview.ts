import { html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import { getOffers } from '../api';
import type { ReadOfferDTO } from '../model/offer';
import '../components/offer-card';
import './admin-overview.css';

const PER_PAGE = 50;

@customElement('page-admin-overview')
export class AdminOverviewPage extends LightElement {
  @state() private offers: ReadOfferDTO[] = [];
  private page = 1;

  override connectedCallback() {
    super.connectedCallback();
    getOffers(PER_PAGE, this.page).then((o) => (this.offers = o));
  }

  private async loadMore() {
    const loaded = await getOffers(PER_PAGE, this.page + 1);
    this.offers = [...this.offers, ...loaded];
    this.page++;
  }

  protected override render() {
    return html`
      <div class="overview__wrapper responsive-width">
        ${this.offers.map(
          (o) => html`<a href="/admin/detail/${o.id}"><app-offer-card .offer=${o}></app-offer-card></a>`,
        )}
        ${this.page * PER_PAGE <= this.offers.length
          ? html`<button class="block" @click=${this.loadMore}>Mehr Laden</button>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-admin-overview': AdminOverviewPage;
  }
}
