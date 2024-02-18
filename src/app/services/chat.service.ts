import { Injectable, inject } from '@angular/core';
import { Firestore, Unsubscribe, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  firestore: Firestore = inject(Firestore);
  userID: string = '';
  collectionChatRef = collection(this.firestore, 'chats');
  allUsers: any[] = [];
  private unsubscribeSnapshot: Unsubscribe | undefined;
  /*   chatID: string | null = null; */


  constructor() { }

  ngOnDestroy() {
    if (this.unsubscribeSnapshot) {
        this.unsubscribeSnapshot();
    }
  }

  /**
   * 
   * @returns collection of call chats
   */
  getChatsRef() {
    return collection(this.firestore, 'chats')
  }

  getUsersRef() {
    return collection(this.firestore, 'users')
  }

  /**
   * creates new chats
   * @param chatname says all
   * @param chatUsers JSON of both ChatUsers with all UserDatas
   */
  createNewChat(chatname: string, chatUsers: any[]) {
    const newChatRef = doc(this.getChatsRef())

  /*   console.log(newChatRef.id, chatname, chatUsers) */

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

  sendMessage(message: any, chatID: string) {
    const ref = doc(collection(this.firestore, "chats", chatID, "messages"));
    const newMessage = ({ ...message, messageID: ref.id });
    setDoc(ref, newMessage);
  }


  async createChatsForNewUser(userData: any, userID: string) {

    userData = ({ ...userData, id: userID });
    const allUsersQuery = query(this.getUsersRef())

    this.unsubscribeSnapshot = onSnapshot(allUsersQuery, (querySnapshot) => {
      this.buildUserArray(querySnapshot);
      this.allUsers.forEach((user: any) => {
        this.buildNewChat(user, userData);
      })
    });
  }


  buildUserArray(querySnapshot: any) {
    querySnapshot.forEach((doc: any) => {
      this.allUsers.push(doc.data())
    });
  }

  buildNewChat(user: any, userData: any) {
    let newChat: any[] = [];

    if (user.id == userData.id) {
      newChat.push(userData.id)
    } else {
      newChat.push(user.id, userData.id)
    }

    const chatname = user.firstname + ' & ' + userData.firstname;
    const chatUsers = newChat;
    this.createNewChat(chatname, chatUsers)
   /*  console.warn("new Chat createt", chatname) */
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

  async getChatIDForSameUser(user1ID: string, user2ID: string): Promise<string | null> {
    const querySnapshot = await getDocs(
      query(collection(this.firestore, 'chats'), where('chatUsers', '==', [user1ID]))
    );

    for (const doc of querySnapshot.docs) {
      const chatData = doc.data();
      const chatUsers = chatData['chatUsers'];

      if (chatUsers.length === 1 && chatUsers.includes(user1ID)) {
        return chatData['chatID'];
      }
    }
    return null;
  }

  async getChatIDForDifferentUsers(user1ID: string, user2ID: string): Promise<string | null> {
    const querySnapshot = await getDocs(
      query(collection(this.firestore, 'chats'), where('chatUsers', '==', [user1ID, user2ID]))
    );

    for (const doc of querySnapshot.docs) {
      const chatData = doc.data();
      const chatUsers = chatData['chatUsers'];

      if (chatUsers.length === 2 && chatUsers.includes(user1ID) && chatUsers.includes(user2ID)) {
        return chatData['chatID'];
      }
    }
    return null;
  }


  createChatsForGuest(guestID) {

    const allUsersQuery = query(this.getUsersRef())

    this.unsubscribeSnapshot = onSnapshot(allUsersQuery, (querySnapshot) => {      
      this.buildUserArray(querySnapshot);
      this.allUsers.forEach((user: any) => {
        this.buildNewChatGuest(user, guestID);
      })
    });
  }

  buildNewChatGuest(user: any, guestID: any) {
    let newChat: any[] = [];

    newChat.push(user.id, guestID);    

    const chatname = user.firstname + ' & Gast';
    const chatUsers = newChat;
    this.createNewChat(chatname, chatUsers)
   /*  console.warn("new Chat createt", chatname) */
  }


  async deleteChatOfGuestUser(id: string) {

    const querySnapshot = await getDocs(
      query(collection(this.firestore, 'chats'), where('chatUsers', 'array-contains', id))
    );
    if (!querySnapshot.empty) {
      querySnapshot.forEach(async (chat) => {
        await deleteDoc(chat.ref)
      /*   console.log("GuestChat deleted ", chat.data()['chatname']) */
      })
    } else {
     /*  console.warn('no Guest Chats to delete') */
    }

  }
}
