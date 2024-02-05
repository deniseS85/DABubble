import { Injectable, inject } from '@angular/core';
import { Channel } from '../models/channel.class';
import { Firestore, Unsubscribe, docData, onSnapshot } from '@angular/fire/firestore';
import { ChannelService } from './channel.service';
import { Observable, Subject, map } from "rxjs";
import { query, getDocs, collection, doc, where } from 'firebase/firestore';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelDataService {
  firestore: Firestore = inject(Firestore);
  channel = new Channel;
  channelInfo: Channel[] = [];
  channelName: string = '';
  channelCreator: string = '';
  channelDescription: string = '';
  channelUsers: any[] = [];
  channelID: string = '';
  channelMessages: any[] = [];
  private highlightUserSubject = new Subject<string>();
  highlightUser$ = this.highlightUserSubject.asObservable();

 /*  newChannelMember: string = ''; */
  
  /* 
  items$;
  items; */

  
  unsubChannelUser: Unsubscribe | undefined;

  constructor(
    private channelService: ChannelService
  ) {
    
    
    /* this.items$ = docData(this.channelService.getSingleChannel(this.channelID));
    this.items = this.items$.subscribe((channel) => {
      let channelInfo = new Channel(channel);
      this.channelName = channelInfo.channelname;
      this.channelUsers = channelInfo.channelUsers;
      this.channelCreator = channelInfo.channelCreator;
      this.channelDescription = channelInfo.channelDescription;
      this.channelID = channelInfo.channelID;
    }); */
    
  }
  
  setChannelID(newChannelID: string): void {
    this.channelID = newChannelID;
  }
 /*  ngOnDestroy() {
    if (this.unsubChannelUser) {
      this.unsubChannelUser();
    }
  } */


 /*  async loadFirstChannel(): Promise<void> {
    let allChannelsQuery = query(this.channelService.getChannelRef());
    let allChannelsSnapshot = await getDocs(allChannelsQuery);
  
    if (!allChannelsSnapshot.empty) {
      let firstChannelData = allChannelsSnapshot.docs[0].data();
      console.log('First Channel Data:', firstChannelData);
  
      this.channelID = firstChannelData['channelID'];
      this.channelName = firstChannelData['channelname'];
      this.channelUsers = firstChannelData['channelUsers'];
      this.channelCreator = firstChannelData['channelCreator'];
      this.channelDescription = firstChannelData['channelDescription'];
    }
  }
 */
  /* loadMessagesForChannel(channelID: string): void {
    this.channelService.getMessagesForChannel(channelID).subscribe((messages) => {
      if (messages.length === 0) {
        console.log('Keine Nachrichten für Kanal', channelID, 'gefunden.');
      } else {
        // Filtern Sie die Nachrichten, die zum angegebenen Kanal gehören
        const channelMessages = messages.filter(message => message.channelID === channelID);
        
        // Aktualisieren Sie Ihre lokale Nachrichtenliste mit den gefilterten Nachrichten
        this.channelMessages = channelMessages;
  
        console.log('Geladene Nachrichten für Kanal', channelID, this.channelMessages);
      }
    });
  } */

 



  async changeSelectedChannel(selectedChannelID: string) {
    this.channelID = selectedChannelID;
    let unsubChannel = onSnapshot(this.channelService.getChannelRef(), (list) => {
      list.forEach((channel) => {
        let currentChannel = new Channel(channel.data());
        if (currentChannel.channelID === this.channelID) {
          this.channelName = currentChannel.channelname;
          this.channelUsers = currentChannel.channelUsers;
          this.channelCreator = currentChannel.channelCreator;
          this.channelDescription = currentChannel.channelDescription;
        } 
      });
      unsubChannel();
    })
  }


  /*  async selectedChannel(target: HTMLSpanElement) {
    let selectedChannel = (target as HTMLSpanElement).textContent;

    if (selectedChannel?.includes('#')) {
      selectedChannel = selectedChannel.substring(1);
    }
    if (selectedChannel) {
      const channelID: string | null = await this.getChannelIDByName(selectedChannel);
      if (channelID) {
        console.log(channelID);
        this.channelDataService.changeSelectedChannel(channelID);
      } else {
        console.error('Channel not found');
      }
    }
  }


  async getChannelIDByName(channelName: string): Promise<string | null> {
    const channelsRef = collection(this.firestore, 'channels');
    const querySnapshot = await getDocs(query(channelsRef, where('channelname', '==', channelName)));
  
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
  
    return null;
  }
   */
  

  highlightUserInWorkspace(userFullName: string): void {
    this.highlightUserSubject.next(userFullName);
  }

}

