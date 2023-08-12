import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OfferComponent } from './pages/offer/offer.component';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
  {
    path: "offer",
    component: OfferComponent
  },
  {
    path: "",
    component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
