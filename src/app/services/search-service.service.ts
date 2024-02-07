import { Injectable } from '@angular/core';
import { Channel } from '../models/channel.class';
import { Message } from "../models/message.interface";
import { User } from '../models/user.class';
import { ChannelService } from "../services/channel.service";


@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private channels: Channel[] = [];
  private users: User[] = [];

  constructor(private channelService: ChannelService) {
    this.loadChannels();
    this.loadUsers();
  }

  private async loadChannels(): Promise<void> {
    try {
      const firestoreChannels = await this.channelService.getAllChannels();
      this.channels = firestoreChannels.map((data: any) => new Channel(data));
    } catch (error) {
      console.error('Fehler beim Laden der Kanäle:', error);
    }
  }

  private async loadUsers(): Promise<void> {
    try {
      // Benutzer aus dem UserService abrufen
      this.users = await this.channelService.getAllUsers();
    } catch (error) {
      console.error('Fehler beim Laden der Benutzer:', error);
    }
  }

  search(query: string): (Channel | User)[] {
    const matchingChannels: Channel[] = this.channels.filter(channel => channel.channelname.toLowerCase().includes(query.toLowerCase()));
    const matchingUsers: User[] = this.users.filter(user => 
      user.firstname.toLowerCase().includes(query.toLowerCase()) || 
      user.lastname.toLowerCase().includes(query.toLowerCase())
    );
    const searchResults: (Channel | User)[] = [...matchingChannels, ...matchingUsers];
    return searchResults;
  }

  searchMessages(query: string): Message[] {
    const messages: Message[] = [
      { senderID: '1', senderNamen: 'Sender 1', sendTime: new Date(), messageText: 'Message 1', messageID: '1' },
      { senderID: '2', senderNamen: 'Sender 2', sendTime: new Date(), messageText: 'Message 2', messageID: '2' },
    ];

    const matchingMessages: Message[] = messages.filter(message => message.messageText.includes(query));
    return matchingMessages;
  }
}
