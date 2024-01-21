import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  firestore: Firestore = inject(Firestore);

  constructor() { }

  // createChat(otherUser: ProfilUser){

  // }
}
