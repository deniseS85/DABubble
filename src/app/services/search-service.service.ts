import { Injectable } from '@angular/core';
import { Channel } from '../models/channel.class';
import { Message } from "../models/message.interface";


@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor() { }

  searchChannels(query: string): Channel[] {
    // Hier führst du die Suchlogik für Kanäle durch
    // Dummy-Daten für die Suche
    const channels: Channel[] = [
      new Channel({ channelID: '1', channelDescription: 'Channel 1 Description', channelname: 'Channel 1', channelUsers: [], channelCreator: '', users: [] }),
      new Channel({ channelID: '2', channelDescription: 'Channel 2 Description', channelname: 'Channel 2', channelUsers: [], channelCreator: '', users: [] }),
      new Channel({ channelID: '3', channelDescription: 'El Nuevo Canalo Description', channelname: 'El Nuevo Canalo', channelUsers: [], channelCreator: '', users: [] })
    ];

    // Hier kannst du die Dummy-Daten durchsuchen und passende Kanäle zurückgeben
    const matchingChannels: Channel[] = channels.filter(channel => channel.channelname.includes(query));

    return matchingChannels;
  }

  searchMessages(query: string): Message[] {
    // Hier führst du die Suchlogik für Nachrichten durch
    // Dummy-Daten für die Suche
    const messages: Message[] = [
      { senderID: '1', senderNamen: 'Sender 1', sendTime: new Date(), messageText: 'Message 1', messageID: '1' },
      { senderID: '2', senderNamen: 'Sender 2', sendTime: new Date(), messageText: 'Message 2', messageID: '2' },
      
    ];

    // Hier kannst du die Dummy-Daten durchsuchen und passende Nachrichten zurückgeben
    const matchingMessages: Message[] = messages.filter(message => message.messageText.includes(query));

    return matchingMessages;
  }
}
