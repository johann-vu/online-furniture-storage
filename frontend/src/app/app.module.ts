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
import { HttpClientModule } from '@angular/common/http';
import { PhoneNumberValidatorDirective } from './directives/phone-number-validator.directive';
import { SuccessComponent } from './pages/success/success.component';
import { PhotoUploadComponent } from './components/photo-upload/photo-upload.component';
import { FileSizeValidatorDirective } from './directives/file-size-validator.directive';
import { LoginComponent } from './pages/login/login.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { OverviewComponent } from './pages/admin/overview/overview.component';
import { OfferCardComponent } from './components/offer-card/offer-card.component';
import { ValidationErrorsPipe } from './directives/validation-errors.pipe';
import { DetailComponent } from './pages/admin/detail/detail.component';
import { ImprintComponent } from './pages/imprint/imprint.component';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { StepsWidgetComponent } from './components/steps-widget/steps-widget.component';
import { AdminComponent } from './pages/admin/admin.component';
import { ProfileComponent } from './pages/admin/profile/profile.component';

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
    OfferCardComponent,
    ValidationErrorsPipe,
    DetailComponent,
    ImprintComponent,
    SplashScreenComponent,
    StepsWidgetComponent,
    AdminComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
