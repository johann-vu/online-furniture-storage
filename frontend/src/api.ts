import PocketBase, { type RecordModel } from 'pocketbase';
import type { CreateOfferDTO, ReadOfferDTO } from './model/offer';
import type { OfferComment } from './model/comment';

// in production the backend serves the frontend, so the API is on the same origin
export const pb = new PocketBase(import.meta.env.DEV ? 'http://127.0.0.1:8090' : '/');

function toReadOffer(o: RecordModel, token: string): ReadOfferDTO {
  return {
    title: o['title'],
    size: o['size'],
    available_until: o['available_until'],
    name: o['name'],
    phone: o['phone'],
    category: o['category'],
    photos: o['photos'].map((p: string) => pb.files.getURL(o, p, { token, thumb: '180x180' })),
    id: o.id,
    created: o['created'],
    number: o['number'],
    description: o['description'],
    commentCount: o.expand?.['comments_via_offer']?.length,
  };
}

export async function createOffer(offer: CreateOfferDTO): Promise<string> {
  const formData = new FormData();
  formData.append('title', offer.title);
  formData.append('size', offer.size);
  formData.append('available_until', offer.available_until);
  formData.append('name', offer.name);
  formData.append('phone', offer.phone);
  formData.append('category', offer.category);
  formData.append('description', offer.description);
  for (const photo of offer.photos) {
    formData.append('photos', photo);
  }

  const record = await pb.collection('offers').create(formData);
  return record.id;
}

export async function getOffers(perPage = 10, page = 1): Promise<ReadOfferDTO[]> {
  // the back-relation expand delivers the comments of each offer, only their ids are needed for the count
  const resultList = await pb.collection('offers').getList(page, perPage, {
    sort: '-created',
    expand: 'comments_via_offer',
    fields: '*,expand.comments_via_offer.id',
  });
  const token = await pb.files.getToken();
  return resultList.items.map((o) => toReadOffer(o, token));
}

export async function getOfferById(id: string): Promise<ReadOfferDTO> {
  const o = await pb.collection('offers').getOne(id);
  const token = await pb.files.getToken();
  return toReadOffer(o, token);
}

export async function deleteOffer(id: string): Promise<boolean> {
  return pb.collection('offers').delete(id);
}

export async function login(username: string, password: string) {
  await pb.collection('users').authWithPassword(username, password);
}

export function logout() {
  pb.authStore.clear();
}

export function isLoggedIn(): boolean {
  return pb.authStore.isValid;
}

export async function changePassword(oldPassword: string, newPassword: string, verifyPassword: string) {
  const user = pb.authStore.record;
  if (!user) return;

  await pb.collection('users').update(user.id, {
    password: newPassword,
    passwordConfirm: verifyPassword,
    oldPassword: oldPassword,
  });
}

export async function getComments(offerId: string): Promise<OfferComment[]> {
  const records = await pb.collection('comments').getList(1, 50, {
    filter: pb.filter('offer = {:offerId}', { offerId }),
    expand: 'author',
    sort: 'created',
  });

  return records.items.map((r) => ({
    text: r['text'],
    author: r.expand?.['author']?.['name'] ?? '',
    created: r['created'],
  }));
}

export async function createComment(offerId: string, text: string) {
  const user = pb.authStore.record;
  if (!user) return;

  const formData = new FormData();
  formData.append('offer', offerId);
  formData.append('text', text);
  formData.append('author', user.id);
  await pb.collection('comments').create(formData);
}
