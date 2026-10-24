import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import './image-viewer.css';

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 1.5;

// Fullscreen view of a single image. Shown while `src` is set, fires `close` when the user leaves it.
@customElement('app-image-viewer')
export class ImageViewer extends LightElement {
  @property() src = '';
  @state() private zoom = 1;
  // size at zoom 1, the image scaled down to fit the screen
  @state() private fitWidth = 0;

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener('keydown', this.onKeydown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this.onKeydown);
  }

  protected override willUpdate(changed: Map<string, unknown>) {
    if (changed.has('src')) {
      this.zoom = 1;
      this.fitWidth = 0;
    }
  }

  private onKeydown = (e: KeyboardEvent) => {
    if (this.src && e.key === 'Escape') this.close();
  };

  private onLoad(e: Event) {
    const img = e.target as HTMLImageElement;
    const stage = img.parentElement!;
    const style = getComputedStyle(stage);
    const width = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const height = stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const scale = Math.min(width / img.naturalWidth, height / img.naturalHeight, 1);
    this.fitWidth = img.naturalWidth * scale;
  }

  private setZoom(zoom: number) {
    this.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
  }

  private close() {
    this.dispatchEvent(new Event('close'));
  }

  protected override render() {
    if (!this.src) return nothing;
    return html`
      <div class="image-viewer__backdrop" role="dialog" aria-modal="true" aria-label="Bildansicht">
        <div class="image-viewer__stage" @click=${(e: Event) => e.target === e.currentTarget && this.close()}>
          <img
            src=${this.src}
            alt=""
            style=${this.fitWidth ? `width: ${this.fitWidth * this.zoom}px` : 'visibility: hidden'}
            @load=${this.onLoad}
          />
        </div>
        <div class="image-viewer__controls">
          <button class="dense" aria-label="Verkleinern" ?disabled=${this.zoom <= MIN_ZOOM} @click=${() => this.setZoom(this.zoom / ZOOM_STEP)}>−</button>
          <button class="dense" aria-label="Originalgröße" @click=${() => this.setZoom(1)}>${Math.round(this.zoom * 100)} %</button>
          <button class="dense" aria-label="Vergrößern" ?disabled=${this.zoom >= MAX_ZOOM} @click=${() => this.setZoom(this.zoom * ZOOM_STEP)}>+</button>
          <button class="dense" aria-label="Schließen" @click=${this.close}>✕</button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-image-viewer': ImageViewer;
  }
}
