import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { Offer } from '../model/offer';

@Injectable({
  providedIn: 'root'
})
export class PocketbaseService {

  pb: PocketBase

  constructor() {
    this.pb = new PocketBase('https://online-moebellager.de');
  }

  public async CreateOffer(offer: Offer): Promise<string> {

    const formData = new FormData();

    formData.append('title', offer.title);
    formData.append('size', offer.size);
    formData.append('available_until', offer.available_until.toString());
    formData.append('name', offer.name);
    formData.append('phone', offer.phone);


    for (let photo of offer.photos) {
      formData.append('photos', photo);
    }

    let record = await this.pb.collection('offers').create(formData);
    return record.id
  }

  public async Login(username: string, password: string) {
    await this.pb.collection('users').authWithPassword(
      username,
      password,
    );
  }

  public Logout() {
    this.pb.authStore.clear();
  }

}
