import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS } from '@angular/forms';

@Directive({
  selector: '[phoneNumber][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: PhoneNumberValidatorDirective,
      multi: true,
    },
  ],
})
export class PhoneNumberValidatorDirective {

  validate(control: AbstractControl): { [key: string]: any } | null {
    const phoneNumberPattern = /^(\+?\d{1,3}[-\s]?)?\d+([- ]\d+)*$/;
    const value = control.value?.trim();

    if (!value) {
      return {required: true};
    }

    if (!phoneNumberPattern.test(value)) {
      return { invalidPhoneNumber: true };
    }

    return null;
  }

}
