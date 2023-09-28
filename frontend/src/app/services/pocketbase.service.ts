import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { CreateOfferDTO, ReadOfferDTO } from '../model/offer';

@Injectable({
  providedIn: 'root'
})
export class PocketbaseService {

  pb: PocketBase

  constructor() {
    this.pb = new PocketBase('https://online-moebellager.de:443');
  }

  public async CreateOffer(offer: CreateOfferDTO): Promise<string> {

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

  public async GetOffers(perPage: number = 10, page: number = 1): Promise<ReadOfferDTO[]> {

    const resultList = await this.pb.collection('offers').getList(page, perPage, {
      sort: '-created',
    });

    var results: ReadOfferDTO[] = []
    let token = await this.pb.files.getToken()


    resultList.items.forEach((o, i) => {

    let photos = o["photos"].map((p: string) => {
      return this.pb.files.getUrl(o, p, {'token': token, 'thumb': '180x180'})
    })

      results[i] = {
        title: o['title'],
        size: o['size'],
        available_until: o['available_until'],
        name: o['name'],
        phone: o['phone'],
        photos: photos,
        id: o.id,
        created: o.created
      }
    })
    console.log(results);

    return results
  }

  public async GetOfferByID(id: string): Promise<ReadOfferDTO> {

    const o = await this.pb.collection('offers').getOne(id)

    let token = await this.pb.files.getToken()

    let photos = o["photos"].map((p: string) => {
      return this.pb.files.getUrl(o, p, {'token': token, 'thumb': '180x180'})
    })

    let r: ReadOfferDTO =  {
      title: o['title'],
      size: o['size'],
      available_until: o['available_until'],
      name: o['name'],
      phone: o['phone'],
      photos: photos,
      id: o.id,
      created: o.created
    }

    return r
  }

  public async DeleteOfferByID(id: string): Promise<boolean> {
    return this.pb.collection('offers').delete(id);
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

  public IsLoggedIn(): boolean {
    return this.pb.authStore.isValid
  }

}
