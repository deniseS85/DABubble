import { Injectable, inject } from '@angular/core';
import { Channel } from '../models/channel.class';
import { Firestore, Unsubscribe, collectionData, docData, onSnapshot } from '@angular/fire/firestore';
import { ChannelService } from './channel.service';
import { Observable, map } from "rxjs";
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

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
  channelID: string = '';
  

  items$!: Observable<Channel>; 
  items: any;

  firestore: Firestore = inject(Firestore);
  unsubChannelUser: Unsubscribe | undefined;

  constructor(
    private channelService: ChannelService,
  ) {
    this.loadFirstChannel();
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.unsubChannelUser;
    this.items.unsubscribe();
  }

  private loadChannelData() {
    if (this.channelID) {
      this.items$ = docData(this.channelService.getSingleChannel(this.channelID)).pipe(
        map((data: any) => new Channel(data))) as Observable<Channel>;
  
      this.items = this.items$.subscribe((channel: Channel) => {
        this.channelName = channel.channelname;
        this.channelUsers = channel.channelUsers;
        this.channelCreator = channel.channelCreator;
        this.channelDescription = channel.description;
        this.channelID = channel.channelID;
        this.channelUsersID = channel.channelUsersID;
      });
    } else {
      console.error('Ungültige channelID');
    }
  }

  async loadFirstChannel() {
    let allChannelsQuery = query(this.channelService.getChannelRef());
    let allChannelsSnapshot = await getDocs(allChannelsQuery);

    if (!allChannelsSnapshot.empty) {
        let firstChannelData = allChannelsSnapshot.docs[0].data();
        let firstChannel = new Channel(firstChannelData);
        this.channelID = firstChannel.channelID;
        this.loadChannelData();
    } 
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
      /* // console.warn(unsubChannel) */
      unsubChannel;
    })
  }
}






