import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDocs, setDoc } from '@angular/fire/firestore';
import { Message } from '../models/message.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  
  firestore: Firestore = inject(Firestore);

  constructor() { }

  collectionRef = collection(this.firestore, "channels");
  chatObservable$ = collectionData(this.collectionRef);
  

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
  createChannel(channelname: string, description: string, userIDs: any[], users:any[], creator: string){

    const docRef = doc(this.collectionRef)

    setDoc(docRef, {
      channelID: docRef.id,
      channelname: channelname,
      channelDescription: description,
      channelUsersID: userIDs,
      channelUsers: users,
      channelCreator: creator 
    })

  }

  /**
   * 
   * @param dmID id of the channel where the message is send
   * @param message JSON of MessageData combined in component where message is written
   */
  sendChannelMessage(channelID: string, message: Message){
    const ref = doc(this.getMessageRef(channelID));

    setDoc(ref, message)
  }


  getMessageRef(channelID: string){
    return collection(this.firestore, "channel", channelID, "message");
  }


  
  sendAnswer(channelID: string, messageID: string, answer: any){
    
    const ref = doc(this.getAnswerRef(channelID, messageID));
    const newAnswer = ({...answer, answerID: ref.id});
    
    setDoc(ref, newAnswer);    
  }


  getAnswerRef(channelID: string, messageID: string){
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

  getChannelRef() {
    return collection(this.firestore, 'channels');
  }

  getChannelName(channelname: string) {
    
    return doc(collection(this.firestore, 'channels'), channelname);
    
  }
  
  getChannelDescription(channelDescription: string) {
    return doc(collection(this.firestore, 'channels'), channelDescription);
  }

  getChannelCreator(channelCreator: string) {
    return doc(collection(this.firestore, 'channels'), channelCreator);
  }

  getChannelUsers(channelUsers: string) {
    return doc(collection(this.firestore, 'channels'), channelUsers);
  }

}
