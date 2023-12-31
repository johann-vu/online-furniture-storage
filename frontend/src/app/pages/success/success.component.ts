import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {
  
  ngOnInit(): void {
    if (!navigator.share) return
    this.supportsShare = true
  }

  supportsShare: boolean = false

  async shareContent() {
    const shareData = {
      title: 'Online Möbellager',
      text: 'Über das Online Möbellager kannst Du Möbel und Fahrräder spenden. Sieh es Dir doch mal an!',
      url: 'https://online-mobellager.de'
    };
    navigator.share(shareData)
  }
}
