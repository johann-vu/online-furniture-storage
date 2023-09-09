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
    return "http://api.online-moebellager.de/api/files/offers/" + this.offer?.id + "/" + this.offer?.photos[0] + "?thumb=180x180"
  }
}
