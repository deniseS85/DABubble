import { Injectable, inject } from '@angular/core';
import { Channel } from '../models/channel.class';
import { Firestore, Unsubscribe, collectionData, onSnapshot } from '@angular/fire/firestore';
import { ChannelService } from './channel.service';
import { Observable } from "rxjs";
import { collection } from 'firebase/firestore';

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
  channelID: string = '';

  items$;
  items;

  firestore: Firestore = inject(Firestore);
  unsubChannelUser: Unsubscribe | undefined;

  constructor(
    private channelService: ChannelService,
  ) { 
    this.items$ = collectionData(this.channelService.getChannelRef());
    this.items = this.items$.subscribe( (list) => {
      list.forEach(channel => {
        let channelInfo = new Channel(channel);
        this.channelName = channelInfo.channelname;
        this.channelUsers = channelInfo.channelUsers;
        this.channelCreator = channelInfo.channelCreator;
        this.channelDescription = channelInfo.description;
        this.channelID = channelInfo.channelID;
      });
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.unsubChannelUser;
    this.items.unsubscribe();
  }

  changeSelectedChannel(selectedChannelName: string) {
    this.channelName = selectedChannelName;
  }
}
 