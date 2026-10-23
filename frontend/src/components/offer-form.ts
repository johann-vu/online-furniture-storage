import { html, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import type { CreateOfferDTO } from '../model/offer';
import {
  type ValidationError,
  dateNotInFarFuture,
  dateNotInPast,
  fileCountNotTooBig,
  fileSizeNotTooBig,
  minLength,
  phoneNumber,
  required,
} from '../lib/validators';
import { messageFor } from '../lib/messages';
import './category-select';
import './photo-upload';
import './offer-form.css';

type FieldName = keyof CreateOfferDTO;
type TextFieldName = 'title' | 'description' | 'size' | 'name' | 'phone';

const CATEGORIES = [
  { label: 'Möbelstück', value: 'furniture' },
  { label: 'Fahrrad', value: 'bike' },
];

// the texts that differ between the categories
const CATEGORY_TEXTS: Record<string, Record<string, string>> = {
  furniture: {
    titlePlaceholder: 'Küchentisch',
    titleHelp: 'Um welches Möbelstück handelt es sich?',
    descriptionPlaceholder: 'Die Tischplatte ist aus Holz hat eine kleine Macke.',
    descriptionHelp: 'Beschreibe das Möbelstück etwas genauer. Die Beschreibung ist optional.',
    sizeLabel: 'Maße',
    sizePlaceholder: '1m x 2m',
    sizeHelp: 'Wie groß ist das Möbelstück ungefähr? Zum Beispel Höhe x Breite x Tiefe.',
  },
  bike: {
    titlePlaceholder: 'Hollandrad für Herren',
    titleHelp: 'Um was für ein Fahrrad handelt es sich?',
    descriptionPlaceholder: 'Es müsste eine Klingel nachgerüstet werden.',
    descriptionHelp: 'Beschreibe das Fahrrad etwas genauer. Die Beschreibung ist optional.',
    sizeLabel: 'Größe',
    sizePlaceholder: '53 cm',
    sizeHelp: 'Welche Rahmengröße hat das Fahrrad oder wie groß ist es ungefähr?',
  },
};

// in six weeks, formatted for <input type="date">
function defaultDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7 * 6);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// fires `offer-submit` with the CreateOfferDTO as detail once all fields are valid
@customElement('app-offer-form')
export class OfferForm extends LightElement {
  @state() private value: CreateOfferDTO = {
    title: '',
    size: '',
    available_until: defaultDate(),
    name: '',
    phone: '',
    photos: [],
    privacy: false,
    nearby: false,
    category: 'furniture',
    description: '',
  };

  // errors are only shown for fields the user already left, or after a submit attempt
  @state() private touched = new Set<FieldName>();

  private validate(): Partial<Record<FieldName, ValidationError | null>> {
    const v = this.value;
    return {
      title: required(v.title) ?? minLength(v.title, 3),
      size: required(v.size),
      available_until: required(v.available_until) ?? dateNotInPast(v.available_until) ?? dateNotInFarFuture(v.available_until),
      photos: required(v.photos) ?? fileSizeNotTooBig(v.photos) ?? fileCountNotTooBig(v.photos),
      name: required(v.name) ?? minLength(v.name, 3),
      phone: phoneNumber(v.phone),
      nearby: required(v.nearby),
      privacy: required(v.privacy),
    };
  }

  private shownError(name: FieldName) {
    return this.touched.has(name) ? this.validate()[name] : null;
  }

  private set<K extends FieldName>(name: K, value: CreateOfferDTO[K]) {
    this.value = { ...this.value, [name]: value };
  }

  private touch(name: FieldName) {
    this.touched = new Set(this.touched).add(name);
  }

  private submit(e: SubmitEvent) {
    e.preventDefault();
    this.touched = new Set(Object.keys(this.value) as FieldName[]);
    if (Object.values(this.validate()).some(Boolean)) return;
    this.dispatchEvent(new CustomEvent('offer-submit', { detail: this.value, bubbles: true }));
  }

  // help text, replaced by the error message once the field is touched and invalid
  private hint(error: ValidationError | null | undefined, help: string | undefined) {
    if (error) return html`<p class="error-text">${messageFor(error)}</p>`;
    return help ? html`<p class="help-text">${help}</p>` : nothing;
  }

