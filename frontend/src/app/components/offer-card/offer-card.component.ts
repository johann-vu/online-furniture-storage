import { Component, Input } from '@angular/core';
import { ReadOfferDTO } from 'src/app/model/offer';

@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrls: ['./offer-card.component.scss']
})
export class OfferCardComponent {
  @Input() offer: ReadOfferDTO | undefined

  imageURL() {
    if (!this.offer) return
    return this.offer?.photos[0]
  }

  calculateRemainingDays(expiryDate: string | undefined): number {
    if (!expiryDate) return 0 
    const currentDate = new Date();
    const expiryDateObj = new Date(expiryDate);
    const timeDiff = expiryDateObj.getTime() - currentDate.getTime();
    const remainingDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return remainingDays;
  }
}
