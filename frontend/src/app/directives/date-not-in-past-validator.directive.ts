import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS } from '@angular/forms';

@Directive({
  selector: '[dateNotInPast][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: DateNotInPastValidatorDirective,
      multi: true,
    },
  ],
})
export class DateNotInPastValidatorDirective {
  
  validate(control: AbstractControl): { [key: string]: any } | null {
    const selectedDate = new Date(control.value);
    const currentDate = new Date();

    if (selectedDate < currentDate) {
      return { dateInPast: true };
    }

    return null;
  }
}
