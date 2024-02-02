import { Injectable, inject } from '@angular/core';
import { Channel } from '../models/channel.class';
import { Firestore, Unsubscribe, docData, onSnapshot } from '@angular/fire/firestore';
import { ChannelService } from './channel.service';
import { Observable, map } from "rxjs";
import { query, getDocs, collection, doc } from 'firebase/firestore';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelDataService {

  channel = new Channel;
  channelInfo: Channel[] = [];
  channelName: string = '';
  channelCreator: string = '';
  channelDescription: string = '';
  channelUsers: any[] = [];
  channelUsersID: any[] = [];

  newChannelMember: string = '';
  channelID: string = '4w03K0592Ephea3D9fsK';
  firstChannelID: string = '';
  items$;
  items;

  firestore: Firestore = inject(Firestore);
  unsubChannelUser: Unsubscribe | undefined;

  constructor(
    private channelService: ChannelService
  ) {
    this.loadFirstChannel();
    this.items$ = docData(this.channelService.getSingleChannel(this.channelID));
    this.items = this.items$.subscribe((channel) => {
      let channelInfo = new Channel(channel);
      this.channelName = channelInfo.channelname;
      this.channelUsers = channelInfo.channelUsers;
      this.channelCreator = channelInfo.channelCreator;
      this.channelDescription = channelInfo.channelDescription;
      this.channelID = channelInfo.channelID;
     
    });
    
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.unsubChannelUser;
    this.items.unsubscribe();
  }


  async loadFirstChannel() {
  
    let allChannelsQuery = query(this.channelService.getChannelRef());
    let allChannelsSnapshot = await getDocs(allChannelsQuery);

    if (!allChannelsSnapshot.empty) {
      let firstChannelData = allChannelsSnapshot.docs[0].data();
      let firstChannel = new Channel(firstChannelData);
      
      this.firstChannelID = firstChannel.channelID;
      console.log(this.firstChannelID)
    } 
    return this.firstChannelID;
   
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

}

