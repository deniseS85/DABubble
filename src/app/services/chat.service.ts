import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  firestore: Firestore = inject(Firestore);
  userID: string = '';

  constructor() { }


  /**
   * 
   * @returns collection of call chats
   */
  getChatsRef(){
    return collection(this.firestore, 'chats')
  }

  /**
   * creates new chats
   * @param chatname says all
   * @param chatUsers JSON of both ChatUsers with all UserDatas
   */
  createNewChat(chatname: string, chatUsers: any[]){
    const newChatRef = doc(this.getChatsRef())

    setDoc(newChatRef, {
      chatID: newChatRef.id,
      chatname: chatname,
      chatUsers: chatUsers
    })
  }


  sendMessage(message: any, chatID: string){
    console.warn(chatID)
    const ref = doc(collection(this.firestore, "chats", chatID, "messages"));
    const newMessage = ({ ...message, messageID: ref.id });
    setDoc(ref, newMessage);
  }
}
