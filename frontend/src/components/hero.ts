import { html, nothing, type TemplateResult } from 'lit';
import './hero.css';

// A plain template instead of an element: light DOM elements have no slots for the content.
// `compact` makes it only as high as its content needs, e.g. for a page that continues below
export function hero(imageSrc: string | undefined, content: TemplateResult, { compact = false } = {}) {
  return html`
    <div class="hero__wrapper ${compact ? 'hero__wrapper--compact' : ''}">
      <div class="hero__container responsive-width">
        <div class="hero__slot">${content}</div>
        <div>${imageSrc ? html`<img class="hero__image" src=${imageSrc} alt="" />` : nothing}</div>
      </div>
    </div>
  `;
}
