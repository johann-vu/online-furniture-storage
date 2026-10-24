import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import './steps-widget.css';

interface Step {
  title: string;
  icon: string;
  description: string;
}

const steps: Step[] = [
  {
    title: 'Erstellung',
    icon: '/assets/undraw_note.svg',
    description: `Im ersten Schritt erstellst Du ein Angebot auf dieser Seite. Das Angebot
      sollte ein paar wesentliche Informationen zum Möbelstück umfassen, ein
      paar Fotos sowie Deine Kontaktdaten. Außerdem solltest Du angeben, wie lange Du das Möbelstück bereithalten bzw.
      aufbewahren kannst.`,
  },
  {
    title: 'Vermittlung',
    icon: '/assets/undraw_person.svg',
    description: `Im zweiten Schritt versuchen wir das Angebot zu vermitteln. Ehrenamtliche
      Helfer, die in unserer Gemeinde aktiv sind, überprüfen regelmäßig die
      Angebote. Nur eine kleine Gruppe Helfer hat Zugriff auf die Angebote,
      nicht mehr Personen als notwendig.`,
  },
  {
    title: 'Abholung',
    icon: '/assets/undraw_heart.svg',
    description: `Im dritten Schritt melden wir uns bei Dir, wenn wir ein Angebot vermitteln
      konnten. Dann stimmen wir individuell ab, wie und wann wir das Möbelstück
      abholen. Sollten wir ein Möbelstück nicht vermitteln können, wird das Angebot
      automatisch nach Ablauf aus der Datenbank gelöscht.`,
  },
];

// `completed` marks the first steps as done, e.g. after an offer was created
@customElement('app-steps-widget')
export class StepsWidget extends LightElement {
  @property({ type: Number }) completed = 0;

  protected override render() {
    return html`
      <ol class="steps__wrapper">
        ${steps.map((step, i) => {
          const done = i < this.completed;
          return html`
            <li class="steps__card ${done ? 'steps__card--done' : ''}">
              <div class="steps__header">
                <span
                  class="steps__icon"
                  style="--icon: url(${done ? '/assets/undraw_check.svg' : step.icon})"
                  aria-hidden="true"
                ></span>
                <h4 class="steps__title">${step.title}</h4>
                ${done ? html`<span class="steps__done">erledigt</span>` : nothing}
              </div>
              <p class="steps__description">${step.description}</p>
            </li>
          `;
        })}
      </ol>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-steps-widget': StepsWidget;
  }
}
