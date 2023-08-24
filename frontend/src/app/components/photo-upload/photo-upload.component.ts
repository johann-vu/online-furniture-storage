import { Component } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-photo-upload',
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: PhotoUploadComponent,
      multi: true,
    }
  ]
})
export class PhotoUploadComponent implements ControlValueAccessor {

  files: File[] = [];

  onChange = (x: any) => { console.log(x)  }
  onTouched: any
  touched = false;
  disabled = false;

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  writeValue(v: File[]) {
    this.files = v
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  onFileSelect(event: any): void {
    this.markAsTouched()
    this.files = []
    const fileList: FileList = event.target.files;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      this.files.push(file)
    }
    this.onChange(this.files)
  }

  onFileDelete(f: File) {
    this.markAsTouched()
    if (!this.files) return
    let i = this.files.indexOf(f)
    if (i < 0) return
    this.files.splice(i, 1)
    this.onChange(this.files)
  }

}
