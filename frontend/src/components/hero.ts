import { html, nothing, type TemplateResult } from 'lit';
import './hero.css';

// A plain template instead of an element: light DOM elements have no slots for the content.
export function hero(imageSrc: string | undefined, content: TemplateResult) {
  return html`
    <div class="hero__wrapper">
      <div class="hero__container responsive-width">
        <div class="hero__slot">${content}</div>
        <div>${imageSrc ? html`<img class="hero__image" src=${imageSrc} alt="" />` : nothing}</div>
      </div>
    </div>
  `;
}
