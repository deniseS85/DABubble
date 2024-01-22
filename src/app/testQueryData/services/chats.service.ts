import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, doc, setDoc } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { Observable, concat, concatMap, map, take } from 'rxjs';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root'
})
export class ChatsService {

  user: any = {
    firstname: "Harry",
    lastname: "Potter",
    profileImg: "./assets/img/avatar2.png",
    id: "K1"
  }

  firestore: Firestore = inject(Firestore);
  collectionRef = collection(this.firestore, "chats");
  chatObservable$ = collectionData(this.collectionRef)

  constructor(private userService: UsersService) { }


  createChat(otherUser:User){
    const docRef = doc(this.collectionRef);

    setDoc(docRef, {
            id: docRef.id,
            userIDs: [this.user.id, otherUser.id],
            users: [
              {
                displayName: this.user.firstname,
                profileImg: this.user.profileImg
              },
              {
                displayName: otherUser?.firstName || '',
                profileImg: otherUser?.profileImg
              }
            ],
            lastMessage: "Hey, wie gehts?",
            lastMessageDate: "21.01.2024",
          })       
  }  
}
