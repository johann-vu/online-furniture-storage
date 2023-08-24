import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS } from '@angular/forms';

const MAX_FILESIZE = 1048576*5

@Directive({
  selector: '[fileSizeNotTooBig][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: FileSizeValidatorDirective,
      multi: true,
    },
  ],
})
export class FileSizeValidatorDirective {

  validate(control: AbstractControl): { [key: string]: any } | null {
    const files: File[] = control.value;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILESIZE) {
        return { maxSizeExceeded: true };
      }
    }
    
    return null;
  }
}
