import { Injectable, inject } from '@angular/core';
import { Channel } from '../models/channel.class';
import { Firestore, Unsubscribe, collectionData, docData, onSnapshot } from '@angular/fire/firestore';
import { ChannelService } from './channel.service';
import { Observable } from "rxjs";
import { collection, query, where, getDocs } from 'firebase/firestore';

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

  newChannelMember: string = '';
  channelID: string = 'DE4cTsdDLnNeJIVHWd8e';

  items$;
  items;

  firestore: Firestore = inject(Firestore);
  unsubChannelUser: Unsubscribe | undefined;

  constructor(
    private channelService: ChannelService,
  ) {
    this.items$ = docData(this.channelService.getSingleChannel(this.channelID));
    this.items = this.items$.subscribe((channel) => {
      let channelInfo = new Channel(channel);
      this.channelName = channelInfo.channelname;
      this.channelUsers = channelInfo.channelUsers;
      this.channelCreator = channelInfo.channelCreator;
      this.channelDescription = channelInfo.description;
      this.channelID = channelInfo.channelID;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.unsubChannelUser;
    this.items.unsubscribe();
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
          this.channelDescription = currentChannel.description;
          this.channelID = currentChannel.channelID;
        }
      });
      console.warn(unsubChannel)
      unsubChannel;
    })
  }
}






