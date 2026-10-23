// Validators return the key of the failed check, or null if the value is valid.
// The keys map to user facing messages in messages.ts.

export const MAX_FILESIZE = 1048576 * 5;
export const MAX_FILECOUNT = 3;

export type ValidationError =
  | 'required'
  | 'minlength'
  | 'dateInPast'
  | 'dateInFarFuture'
  | 'invalidPhoneNumber'
  | 'maxSizeExceeded'
  | 'maxCountExceeded';

export function required(value: string | boolean | unknown[]): ValidationError | null {
  const empty = typeof value === 'string' ? !value.trim() : typeof value === 'boolean' ? !value : !value.length;
  return empty ? 'required' : null;
}

// like the html minlength attribute, an empty value is left to `required`
export function minLength(value: string, min: number): ValidationError | null {
  return value && value.length < min ? 'minlength' : null;
}

export function dateNotInPast(value: string): ValidationError | null {
  return new Date(value) < new Date() ? 'dateInPast' : null;
}

export function dateNotInFarFuture(value: string): ValidationError | null {
  const maxFutureDate = new Date();
  maxFutureDate.setMonth(maxFutureDate.getMonth() + 3);
  return new Date(value) > maxFutureDate ? 'dateInFarFuture' : null;
}

export function phoneNumber(value: string): ValidationError | null {
  const phoneNumberPattern = /^(\+?\d{1,3}[-\s]?)?\d+([- ]\d+)*$/;
  const trimmed = value.trim();
  if (!trimmed) return 'required';
  return phoneNumberPattern.test(trimmed) ? null : 'invalidPhoneNumber';
}

export function fileSizeNotTooBig(files: File[]): ValidationError | null {
  return files.some((f) => f.size > MAX_FILESIZE) ? 'maxSizeExceeded' : null;
}

export function fileCountNotTooBig(files: File[]): ValidationError | null {
  return files.length > MAX_FILECOUNT ? 'maxCountExceeded' : null;
}
