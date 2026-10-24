import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import { navigate } from '../router';
import { changePassword, logout } from '../api';
import './admin-profile.css';

type Field = 'oldPassword' | 'newPassword' | 'verifyPassword';

@customElement('page-admin-profile')
export class AdminProfilePage extends LightElement {
  @state() private value: Record<Field, string> = { oldPassword: '', newPassword: '', verifyPassword: '' };
  @state() private submitted = false;

  private async submit(e: SubmitEvent) {
    e.preventDefault();
    this.submitted = true;
    if (Object.values(this.value).some((v) => !v)) return;

    try {
      await changePassword(this.value.oldPassword, this.value.newPassword, this.value.verifyPassword);
      alert('Passwort wurde geändert. Sie werden nun abgemeldet.');
      logout();
      navigate('/');
    } catch {
      alert('Ein Fehler ist aufgetreten.');
    }
  }

  private field(name: Field, label: string, autocomplete: string) {
    return html`
      <div class="input-container">
        <label for="input-${name}">${label}</label>
        <input
          type="password"
          id="input-${name}"
          required
          autocomplete=${autocomplete}
          aria-invalid=${this.submitted && !this.value[name]}
          .value=${this.value[name]}
          @input=${(e: Event) => (this.value = { ...this.value, [name]: (e.target as HTMLInputElement).value })}
        />
      </div>
    `;
  }

  protected override render() {
    return html`
      <div class="profile__wrapper responsive-width">
        <h2>Profileinstellungen</h2>
        <p>Im Folgenden kannst Du Dein Passwort ändern.</p>
        <h4>Passwort ändern</h4>
        <form novalidate @submit=${this.submit}>
          ${this.field('oldPassword', 'Altes Passwort', 'current-password')}
          ${this.field('newPassword', 'Neues Passwort', 'new-password')}
          ${this.field('verifyPassword', 'Neues Passwort wiederholen', 'new-password')}
          <button type="submit">Passwort ändern</button>
        </form>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-admin-profile': AdminProfilePage;
  }
}
