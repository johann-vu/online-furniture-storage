import { Pipe, PipeTransform } from '@angular/core';

const MESSAGES: { [key: string]: string } = {
  "REQUIRED": "Pflichtfeld.",
  "MINLENGTH": "Bitte gib mehr Informationen an.",
  "DATEINPAST": "Bitte gib einen Wert in der Zukunft an.",
  "DATEINFARFUTURE": "Bitte gib einen Wert in der näheren Zukunft an.",
  "INVALIDPHONENUMBER": "Bitte gib eine gültige Telefonnummer an.",
  "MAXSIZEEXCEEDED": "Eine der Dateien ist zu groß.",
  "MAXCOUNTEXCEEDED": "Bitte wähle nur bis zu drei Dateien aus."
}

const FALLBACK_MESSAGE = "Ungültige Eingabe."

@Pipe({
  name: 'validationErrors'
})
export class ValidationErrorsPipe implements PipeTransform {

  transform(value: string): string {
    let msg = MESSAGES[value.toUpperCase()]
    if (!msg) return FALLBACK_MESSAGE
    return msg
  }

}
