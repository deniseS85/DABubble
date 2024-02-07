import { Injectable } from '@angular/core';
import { Channel } from '../models/channel.class';
import { User } from '../models/user.class';
import { Chat } from "../models/chat.interface";
import { ChannelService } from "../services/channel.service";
import { UserService } from "../services/user.service";
import { ChatService } from "../services/chat.service";


@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private channels: Channel[] = [];
  private users: User[] = [];
  private chats: Chat[] = [];

  constructor(private channelService: ChannelService, private userService: UserService, private chatService: ChatService) {
    this.loadChannels();
    this.loadUsers();
    // this.loadChats();
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
      this.users = await this.userService.getAllUsers();
    } catch (error) {
      console.error('Fehler beim Laden der Benutzer:', error);
    }
  }

  
  // private async loadChats(): Promise<void> {
  //   try {
  //     // Benutzer aus dem UserService abrufen
  //     this.users = await this.chatService.getAllChats();
  //   } catch (error) {
  //     console.error('Fehler beim Laden der CHats:', error);
  //   }
  // }

  search(query: string): (Channel | User | Chat)[] {
    const matchingChannels: Channel[] = this.channels.filter(channel => channel.channelname.toLowerCase().includes(query.toLowerCase()));
    const matchingUsers: User[] = this.users.filter(user => {
      const fullName = `${user.firstname.toLowerCase()} ${user.lastname.toLowerCase()}`;
      return fullName.includes(query.toLowerCase());
    });
    const searchResults: (Channel | User)[] = [...matchingChannels, ...matchingUsers];
    return searchResults;
  }
}
