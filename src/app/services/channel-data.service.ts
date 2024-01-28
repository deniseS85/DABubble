import { Injectable, inject } from '@angular/core';
import { Channel } from '../models/channel.class';
import { Firestore, Unsubscribe, onSnapshot } from '@angular/fire/firestore';
import { ChannelService } from './channel.service';

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
  channelInitialized: boolean = false;

  newChannelMember: string = '';
  channelID: string = '';

  firestore: Firestore = inject(Firestore);
  unsubChannelUser: Unsubscribe | undefined;

  constructor(
    public channelService: ChannelService,
  ) { }

  ngOnInit() {
    this.initializeChannelData();
  }

  ngOnDestroy() {
    this.unsubChannelUser;
  }

  initializeChannelData() {
    this.unsubChannelUser = onSnapshot(this.channelService.getChannelRef(), (list) => {
      this.channelInfo = [];
      list.forEach(channel => {
        let channelInfo = new Channel(channel.data());
        this.channelName = channelInfo.channelname;
        this.channelUsers = channelInfo.channelUsers;
        this.channelCreator = channelInfo.channelCreator;
        this.channelDescription = channelInfo.description;
        this.channelID = channelInfo.channelID;
        console.log(channelInfo.channelname);
      });
    });
    this.channelInitialized = true;
    console.log(this.channelInitialized);
  }
}
 