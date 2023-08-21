import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { Offer } from '../model/offer';

@Injectable({
  providedIn: 'root'
})
export class PocketbaseService {

  pb: PocketBase

  constructor() {
    this.pb = new PocketBase('http://127.0.0.1:8090');
  }

  public async CreateOffer(offer: Offer): Promise<string> {

    const data = {
      "title": offer.title,
      "size": offer.size,
      "available_until": offer.available_until.toString(),
      "name": offer.name,
      "phone": offer.phone
    };

    try {
      let record = await this.pb.collection('offers').create(data);
      return record.id
    } catch (error) {
      return ""
    }
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
