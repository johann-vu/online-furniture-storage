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

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

// marks a field as invalid (or valid again with null) using the browser's constraint validation
export function setValidationError(field: Field, error: ValidationError | null) {
  field.setCustomValidity(error ? messageFor(error) : '');
}

// the message to show below a field, empty if the field is valid
export function errorMessage(field: Field): string {
  const v = field.validity;
  if (v.valid) return '';
  if (v.customError) return field.validationMessage;
  if (v.valueMissing) return messageFor('required');
  if (v.tooShort) return messageFor('minlength');
  return FALLBACK_MESSAGE;
}
