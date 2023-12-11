import { Component } from '@angular/core';

@Component({
  selector: 'app-steps-widget',
  templateUrl: './steps-widget.component.html',
  styleUrls: ['./steps-widget.component.scss']
})
export class StepsWidgetComponent {

  steps: Step[] = [
    {
      title: "Erstellung",
      description: `Im ersten Schritt erstellst Du ein Angebot auf dieser Seite. Das Angebot
      sollte ein paar wesentliche Informationen zum Möbelstück umfassen, ein
      paar Fotos sowie Deine Kontaktdaten. Außerdem solltest Du angeben, wie lange Du das Möbelstück bereithalten bzw.
      aufbewahren kannst.`,
      imageURL: undefined
    },
    {
      title: "Vermittlung",
      description: `Im zweiten Schritt versuchen wir das Angebot zu vermitteln. Ehrenamtliche
      Helfer, die in unserer Gemeinde aktiv sind, überprüfen regelmäßig die
      Angebote. Nur eine kleine Gruppe Helfer hat Zugriff auf die Angebote,
      nicht mehr Personen als notwendig.`,
      imageURL: undefined
    },
    {
      title: "Abholung",
      description: `Im dritten Schritt melden wir uns bei Dir, wenn wir ein Angebot vermitteln
      konnten. Dann stimmen wir individuell ab, wie und wann wir das Möbelstück
      abholen. Sollten wir ein Möbelstück nicht vermitteln können, wird das Angebot
      automatisch nach Ablauf aus der Datenbank gelöscht.`,
      imageURL: undefined
    }
  ]

}

interface Step {
  title: string
  description: string
  imageURL: string | undefined
}