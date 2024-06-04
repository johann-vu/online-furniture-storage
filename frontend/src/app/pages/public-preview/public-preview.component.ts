import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PublicOfferDTO } from 'src/app/model/offer';
import { PocketbaseService } from 'src/app/services/pocketbase.service';

@Component({
	selector: 'app-public-preview',
	templateUrl: './public-preview.component.html',
	styleUrl: './public-preview.component.scss'
})
export class PublicPreviewComponent {
	sub: Subscription | undefined
	id: string = ""
	offer: PublicOfferDTO | undefined

	constructor(private route: ActivatedRoute, private pb: PocketbaseService) { }

	ngOnInit(): void {
		this.sub = this.route.params.subscribe(async (params) => {
			try {
				this.offer = await this.pb.GetOfferByID(params['id'])
			} catch (e) {
				alert(JSON.stringify(e, undefined, " "))
			}
		});
	}
}
