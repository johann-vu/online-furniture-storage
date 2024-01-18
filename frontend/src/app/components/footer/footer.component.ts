import { AfterContentInit, AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements AfterViewInit {

  @ViewChild('wcb') wcb: ElementRef | undefined;

  ngAfterViewInit(): void {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/website-carbon-badges@1.1.3/b.min.js';
    script.defer = true;
    this.wcb?.nativeElement.appendChild(script)
  }
}
