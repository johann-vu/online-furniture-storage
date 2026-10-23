import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import { formatDateTime } from '../lib/format';
import type { OfferComment } from '../model/comment';
import './comment-section.css';

// fires `comment-submit` with the text as detail
@customElement('app-comment-section')
export class CommentSection extends LightElement {
  @property({ attribute: false }) comments: OfferComment[] = [];
  @state() private inputText = '';

  private submit() {
    if (!this.inputText) return;
    this.dispatchEvent(new CustomEvent('comment-submit', { detail: this.inputText, bubbles: true }));
    this.inputText = '';
  }

  protected override render() {
    return html`
      ${this.comments.map(
        (c) => html`
          <div class="comments__comment">
            <div class="comments__comment-avatar">${c.author[0]}</div>
            <span class="comments__comment-header">${c.author} ${formatDateTime(c.created)}</span>
            <span class="comments__comment-text">${c.text}</span>
          </div>
        `,
      )}
      ${this.comments.length === 0
        ? html`
            <div class="comments__comment">
              <div class="comments__comment-avatar">!</div>
              <span class="comments__comment-header">Es gibt noch keine Kommentare</span>
            </div>
          `
        : ''}
      <div class="comments__text-field">
        <div class="input-container">
          <textarea
            rows="3"
            aria-label="Kommentar"
            .value=${this.inputText}
            @input=${(e: Event) => (this.inputText = (e.target as HTMLTextAreaElement).value)}
          ></textarea>
        </div>
        <button aria-label="Kommentar senden" @click=${this.submit}>↑</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-comment-section': CommentSection;
  }
}
