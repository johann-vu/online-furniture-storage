import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import { navigate } from '../router';
import { createComment, deleteOffer, getComments, getOfferById } from '../api';
import { URGENT_DAYS, formatDate, remainingDays, remainingDaysLabel } from '../lib/format';
import type { ReadOfferDTO } from '../model/offer';
import type { OfferComment } from '../model/comment';
import '../components/comment-section';
import '../components/image-viewer';
import './admin-detail.css';

// the photo urls point to thumbnails, the viewer shows the original
function fullSize(url: string): string {
  const u = new URL(url, location.href);
  u.searchParams.delete('thumb');
  return u.toString();
}

@customElement('page-admin-detail')
export class AdminDetailPage extends LightElement {
  @property() offerId = '';
  @state() private offer?: ReadOfferDTO;
  @state() private comments: OfferComment[] = [];
  @state() private viewerSrc = '';

  protected override willUpdate(changed: Map<string, unknown>) {
    if (changed.has('offerId')) this.load();
  }

  private async load() {
    try {
      this.offer = await getOfferById(this.offerId);
      this.comments = await getComments(this.offerId);
    } catch (e) {
      alert(JSON.stringify(e, undefined, ' '));
    }
  }

  private async deleteOffer() {
    if (!this.offer) return;
    if (!confirm('Möchtest du das Angebot "' + this.offer.title + '" wirklich löschen?')) return;

    try {
      await deleteOffer(this.offer.id);
    } finally {
      navigate('/admin/overview');
    }
  }

  private saveComment = async (text: string) => {
    await createComment(this.offerId, text);
    this.comments = await getComments(this.offerId);
  };

  private fact(label: string, value: unknown) {
    return html`
      <div class="detail__fact">
        <dt>${label}</dt>
        <dd>${value}</dd>
      </div>
    `;
  }

  protected override render() {
    const o = this.offer;
    if (!o) return;
    const days = remainingDays(o.available_until);
    return html`
      <div class="detail__wrapper responsive-width">
        <a class="detail__back" href="/admin/overview">← Alle Angebote</a>

        <h2 class="detail__title">${o.title}</h2>

        ${o.photos.length
          ? html`
              <div class="detail__photos">
                ${o.photos.map(
                  (p, i) => html`
                    <button
                      class="detail__photo"
                      aria-label="Foto ${i + 1} vergrößern"
                      @click=${() => (this.viewerSrc = fullSize(p))}
                    >
                      <img src=${p} alt="" />
                    </button>
                  `,
                )}
              </div>
            `
          : nothing}

        <section class="detail__section">
          <h3 class="section-label">Details</h3>
          <dl class="detail__facts">
            ${this.fact('Name', o.name)} ${this.fact('Telefon', html`<a href="tel:${o.phone}">${o.phone}</a>`)}
            ${this.fact('Kategorie', o.category === 'bike' ? 'Fahrrad' : 'Möbelstück')}
            ${this.fact(o.category === 'bike' ? 'Größe' : 'Maße', o.size)}
            ${this.fact('Verfügbar bis', formatDate(o.available_until))}
            ${this.fact(
              'Restdauer',
              html`<span class="badge ${days < URGENT_DAYS ? 'badge--urgent' : ''}">${remainingDaysLabel(days)}</span>`,
            )}
            ${this.fact('Eingestellt am', formatDate(o.created))} ${this.fact('Angebotsnummer', o.number)}
          </dl>
        </section>

        <section class="detail__section">
          <h3 class="section-label">Beschreibung</h3>
          ${o.description
            ? html`<p class="detail__description">${o.description}</p>`
            : html`<p class="detail__muted">Keine Beschreibung vorhanden.</p>`}
        </section>

        <section class="detail__section">
          <h3 class="section-label">Kommentare${this.comments.length ? ` (${this.comments.length})` : ''}</h3>
          <app-comment-section .comments=${this.comments} .save=${this.saveComment}></app-comment-section>
        </section>

        <div class="detail__actions">
          <a class="button" href="tel:${o.phone}">Anrufen</a>
          <button class="detail__delete" @click=${this.deleteOffer}>Angebot löschen</button>
        </div>
      </div>
      <app-image-viewer .src=${this.viewerSrc} @close=${() => (this.viewerSrc = '')}></app-image-viewer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-admin-detail': AdminDetailPage;
  }
}
