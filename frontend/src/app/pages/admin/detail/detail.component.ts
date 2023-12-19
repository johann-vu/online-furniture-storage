import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { ReadOfferDTO } from 'src/app/model/offer';
import { PocketbaseService } from 'src/app/services/pocketbase.service';
import Viewer from 'viewerjs';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit, OnDestroy {

  @ViewChild('images', { static: false }) imagesElement: ElementRef | undefined;
  gallery: Viewer | undefined
  sub: Subscription | undefined
  id: string = ""
  offer: ReadOfferDTO | undefined

  constructor(private route: ActivatedRoute, private pb: PocketbaseService, private router: Router) { }

  ngOnInit(): void {
    this.sub = this.route.params.subscribe(async (params) => {
      try {
        this.id = params['id'];
        var offer = await this.pb.GetOfferByID(this.id)
        if (!offer) return
        this.offer = offer
      } catch (e) {
        alert(JSON.stringify(e, undefined, " "))
      }
    });
  }

  openImage(id: number) {
    if (this.imagesElement && !this.gallery) {
      this.gallery = new Viewer(this.imagesElement.nativeElement, {
        toolbar: 3, url(image: { src: string; }) {
          return image.src.replace('&thumb=180x180', '');
        }
      })
    }
    this.gallery?.moveTo(id)
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