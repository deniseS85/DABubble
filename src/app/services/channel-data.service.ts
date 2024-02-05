import { Injectable, inject } from '@angular/core';
import { Channel } from '../models/channel.class';
import { Firestore, Unsubscribe, docData, onSnapshot } from '@angular/fire/firestore';
import { ChannelService } from './channel.service';
import { Observable, Subject, map } from "rxjs";
import { query, getDocs, collection, doc } from 'firebase/firestore';
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
    this.loadFirstChannel().then(() => {
      console.log('Die erste channelID wurde erfolgreich geladen:', this.channelID);
      this.loadMessagesForChannel(this.channelID);
    });
    
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
  
  ngOnDestroy() {
    if (this.unsubChannelUser) {
      this.unsubChannelUser();
    }
  }


  async loadFirstChannel(): Promise<void> {
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

  loadMessagesForChannel(channelID: string): void {
    this.channelService.getMessagesForChannel(channelID).subscribe((messages) => {
      if (messages.length === 0) {
        console.log('Keine Nachrichten für Kanal', channelID, 'gefunden.');
      } else {
        // Filtern Sie die Nachrichten, die zum angegebenen Kanal gehören
        const channelMessages = messages.filter(message => message.channelID === channelID);
        
        console.log('Geladene Nachrichten für Kanal', channelID, channelMessages);
      }
    });
  }



  async changeSelectedChannel(selectedChannelName: string) {
      this.channelName = selectedChannelName;
      let unsubChannel = onSnapshot(this.channelService.getChannelRef(), (list) => {
        list.forEach((channel) => {
          let currentChannel = new Channel(channel.data());
          if (currentChannel.channelname === this.channelName) {
            this.channelName = currentChannel.channelname;
            this.channelUsers = currentChannel.channelUsers;
            this.channelCreator = currentChannel.channelCreator;
            this.channelDescription = currentChannel.channelDescription;
            this.channelID = currentChannel.channelID;
          } 
        });
        /* // console.warn(unsubChannel) */
        unsubChannel;
      })
  }

  highlightUserInWorkspace(userFullName: string): void {
    this.highlightUserSubject.next(userFullName);
  }

}

