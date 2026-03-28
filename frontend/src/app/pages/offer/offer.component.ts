import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PocketbaseService } from '../../services/pocketbase.service';
import { CreateOfferDTO } from '../../model/offer';

@Component({
    selector: 'app-offer',
    templateUrl: './offer.component.html',
    styleUrls: ['./offer.component.css'],
    standalone: false
})
export class OfferComponent {

  constructor(private pb: PocketbaseService, private router: Router) { }

  async handleSubmit(offer: CreateOfferDTO) {
    try {
      console.log(offer);
      let id = await this.pb.CreateOffer(offer)
      this.router.navigate(["success"], { queryParams: { id: id } })
    } catch (error) {
      console.log(error);
      alert(JSON.stringify(error, undefined, " "))
    }
  }
}
