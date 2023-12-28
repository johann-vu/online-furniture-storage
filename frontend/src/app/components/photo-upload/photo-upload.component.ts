import { Component } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ValidationErrors } from '@angular/forms';
import { MAX_FILESIZE } from 'src/app/directives/file-size-validator.directive';
import { ImageResizeService } from 'src/app/services/image-resize.service';

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

  errors: ValidationErrors | null | undefined

  files: File[] = [];

  constructor(private resizeService: ImageResizeService) {}

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

  async onFileSelect(event: any) {
    const fileList: FileList = event.target.files;
    for (let i = 0; i < fileList.length; i++) {
      var file = fileList[i];
      if (file.size > MAX_FILESIZE) {
        try {
          file = await this.resizeService.resizeImage(file, 1200, 1200)
        } catch (e) {
          console.error(e);
          
        }
      }
      this.files.push(file)
    }
    this.markAsTouched()
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
