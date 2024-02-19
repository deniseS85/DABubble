import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDocs, setDoc } from '@angular/fire/firestore';
import { Message } from '../models/message.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { DocumentData, DocumentSnapshot, QueryDocumentSnapshot, QuerySnapshot, Unsubscribe, addDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  firestore: Firestore = inject(Firestore);

  constructor(private authService: AuthService, private userservice: UserService) { }

  public userDataSubject = new BehaviorSubject<any>(null);
  userData$ = this.userDataSubject.asObservable();
  collectionRef = collection(this.firestore, "channels");
  chatObservable$ = collectionData(this.collectionRef);

  /* activeChannelID: string = '4w03K0592Ephea3D9fsK'; */
  activeMessageID: string = '';
  allAnswers: any[] = [];
  allMessages: any[] = [];


  /**
   * create Arrays and JSON's in component where channel is 
   * @param channelname Name given when created
   * @param description description given when created
   * @param userIDs Array of all userID's which are invited to this channel
   * @param users array of JSON's  of the users which are invited to this channel
   * @param creator first and lastname of the creator (currentUser)
   * *  user{
   *    firstname: user.firstname,
   *    lastname: user.lastname,
   *    profilImg: user.profilImg,   * 
   * }
   */
  createChannel(channelname: string, description: string, users: any[], creator: string) {

    const docRef = doc(this.collectionRef)

    setDoc(docRef, {
      channelID: docRef.id,
      channelname: channelname,
      channelDescription: description,
      channelUsers: users,
      channelCreator: creator

    });
  }

  /**
   * 
   * @param dmID id of the channel where the message is send
   * @param message JSON of MessageData combined in component where message is written
   */
  async sendChannelMessage(channelID: string, message: Message) {
    const ref = doc(await this.getMessageRef(channelID));

    setDoc(ref, message)
  }


  async getMessageRef(channelID: string) {
    return collection(this.firestore, "channels", channelID, "messages");
  }


  sendAnswer(channelID: string, messageID: string, answer: any) {

    const ref = doc(this.getAnswerRef(channelID, messageID));
    const newAnswer = ({ ...answer, answerID: ref.id });

    setDoc(ref, newAnswer);
  }

  async sendMessage(channelID: string, message: any) {

    const ref = doc(await this.getMessageRef(channelID));
    const newMessage = ({ ...message, messageID: ref.id });
    setDoc(ref, newMessage);
  }

  getAnswerRef(channelID: string, messageID: string) {
    return collection(this.firestore, "channels", channelID, "messages", messageID, "answers")
  }

  getUsersRef() {
    return collection(this.firestore, 'users');
  }

  getChannels(): Observable<any[]> {
    return this.chatObservable$;
  }

  async getAllChannels(): Promise<any[]> {
    const querySnapshot = await getDocs(this.collectionRef);
    const channels: any[] = [];
    querySnapshot.forEach((doc) => {
      channels.push(doc.data());
    });
    return channels;
  }

  async getAllMessages(): Promise<any[]> {
    const channels = await this.getAllChannels();
    const allMessages: any[] = [];

    for (const channel of channels) {
      const messagesRef = await this.getMessageRef(channel.channelID);
      const querySnapshot = await getDocs(messagesRef);

      querySnapshot.forEach((doc) => {
        const messageData = doc.data();
        messageData['channelID'] = channel.channelID;
        allMessages.push(messageData);
      });
    }
    return allMessages;
  }

  async updateChannelIsUserMember(channelID: string, isUserMember: boolean): Promise<void> {
    const updateObject = {
      isUserMember: isUserMember,
    };
    console.log('Updating channel isUserMember status:', updateObject);
    await this.updateChannel(channelID, updateObject);
  }


  async addNewChannel(newChannel: {}) {
    await addDoc(this.getChannelRef(), newChannel).catch(
      (err) => { console.error(err) });
  }

  async addChannelUser(channelId: string, newChannelUsers: any) {
    this.updateChannel(channelId, { channelUsersID: newChannelUsers });
  }

  async updateChannel(channelID: string, item: {}) {
    await updateDoc(this.getSingleChannel(channelID), item);
  }

  getChannelRef() {
    return collection(this.firestore, 'channels');
  }

  getChannelName(channelname: string) {
    return doc(collection(this.firestore, 'channels'), channelname);
  }

  getSingleChannel(channelId: string) {
    return doc(collection(this.firestore, 'channels'), channelId)
  }

  getSingelChannelRef(docId: string) {
    return doc(collection(this.firestore, 'channels'), docId);
  }

  async getChannelById(channelId: string): Promise<any | null> {
    try {
      const channelDoc = await getDoc(this.getSingleChannel(channelId));
      if (channelDoc.exists()) {
        return channelDoc.data();
      } else {
        console.error(`Channel with ID ${channelId} not found.`);
        return null;
      }
    } catch (error) {
      console.error('Error getting channel by ID', error);
      return null;
    }
  }
  

  removeSelectedChannels(): void {
    const selectableElements = document.querySelectorAll('.selectable');
    selectableElements.forEach((element: HTMLElement) => element.classList.remove('selected'));
  }

  async getChannelUsers(channelID: string): Promise<any[]> {
      const channelDoc = await getDoc(this.getSingleChannel(channelID));
    
      if (channelDoc.exists()) {
        const channelData = channelDoc.data();
        return channelData['channelUsers'] || [];
      } else {
        console.error(`Channel with ID ${channelID} not found.`);
        return [];
      }
  }
}


