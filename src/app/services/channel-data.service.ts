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
  
  /* 
  items$;
  items; */

  
  unsubChannelUser: Unsubscribe | undefined;

  constructor(
    private channelService: ChannelService
  ) {
    this.loadFirstChannelID();
    
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

 /*  ngOnDestroy() {
    if (this.unsubChannelUser) {
      this.unsubChannelUser();
    }
  } */

  loadFirstChannelID() {
    this.channelService.getAllChannels().then((channels => {
      if (channels.length > 0) {
        this.channelID = channels[0]['channelID'];
        console.log(this.channelID);
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
  }

}

