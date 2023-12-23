import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PocketbaseService } from 'src/app/services/pocketbase.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  @ViewChild('changePasswordForm') form: NgForm | undefined;

  constructor(private pb: PocketbaseService, private router: Router) { }

  value = {
    oldPassword: '',
    newPassword: '',
    verifyPassword: '',
  };

  async changePassword() {

    if (!this.form) return
    this.form.form.markAllAsTouched()
    if (this.form.invalid) return

    try {
      await this.pb.ChangePassword(this.value.oldPassword,
        this.value.newPassword, this.value.verifyPassword);
      alert("Passwort wurde geändert. Sie werden nun abgemeldet.");
      this.pb.Logout()
      this.router.navigate(["/"])
    } catch (e) {
      alert("Ein Fehler ist aufgetreten.");
    }
  }
}