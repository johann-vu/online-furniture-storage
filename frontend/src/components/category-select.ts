import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import './category-select.css';

export interface CategoryOption {
  value: string;
  label: string;
}

// fires `value-change` with the selected value as detail
@customElement('app-category-select')
export class CategorySelect extends LightElement {
  @property({ attribute: false }) options: CategoryOption[] = [];
  @property() value = '';

  private select(option: CategoryOption) {
    this.value = option.value;
    this.dispatchEvent(new CustomEvent('value-change', { detail: option.value, bubbles: true }));
  }

  protected override render() {
    return html`
      <div class="category__wrapper">
        ${this.options.map((option) => {
          const selected = option.value === this.value;
          return html`
            <button
              class="category__button with-icon ${selected ? '' : 'black-outline'}"
              type="button"
              aria-pressed=${selected}
              @click=${() => this.select(option)}
            >
              <img class="icon" src="/assets/undraw_${option.value}${selected ? '-white' : ''}.svg" alt="" />
              ${option.label}
            </button>
          `;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-category-select': CategorySelect;
  }
}
