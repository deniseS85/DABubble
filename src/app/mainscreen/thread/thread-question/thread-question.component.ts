import { Component, Input, inject } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { ChannelDataService } from '../../../services/channel-data.service';
import { ChannelService } from '../../../services/channel.service';
import { ReactionsService } from '../../../services/reactions.service';

@Component({
  selector: 'app-thread-question',
  templateUrl: './thread-question.component.html',
  styleUrl: './thread-question.component.scss'
})
export class ThreadQuestionComponent {
  
  channelID: string;
  messageID: string;
  loadedMessage: any = '';
  isEmojiOpen: boolean = false;
  name: string = '';

  firestore: Firestore = inject(Firestore);
  
  constructor(
    public channelDataService: ChannelDataService,
    public channelService: ChannelService,
    public reactionService: ReactionsService
  ){
    
    this.channelID = this.channelDataService.channelID;
    this.messageID = this.channelService.activeMessageID;
    this.loadMessage();
  }
 

  async loadMessage() {
    const docRef = await getDoc(this.getAnswerRef(this.channelID, this.messageID));    
    this.loadedMessage = docRef.data();   
  }

  getAnswerRef(channelId: string, messageId: string) {
    return doc(this.firestore, "channels", channelId, "messages", messageId);
  }


  handleReactionMessage(event: any, message: any){
    const typ = 'messageReaction';
    this.reactionService.handleReaction(this.channelID, this.messageID, '', '', '', event, message, this.loadedMessage.messageUserName, typ)
    this.toggleEmojiMessage()
  }


  toggleEmojiMessage() {     
        this.isEmojiOpen = !this.isEmojiOpen;  
    
  }
}
