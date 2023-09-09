import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CreateOfferDTO } from 'src/app/model/offer';

@Component({
  selector: 'app-offer-form',
  templateUrl: './offer-form.component.html',
  styleUrls: ['./offer-form.component.scss']
})
export class OfferFormComponent {

  @ViewChild('offerForm') form: NgForm | undefined;

  @Output() onSubmit: EventEmitter<CreateOfferDTO> = new EventEmitter();

  value: CreateOfferDTO = {
    title: "", size: "", available_until: this.getDefaultDate(), name: "", phone: "", photos: []
  }

  public showErrorMsg(field: string): boolean {
    const f  = this.form?.controls[field]
    if (!f) return false;
    return f.invalid && f.touched
  }

  submit() {
    if (!this.form) return
    this.form.form.markAllAsTouched();
    if (this.form.valid) this.onSubmit.emit(this.form.value)
    console.log(this.value);
    
  }

  getDefaultDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7*6)
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }
}
