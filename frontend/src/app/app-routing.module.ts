import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OfferComponent } from './pages/offer/offer.component';
import { HomeComponent } from './pages/home/home.component';
import { SuccessComponent } from './pages/success/success.component';

const routes: Routes = [
  {
    path: "offer",
    component: OfferComponent
  },
  {
    path:"success",
    component: SuccessComponent
  },
  {
    path: "",
    component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
