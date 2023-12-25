import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS } from '@angular/forms';

const MAX_FILECOUNT = 3

@Directive({
  selector: '[fileCountNotTooBig][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: FileCountValidatorDirective,
      multi: true,
    },
  ],
})
export class FileCountValidatorDirective {

  validate(control: AbstractControl): { [key: string]: any } | null {
    const files: File[] = control.value;

    if (files.length > MAX_FILECOUNT) {
      return { maxCountExceeded: true };
    }

    return null;
  }
}
