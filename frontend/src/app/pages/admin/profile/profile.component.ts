import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PocketbaseService } from '../../../services/pocketbase.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css'],
    standalone: false
})
export class ProfileComponent {

  @ViewChild('passwordForm') form: NgForm | undefined;
  constructor(private pb: PocketbaseService) { }
  value = {
    newPassword: "",
    verifyPassword: ""
  }

  changePassword() {
    if (!this.form) return
    this.form.form.markAllAsTouched();
    if (!this.form.valid) return
    alert(JSON.stringify(this.value))
  }

}
