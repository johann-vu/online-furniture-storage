import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import { navigate } from '../router';
import { isLoggedIn, login } from '../api';
import type { Credentials } from '../model/credentials';
import './login.css';

@customElement('page-login')
export class LoginPage extends LightElement {
  @state() private value: Credentials = { username: '', password: '' };
  @state() private submitted = false;

  override connectedCallback() {
    super.connectedCallback();
    if (isLoggedIn()) navigate('/admin/overview', { replace: true });
  }

  private async submit(e: SubmitEvent) {
    e.preventDefault();
    this.submitted = true;
    if (!this.value.username || !this.value.password) return;

    try {
      await login(this.value.username, this.value.password);
      navigate('/admin/overview');
    } catch (error) {
      alert(error);
    }
  }

  private field(name: keyof Credentials, label: string, type: string, autocomplete: string) {
    return html`
      <div class="input-container">
        <label for="login-${name}">${label}</label>
        <input
          type=${type}
          id="login-${name}"
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
      <div class="login__wrapper responsive-width">
        <div class="login__form">
          <h2>Anmeldung</h2>
          <form novalidate @submit=${this.submit}>
            ${this.field('username', 'Benutzername', 'text', 'username')}
            ${this.field('password', 'Passwort', 'password', 'current-password')}
            <button class="login__submit">Login</button>
          </form>
          <button class="black-outline login__home-button" @click=${() => navigate('/')}>Zurück zur Startseite</button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-login': LoginPage;
  }
}
