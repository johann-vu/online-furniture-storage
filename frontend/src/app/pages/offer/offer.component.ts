import { Component } from '@angular/core';
import { Offer } from 'src/app/model/offer';
import { PocketbaseService } from 'src/app/services/pocketbase.service';

@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.scss']
})
export class OfferComponent {

  constructor(private pb: PocketbaseService) { }

  async handleSubmit(offer: Offer) {
    try {
      console.log(offer);
      let id = await this.pb.CreateOffer(offer)
      console.log(id);
    } catch (error) {
      console.log(error);
    }
  }

}
