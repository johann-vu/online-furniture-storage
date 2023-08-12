import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OfferFormComponent } from './components/offer-form/offer-form.component';

const routes: Routes = [
  {
    path: "offer",
    component: OfferFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
