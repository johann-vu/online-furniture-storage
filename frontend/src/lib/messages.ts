import type { ValidationError } from './validators';

const MESSAGES: Record<ValidationError, string> = {
  required: 'Pflichtfeld.',
  minlength: 'Bitte gib mehr Informationen an.',
  dateInPast: 'Bitte gib einen Wert in der Zukunft an.',
  dateInFarFuture: 'Bitte gib einen Wert in der näheren Zukunft an.',
  invalidPhoneNumber: 'Bitte gib eine gültige Telefonnummer an.',
  maxSizeExceeded: 'Eine der Dateien ist zu groß.',
  maxCountExceeded: 'Bitte wähle nur bis zu drei Dateien aus.',
};

const FALLBACK_MESSAGE = 'Ungültige Eingabe.';

export function messageFor(error: ValidationError): string {
  return MESSAGES[error] ?? FALLBACK_MESSAGE;
}
