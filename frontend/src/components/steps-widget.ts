import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { LightElement } from '../lib/light-element';
import './steps-widget.css';

interface Step {
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    title: 'Erstellung',
    description: `Im ersten Schritt erstellst Du ein Angebot auf dieser Seite. Das Angebot
      sollte ein paar wesentliche Informationen zum Möbelstück umfassen, ein
      paar Fotos sowie Deine Kontaktdaten. Außerdem solltest Du angeben, wie lange Du das Möbelstück bereithalten bzw.
      aufbewahren kannst.`,
  },
  {
    title: 'Vermittlung',
    description: `Im zweiten Schritt versuchen wir das Angebot zu vermitteln. Ehrenamtliche
      Helfer, die in unserer Gemeinde aktiv sind, überprüfen regelmäßig die
      Angebote. Nur eine kleine Gruppe Helfer hat Zugriff auf die Angebote,
      nicht mehr Personen als notwendig.`,
  },
  {
    title: 'Abholung',
    description: `Im dritten Schritt melden wir uns bei Dir, wenn wir ein Angebot vermitteln
      konnten. Dann stimmen wir individuell ab, wie und wann wir das Möbelstück
      abholen. Sollten wir ein Möbelstück nicht vermitteln können, wird das Angebot
      automatisch nach Ablauf aus der Datenbank gelöscht.`,
  },
];

@customElement('app-steps-widget')
export class StepsWidget extends LightElement {
  protected override render() {
    return html`
      <div class="steps__wrapper">
        ${steps.map(
          (step, i) => html`
            <div class="steps__card">
              <div class="steps__header">
                <span class="steps__number">${i + 1}</span>
                <h4 class="steps__title">${step.title}</h4>
              </div>
              <p class="steps__description">${step.description}</p>
            </div>
          `,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-steps-widget': StepsWidget;
  }
}
