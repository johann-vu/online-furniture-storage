import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS } from '@angular/forms';

@Directive({
  selector: '[dateNotInFarFuture][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: DateNotInFarFutureValidatorDirective,
      multi: true,
    },
  ],
})
export class DateNotInFarFutureValidatorDirective {

  validate(control: AbstractControl): { [key: string]: any } | null {
    const selectedDate = new Date(control.value);
    const currentDate = new Date();
    const maxFutureDate = new Date();
    maxFutureDate.setMonth(currentDate.getMonth() + 3);

    if (selectedDate > maxFutureDate) {
      return { dateInFarFuture: true };
    }

    return null;
  }
}
