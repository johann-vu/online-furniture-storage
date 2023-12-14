import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Credentials } from 'src/app/model/credentials';
import { PocketbaseService } from 'src/app/services/pocketbase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{

  constructor(private pb: PocketbaseService, private router: Router) { }

  ngOnInit(): void {
    if (this.pb.IsLoggedIn()) this.router.navigate(["admin", "overview"])
  }

  login(c: Credentials) {
    this.pb.Login(c.username, c.password)
      .then(() => this.router.navigate(["admin", "overview"]))
      .catch(e => alert(e))
  }

}
