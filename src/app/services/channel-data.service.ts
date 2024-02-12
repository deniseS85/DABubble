import { Injectable, OnInit, inject } from '@angular/core';
import { Channel } from '../models/channel.class';
import { Firestore, Unsubscribe, collectionData, docData, onSnapshot } from '@angular/fire/firestore';
import { ChannelService } from './channel.service';
import { Observable, Subject, Subscription, map } from "rxjs";
import { query, getDocs, collection, doc, DocumentReference, DocumentData, QuerySnapshot, CollectionReference } from 'firebase/firestore';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelDataService {
  firestore: Firestore = inject(Firestore);
  channel = new Channel;
/*   channelInfo: Channel[] = []; */
  channelName: string = '';
  channelCreator: string = '';
  channelDescription: string = '';
  channelUsers: any[] = [];
  channelID: string = '';
  channelMessages: any[] = [];
  private highlightUserSubject = new Subject<string>();
  highlightUser$ = this.highlightUserSubject.asObservable();
  unsubChannelUser: Unsubscribe | undefined;
  items$: Observable<(DocumentData | (DocumentData & {}))[]> | undefined;
  items: Subscription | undefined;


  constructor(
    private channelService: ChannelService,
  ) {
    this.loadFirstChannelID().then(() => {
      this.subscribeToChannelUpdates();
    });
  }

  

  ngOnDestroy() {
    if (this.unsubChannelUser) {
      this.unsubChannelUser();
    }
  }

  async loadFirstChannelID() {
    let channels = await this.channelService.getAllChannels();
    if (channels.length > 0) {
      this.channelID = channels[0].channelID;
    }
  }

  private subscribeToChannelUpdates() {
    const channelRef = this.channelService.getSingleChannel(this.channelID);

    this.unsubChannelUser = onSnapshot(channelRef, (snapshot) => {
      const channel = snapshot.data();
      let channelInfo = new Channel(channel);
      this.channelName = channelInfo.channelname;
      this.channelUsers = channelInfo.channelUsers;
      this.channelCreator = channelInfo.channelCreator;
      this.channelDescription = channelInfo.channelDescription;
      this.channelID = channelInfo.channelID;
      // this.changeSelectedChannel(channelInfo.channelname, channelInfo.channelCreator, channelInfo.channelDescription);
    });
  }


  async changeSelectedChannel(selectedChannelName: string, selectedChannelCreator: string, selectedChannelDescription: string) {
    this.channelName = selectedChannelName;
    this.channelDescription = selectedChannelDescription;
    this.channelCreator = selectedChannelCreator;
  }


  highlightUserInWorkspace(userFullName: string): void {
    this.highlightUserSubject.next(userFullName);
  }

  async updateChannelInfo(channelID: string) {
    console.log(channelID);
    this.items$ = collectionData(this.channelService.getChannelRef());
    this.items = this.items$.subscribe( (list: any) => {
      list.forEach( (channel: any) => {
        if(channel.channelID == channelID)
        this.channelName = channel.channelname;
        this.channelDescription = channel.channelDescription;
        this.channelCreator = channel.channelCreator;
        this.channelUsers = channel.channelUsers;
      });
    });
    this.items.unsubscribe;
  }

}
