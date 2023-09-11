import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, of } from 'rxjs';
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

  constructor(private route: ActivatedRoute, private pb: PocketbaseService, private router: Router) { }

  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.pb.GetOfferByID(this.id)
        .then(o => this.offer = o)
        .catch(e => alert(JSON.stringify(e, undefined, " ")))
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  deleteOffer() {
    if (!this.offer) return
    if (confirm("Möchtest du das Angebot \"" + this.offer.title + "\" wirklich löschen?") == true) {
      this.pb.DeleteOfferByID(this.offer.id)
        .then(() => this.router.navigate(["overview"]))
        .catch(e => alert(JSON.stringify(e, undefined, " ")))
    }
  }

}