  private textField(
    name: TextFieldName,
    label: string,
    help: string,
    attrs: { placeholder: string; autocomplete?: string; required?: boolean; minlength?: number; multiline?: boolean },
  ) {
    const error = this.shownError(name);
    const id = `input-${name}`;
    const onInput = (e: Event) => this.set(name, (e.target as HTMLInputElement).value);
    const input: TemplateResult = attrs.multiline
      ? html`<textarea
          id=${id}
          rows="2"
          maxlength="1000"
          placeholder=${attrs.placeholder}
          aria-invalid=${!!error}
          .value=${this.value[name]}
          @input=${onInput}
          @blur=${() => this.touch(name)}
        ></textarea>`
      : html`<input
          type="text"
          id=${id}
          maxlength="120"
          minlength=${attrs.minlength ?? nothing}
          ?required=${attrs.required}
          placeholder=${attrs.placeholder}
          autocomplete=${attrs.autocomplete ?? 'off'}
          aria-invalid=${!!error}
          .value=${this.value[name]}
          @input=${onInput}
          @blur=${() => this.touch(name)}
        />`;

    return html`
      <div class="input-container">
        <label for=${id}>${label}</label>
        ${input} ${this.hint(error, help)}
      </div>
    `;
  }

  private checkbox(name: 'nearby' | 'privacy', label: string, errorText: string) {
    const invalid = !!this.shownError(name);
    return html`
      <div class="input-container checkbox-container">
        <label for="checkbox-${name}">
          <input
            type="checkbox"
            id="checkbox-${name}"
            required
            aria-invalid=${invalid}
            .checked=${this.value[name]}
            @change=${(e: Event) => {
              this.set(name, (e.target as HTMLInputElement).checked);
              this.touch(name);
            }}
          />
          ${label}
        </label>
        ${invalid ? html`<p class="error-text">${errorText}</p>` : nothing}
      </div>
    `;
  }

  protected override render() {
    const texts = CATEGORY_TEXTS[this.value.category];

    return html`
      <form novalidate @submit=${this.submit}>
        <div class="input-container">
          <label>Art des Angebots</label>
          <app-category-select
            .options=${CATEGORIES}
            .value=${this.value.category}
            @value-change=${(e: CustomEvent<string>) => this.set('category', e.detail)}
          ></app-category-select>
        </div>

        ${this.textField('title', 'Bezeichnung', texts.titleHelp, {
          placeholder: texts.titlePlaceholder,
          required: true,
          minlength: 3,
        })}
        ${this.textField('description', 'Beschreibung', texts.descriptionHelp, {
          placeholder: texts.descriptionPlaceholder,
          multiline: true,
        })}
        ${this.textField('size', texts.sizeLabel, texts.sizeHelp, {
          placeholder: texts.sizePlaceholder,
          required: true,
        })}

        <div class="input-container">
          <label for="input-available-until">Zeitraum</label>
          <input
            type="date"
            id="input-available-until"
            required
            aria-invalid=${!!this.shownError('available_until')}
            .value=${this.value.available_until}
            @input=${(e: Event) => this.set('available_until', (e.target as HTMLInputElement).value)}
            @blur=${() => this.touch('available_until')}
          />
          ${this.hint(this.shownError('available_until'), 'Bis wann soll das Angebot gelten?')}
        </div>

        <div class="input-container">
          <label for="input-files">Bilder hochladen</label>
          ${this.hint(this.shownError('photos'), 'Du kannst bis zu drei Bilder zu deinem Angebot hinzufügen.')}
          <app-photo-upload
            .files=${this.value.photos}
            @value-change=${(e: CustomEvent<File[]>) => {
              this.set('photos', e.detail);
              this.touch('photos');
            }}
          ></app-photo-upload>
        </div>

        ${this.textField('name', 'Name', 'Wie lautet Dein Name?', {
          placeholder: 'Helga Herzlich',
          autocomplete: 'name',
          required: true,
          minlength: 3,
        })}
        ${this.textField('phone', 'Telefonnummer', 'Unter welcher Telefonnummer erreichen wir Dich?', {
          placeholder: '02863 1234',
          autocomplete: 'tel',
          required: true,
        })}
        ${this.checkbox(
          'nearby',
          'Das Angebot kommt aus der Nähe von Velen, Ramsdorf oder Hochmoor.',
          'Wir können nur Angebote aus der Nähe vermitteln.',
        )}
        ${this.checkbox(
          'privacy',
          'Ich habe die Datenschutzerklärung gelesen und akzeptiert.',
          'Bitte akzeptiere die Datenschutzerklärung, damit wir die Daten verarbeiten können.',
        )}

        <p>
          Hier geht es zur
          <a target="_blank" rel="noopener noreferrer" href="/imprint#datenschutzerklaerung">Datenschutzerklärung</a>.
        </p>

        <button class="offer-form__submit with-icon" type="submit">
          <img class="icon" src="/assets/undraw_rocket.svg" alt="" />
          Erstellen
        </button>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-offer-form': OfferForm;
  }
}
