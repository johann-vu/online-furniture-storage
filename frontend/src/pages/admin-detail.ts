import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import { navigate } from '../router';
import { createComment, deleteOffer, getComments, getOfferById } from '../api';
import { formatDate } from '../lib/format';
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

  private async createComment(e: CustomEvent<string>) {
    await createComment(this.offerId, e.detail);
    this.comments = await getComments(this.offerId);
  }

  private section(title: string, content: unknown) {
    return html`
      <div class="detail__section">
        <div class="detail__section-headline">
          <h4>${title}</h4>
          <div class="detail__section-divider"></div>
        </div>
        ${content}
      </div>
    `;
  }

  private info(label: string, value: unknown) {
    return html`
      <div>
        <div>${label}</div>
        <div class="detail__infos-value">${value}</div>
      </div>
    `;
  }

  protected override render() {
    const o = this.offer;
    if (!o) return;
    return html`
      <div class="detail__wrapper responsive-width">
        <div class="detail__title">
          <h2>${o.title}</h2>
          <p>von ${o.name}</p>
        </div>
        <div class="detail__photos">
          ${o.photos.map(
            (p) => html`
              <button class="detail__photo" aria-label="Foto vergrößern" @click=${() => (this.viewerSrc = fullSize(p))}>
                <img src=${p} alt="" />
              </button>
            `,
          )}
        </div>
        ${this.section(
          'Fakten',
          html`
            <div class="detail__infos">
              ${this.info('Verfügbar bis', formatDate(o.available_until))} ${this.info('Erstellt am', formatDate(o.created))}
              ${this.info(o.category === 'bike' ? 'Größe' : 'Maße', o.size)} ${this.info('Telefonnummer', o.phone)}
              ${this.info('Angebotsnummer', o.number)}
            </div>
          `,
        )}
        ${this.section('Beschreibung', html`<p>${o.description || 'Keine Beschreibung vorhanden.'}</p>`)}
        ${this.section(
          'Kommentare',
          html`<div class="detail__comments">
            <app-comment-section .comments=${this.comments} @comment-submit=${this.createComment}></app-comment-section>
          </div>`,
        )}
        <div class="detail__actions">
          <a href="tel:${o.phone}"><button class="outline">Anrufen</button></a>
          <button class="detail__delete-btn" @click=${this.deleteOffer}>Angebot löschen</button>
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
