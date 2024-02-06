import { Injectable, inject } from '@angular/core';
import { Channel } from '../models/channel.class';
import { Firestore, Unsubscribe, docData, onSnapshot } from '@angular/fire/firestore';
import { ChannelService } from './channel.service';
import { Observable, Subject, map } from "rxjs";
import { query, getDocs, collection, doc, DocumentReference, DocumentData, QuerySnapshot, CollectionReference } from 'firebase/firestore';
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
  

/*   items$;
  items; 
   */
  unsubChannelUser: Unsubscribe | undefined;
  unsubChannelMessages: Unsubscribe | undefined;

  constructor(
    private channelService: ChannelService
  ) {
    this.loadFirstChannelID().then(() => {
      this.subscribeToChannelUpdates();
  });
  }

  ngOnDestroy() {
    if (this.unsubChannelUser) {
      this.unsubChannelUser();
    }
    if (this.unsubChannelMessages) {
      this.unsubChannelMessages();
    }
  }


  async loadFirstChannelID() {
      let channels = await this.channelService.getAllChannels();
      if (channels.length > 0) {
          this.channelID = channels[0].channelID;
      }
  }

  private subscribeToChannelUpdates() {
    console.log('Vor onSnapshot');
    const channelRef = this.channelService.getChannelRef();
   
  
    if (channelRef instanceof CollectionReference) {
      // Hier können Sie auf Kanalebene abonnieren
      this.unsubChannelUser = onSnapshot(channelRef, (snapshot) => {
        console.log('onSnapshot callback for channels');
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'modified') {
            const modifiedChannel = new Channel(change.doc.data());
            
            console.log('Modified Channel:', modifiedChannel);
            if (modifiedChannel.channelname === this.channelName) {
              this.channelName = modifiedChannel.channelname;
              this.channelUsers = modifiedChannel.channelUsers;
              this.channelCreator = modifiedChannel.channelCreator;
              this.channelDescription = modifiedChannel.channelDescription;
              this.channelID = modifiedChannel.channelID;
            }
          }
        });
      });
    }
  }
  
  


  async changeSelectedChannel(selectedChannelName: string) {
    this.channelName = selectedChannelName;
  }

  /* async changeSelectedChannel(selectedChannelName: string) {
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
        unsubChannel;
      })
  } */
  

  highlightUserInWorkspace(userFullName: string): void {
    this.highlightUserSubject.next(userFullName);
  }

}

/* ################ ursprungs code ########################## 

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
  channelMessages: any[] = [];
  private highlightUserSubject = new Subject<string>();
  highlightUser$ = this.highlightUserSubject.asObservable();

 /*  newChannelMember: string = ''; */
  

/*   items$;
  items; 
   */
 /*  unsubChannelUser: Unsubscribe | undefined;

  constructor(
    private channelService: ChannelService
  ) {
    this.loadFirstChannelID();
 */
   /*  this.items$ = docData(this.channelService.getSingleChannel(this.channelID));
    this.items = this.items$.subscribe((channel) => {
      let channelInfo = new Channel(channel);
      this.channelName = channelInfo.channelname;
      this.channelUsers = channelInfo.channelUsers;
      this.channelCreator = channelInfo.channelCreator;
      this.channelDescription = channelInfo.channelDescription;
      this.channelID = channelInfo.channelID;
      this.changeSelectedChannel(channelInfo.channelname);
    }); */
    
 /*  } */

 /*  ngOnDestroy() {
    if (this.unsubChannelUser) {
      this.unsubChannelUser();
    }
  } */

  /* loadFirstChannelID() {
    this.channelService.getAllChannels().then((channels => {
      if (channels.length > 0) {
        this.channelID = channels[0]['channelID'];
      }
    }));
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
        unsubChannel;
      })
  }
  

  highlightUserInWorkspace(userFullName: string): void {
    this.highlightUserSubject.next(userFullName);
  } */

/* } */