import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  firestore: Firestore = inject(Firestore);
  userID: string = '';
  collectionChatRef = collection(this.firestore, 'chats');
  allUsers: any[] = [];
/*   chatID: string | null = null; */
  

  constructor() { }


  /**
   * 
   * @returns collection of call chats
   */
  getChatsRef(){
    return collection(this.firestore, 'chats')
  }

  getUsersRef(){
    return collection(this.firestore, 'users')
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
    setDoc(ref, newMessage);
  }


  async createChatsForNewUser(userData: any, userID: string){    

    userData = ({...userData, id: userID});
    const allUsersQuery = query(this.getUsersRef())

    onSnapshot(allUsersQuery, (querySnapshot) => {      
      this.buildUserArray(querySnapshot);
      this.allUsers.forEach((user: any) => {
        this.buildNewChat(user, userData);   
        })      
    });
  }


buildUserArray(querySnapshot: any){
    querySnapshot.forEach((doc: any) => {
    this.allUsers.push(doc.data())
  });
}

buildNewChat(user: any, userData: any){
  let newChat :any[] = [];

  if (user.id == userData.id) {
    newChat.push(userData.id)
  } else {
    newChat.push(user.id, userData.id)
  }

  const chatname = user.firstname + ' & ' + userData.firstname;
  const chatUsers = newChat;
  this.createNewChat(chatname, chatUsers)
  console.warn("new Chat createt", chatname)
}

async loadChat(chatID: string): Promise<any> {
    const chatDocRef = doc(this.firestore, 'chats', chatID);
    const chatDocSnapshot = await getDoc(chatDocRef);

    if (chatDocSnapshot.exists()) {
      return chatDocSnapshot.data();
    } else {
      console.error(`Chat mit ID ${chatID} nicht gefunden.`);
      return null;
    }
}

async getChatIDByUserIDs(user1ID: string, user2ID: string): Promise<string | null> {
  const querySnapshot1 = await getDocs(
    query(collection(this.firestore, 'chats'), where('chatUsers', 'array-contains', user1ID))
  );

  const querySnapshot2 = await getDocs(
    query(collection(this.firestore, 'chats'), where('chatUsers', 'array-contains', user2ID))
  );

  const matchingChats = querySnapshot1.docs.filter(doc1 =>
    querySnapshot2.docs.some(doc2 => doc1.id === doc2.id)
  );

  if (matchingChats.length > 0) {
    return matchingChats[0].data()['chatID'];
  }

  return null;
}

}
