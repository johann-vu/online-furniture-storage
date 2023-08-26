import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Credentials } from 'src/app/model/credentials';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  
  @ViewChild('loginForm') form: NgForm | undefined;
  @Output() onSubmit: EventEmitter<Credentials> = new EventEmitter();


  value: Credentials = {username: "", password: ""}

  submit() {
    if (!this.form) return
    this.form.form.markAllAsTouched();
    if (this.form.valid) this.onSubmit.emit(this.form.value)
  }
}
