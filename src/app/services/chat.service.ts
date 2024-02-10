import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDocs, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  firestore: Firestore = inject(Firestore);
  userID: string = '';
  collectionChatRef = collection(this.firestore, 'chats');
  

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

  async getAllChats(): Promise<any[]> {
    const querySnapshot = await getDocs(this.collectionChatRef);
    const chats: any[] = [];
    querySnapshot.forEach((doc) => {
      chats.push(doc.data());
    });
    return chats;
  }

  sendMessage(message: any, chatID: string){
    const ref = doc(collection(this.firestore, "chats", chatID, "messages"));
    const newMessage = ({ ...message, messageID: ref.id });
    console.log(chatID)
    setDoc(ref, newMessage);
  }
}
