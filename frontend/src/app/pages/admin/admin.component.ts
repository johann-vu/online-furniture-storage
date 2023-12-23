import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PocketbaseService } from 'src/app/services/pocketbase.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {

  constructor(private pb: PocketbaseService, private router: Router) {}


  async logout() {
    this.pb.Logout()
    this.router.navigate([""])
  }
}
