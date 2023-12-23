import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OfferComponent } from './pages/offer/offer.component';
import { HomeComponent } from './pages/home/home.component';
import { SuccessComponent } from './pages/success/success.component';
import { LoginComponent } from './pages/login/login.component';
import { OverviewComponent } from './pages/admin/overview/overview.component';
import { DetailComponent } from './pages/admin/detail/detail.component';
import { ImprintComponent } from './pages/imprint/imprint.component';
import { AdminComponent } from './pages/admin/admin.component';
import { ProfileComponent } from './pages/admin/profile/profile.component';

const routes: Routes = [
  {
    path: "offer",
    component: OfferComponent
  },
  {
    path: "success",
    component: SuccessComponent
  },
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "admin",
    component: AdminComponent,
    children: [{
      path: "overview",
      component: OverviewComponent,
    },
    {
      path: "profile",
      component: ProfileComponent,
    },  {
      path: "detail/:id",
      component: DetailComponent
    }]
  },
  {
    path: "imprint",
    component: ImprintComponent
  },
  {
    path: "",
    component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
