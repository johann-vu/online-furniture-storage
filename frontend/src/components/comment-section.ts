import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import { formatDateTime } from '../lib/format';
import type { OfferComment } from '../model/comment';
import './comment-section.css';

// the backend allows 512 characters per comment
const MAX_LENGTH = 512;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';
}

@customElement('app-comment-section')
export class CommentSection extends LightElement {
  @property({ attribute: false }) comments: OfferComment[] = [];
  // saves a new comment, the input is only cleared once it resolves
  @property({ attribute: false }) save?: (text: string) => Promise<void>;

  @state() private inputText = '';
  @state() private saving = false;

  private async submit(e: Event) {
    e.preventDefault();
    const text = this.inputText.trim();
    if (!text || !this.save || this.saving) return;

    this.saving = true;
    try {
      await this.save(text);
      this.inputText = '';
    } catch {
      alert('Der Kommentar konnte nicht gespeichert werden.');
    } finally {
      this.saving = false;
    }
  }

  private onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) this.submit(e);
  }

  protected override render() {
    return html`
      ${this.comments.length
        ? html`
            <ul class="comments__list">
              ${this.comments.map(
                (c) => html`
                  <li class="comments__comment">
                    <span class="comments__avatar" aria-hidden="true">${initials(c.author)}</span>
                    <div class="comments__body">
                      <div class="comments__meta">
                        <span class="comments__author">${c.author}</span>
                        <span class="comments__time">${formatDateTime(c.created)}</span>
                      </div>
                      <p class="comments__text">${c.text}</p>
                    </div>
                  </li>
                `,
              )}
            </ul>
          `
        : html`<p class="comments__empty">Noch keine Kommentare. Halte hier fest, was mit dem Angebot passiert, z. B. wer sich gemeldet hat.</p>`}

      <form class="comments__form" @submit=${this.submit}>
        <label class="visually-hidden" for="comment-input">Neuer Kommentar</label>
        <textarea
          id="comment-input"
          rows="3"
          maxlength=${MAX_LENGTH}
          placeholder="Kommentar schreiben …"
          .value=${this.inputText}
          @input=${(e: Event) => (this.inputText = (e.target as HTMLTextAreaElement).value)}
          @keydown=${this.onKeydown}
        ></textarea>
        <div class="comments__actions">
          <span class="comments__hint">Strg/⌘ + Enter zum Speichern</span>
          <button class="dense" type="submit" ?disabled=${!this.inputText.trim() || this.saving}>
            ${this.saving ? 'Wird gespeichert …' : 'Kommentar speichern'}
          </button>
        </div>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-comment-section': CommentSection;
  }
}
