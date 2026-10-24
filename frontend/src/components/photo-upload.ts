import { html, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import { MAX_FILESIZE } from '../lib/validators';
import { resizeImage } from '../lib/resize-image';
import './photo-upload.css';

// fires `value-change` with the new list of files as detail
@customElement('app-photo-upload')
export class PhotoUpload extends LightElement {
  @property({ attribute: false }) files: File[] = [];

  @query('input[type=file]') private input!: HTMLInputElement;

  // object urls for the previews, released once a file is removed
  private previews = new Map<File, string>();

  private preview(file: File): string {
    let url = this.previews.get(file);
    if (!url) {
      url = URL.createObjectURL(file);
      this.previews.set(file, url);
    }
    return url;
  }

  private releasePreviews(keep: File[] = []) {
    for (const [file, url] of this.previews) {
      if (keep.includes(file)) continue;
      URL.revokeObjectURL(url);
      this.previews.delete(file);
    }
  }

  protected override updated() {
    this.releasePreviews(this.files);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.releasePreviews();
  }

  private async onFileSelect(e: Event) {
    // the selection is reported via value-change, not the native change event
    e.stopPropagation();

    const selected: File[] = [];
    for (let file of Array.from(this.input.files ?? [])) {
      if (file.size > MAX_FILESIZE) {
        try {
          file = await resizeImage(file, 1200, 1200);
        } catch (error) {
          console.error(error);
        }
      }
      selected.push(file);
    }
    // allows selecting the same file again after it was removed
    this.input.value = '';
    this.setFiles([...this.files, ...selected]);
  }

  private setFiles(files: File[]) {
    this.files = files;
    this.dispatchEvent(new CustomEvent('value-change', { detail: files, bubbles: true }));
  }

  protected override render() {
    return html`
      <input type="file" id="input-files" multiple accept="image/*" @change=${this.onFileSelect} />
      <div class="photo-upload__btn-group">
        <button type="button" class="with-icon" @click=${() => this.input.click()}>
          <img class="icon" src="/assets/undraw_cloud-upload.svg" alt="" />
          Fotos auswählen
        </button>
      </div>
      ${this.files.length
        ? html`
            <ul class="photo-upload__previews">
              ${this.files.map(
                (file) => html`
                  <li class="photo-upload__preview">
                    <img src=${this.preview(file)} alt=${file.name} title=${file.name} />
                    <button
                      type="button"
                      class="photo-upload__remove"
                      aria-label="${file.name} entfernen"
                      @click=${() => this.setFiles(this.files.filter((f) => f !== file))}
                    >
                      ✕
                    </button>
                  </li>
                `,
              )}
            </ul>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-photo-upload': PhotoUpload;
  }
}
