import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OfferComponent } from './pages/offer/offer.component';
import { HomeComponent } from './pages/home/home.component';
import { SuccessComponent } from './pages/success/success.component';
import { LoginComponent } from './pages/login/login.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { DetailComponent } from './pages/detail/detail.component';

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
    path: "login",
    component: LoginComponent
  },
  {
    path: "overview",
    component: OverviewComponent
  },
  {
    path: "detail/:id",
    component: DetailComponent
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
