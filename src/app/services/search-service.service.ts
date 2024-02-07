import { Injectable } from '@angular/core';
import { Channel } from '../models/channel.class';
import { Message } from "../models/message.interface";
import { ChannelService } from "../services/channel.service";

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private channels: Channel[] = []; // Aktuelle Kanaldaten speichern

  constructor(private channelService: ChannelService) { 
    // Kanäle beim Initialisieren des Dienstes laden
    this.loadChannels();
  }

  private async loadChannels(): Promise<void> {
    try {
      // Kanäle aus Firestore abrufen
      const firestoreChannels = await this.channelService.getAllChannels();
      // Mapping der Firestore-Kanäle auf Channel-Objekte
      this.channels = firestoreChannels.map((data: any) => new Channel(data));
    } catch (error) {
      console.error('Fehler beim Laden der Kanäle:', error);
    }
  }

  searchChannels(query: string): Channel[] {
    // Hier kannst du die aktuellen Kanäle durchsuchen
    const matchingChannels: Channel[] = this.channels.filter(channel => channel.channelname.toLowerCase().includes(query.toLowerCase()));
    return matchingChannels;
  }

  searchMessages(query: string): Message[] {
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
