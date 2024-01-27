import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { Message } from '../models/message.interface';

@Injectable({
  providedIn: 'root'
})
export class directMessagesService {

  firestore: Firestore = inject(Firestore);

  constructor() { }

  collectionRef = collection(this.firestore, "directmessages");
  
  /**
   * 
   * @param otherUser Chatpartner datas
   * @param currentUser currentUser datas
   */
  createDirectmessageChat(otherUser:User, currentUser: User){
    const docRef = doc(this.collectionRef);

    setDoc(docRef, {
            id: docRef.id,
            userIDs: [currentUser.id, otherUser.id],
            users: [
              {
                displayName: currentUser.firstname + currentUser.lastname,
                profileImg: currentUser.profileImg
              },
              {
                displayName: otherUser?.firstname + currentUser.lastname,
                profileImg: otherUser?.profileImg
              }
            ],
          })       
  }


  /**
   * 
   * @param dmID id of the directmessageChat where the message is send
   * @param message JSON of MessageData combined in component where message is written
   */
  sendDirectmessage(dmID: string, message: Message){
    const ref = doc(this.getMessageRef(dmID));

    setDoc(ref, message)
  }


  getMessageRef(dmID: string){
    return collection(this.firestore, "directmessages", dmID, "message");
  }

}
