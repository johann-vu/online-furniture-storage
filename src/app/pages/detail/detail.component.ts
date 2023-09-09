import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReadOfferDTO } from 'src/app/model/offer';
import { PocketbaseService } from 'src/app/services/pocketbase.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit, OnDestroy {

  sub: Subscription | undefined
  id: string = ""
  offer: ReadOfferDTO | undefined

  constructor(private route: ActivatedRoute, private pb: PocketbaseService) {}

  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => {
       this.id = params['id'];
       this.pb.GetOfferByID(this.id).then(o => this.offer = o)
    });
  }

  ngOnDestroy(): void {
     this.sub?.unsubscribe();
  }

  imageURL(filename: string) {
    if (!this.offer) return
    return "http://api.online-moebellager.de/api/files/offers/" + this.offer?.id + "/" + filename + "?thumb=180x180"
  }

}
