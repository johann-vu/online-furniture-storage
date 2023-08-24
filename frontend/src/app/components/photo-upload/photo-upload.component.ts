import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-photo-upload',
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.scss'],
})
export class PhotoUploadComponent {

  files: File[] = [];

  @Output() valueChange: EventEmitter<File[]> = new EventEmitter()

  onFileSelect(event: any): void {
    this.files = []
    const fileList: FileList = event.target.files;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      this.files.push(file)
    }
    this.emitChange()
  }

  onFileDelete(f: File) {
    if (!this.files) return
    let i = this.files.indexOf(f)
    if (i < 0) return
    this.files.splice(i, 1)
    this.emitChange()
  }

  emitChange() {
    console.log(this.files);
    this.valueChange.emit(this.files)
  }

}
