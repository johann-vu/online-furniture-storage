import { Component, OnInit } from '@angular/core';
import { ReadOfferDTO } from 'src/app/model/offer';
import { PocketbaseService } from 'src/app/services/pocketbase.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  offers : ReadOfferDTO[] = []

  perPage = 1;
  page = 1;

  constructor(private pb: PocketbaseService) {}

  ngOnInit(): void {
    this.pb.GetOffers(this.perPage, this.page).then(o => this.offers = o)
  }

  async loadOffers() {
    let loadedOffers = await this.pb.GetOffers(this.perPage, this.page+1)
    loadedOffers.forEach(o => this.offers.push(o))
    this.page++
  }

}
