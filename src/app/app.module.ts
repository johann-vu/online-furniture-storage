import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { OfferFormComponent } from './components/offer-form/offer-form.component';
import { OfferComponent } from './pages/offer/offer.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { HeroComponent } from './components/hero/hero.component';
import { FormsModule } from '@angular/forms';
import { DateNotInPastValidatorDirective } from './directives/date-not-in-past-validator.directive';
import { DateNotInFarFutureValidatorDirective } from './directives/date-not-in-far-future-validator.directive';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { PhoneNumberValidatorDirective } from './directives/phone-number-validator.directive';
import { SuccessComponent } from './pages/success/success.component';
import { PhotoUploadComponent } from './components/photo-upload/photo-upload.component';
import { FileSizeValidatorDirective } from './directives/file-size-validator.directive';
import { LoginComponent } from './pages/login/login.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { OfferCardComponent } from './components/offer-card/offer-card.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "/online-furniture-storage/assets/i18n/");
}

@NgModule({
  declarations: [
    AppComponent,
    TopbarComponent,
    OfferFormComponent,
    OfferComponent,
    FooterComponent,
    HomeComponent,
    HeroComponent,
    DateNotInPastValidatorDirective,
    DateNotInFarFutureValidatorDirective,
    PhoneNumberValidatorDirective,
    SuccessComponent,
    PhotoUploadComponent,
    FileSizeValidatorDirective,
    LoginComponent,
    LoginFormComponent,
    OverviewComponent,
    OfferCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
  })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
