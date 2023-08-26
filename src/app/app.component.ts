import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'online-furniture-storage';

  constructor(translate: TranslateService) {
    const browserLanguage = window.navigator.language;
    const userLanguage = browserLanguage.split('-')[0];
    translate.setDefaultLang('en'); // Standard-Sprache setzen
    translate.use(userLanguage); // Verwende die ausgewählte Sprache
  }
}
