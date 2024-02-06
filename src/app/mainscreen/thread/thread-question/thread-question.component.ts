import { Component, Input, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc } from '@angular/fire/firestore';
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
  username: any = '';;
  userImg: any = '';
  isOnline: boolean = false;
  messageFullyLoaded: boolean = false;

  firestore: Firestore = inject(Firestore);

  constructor(
    public channelDataService: ChannelDataService,
    public channelService: ChannelService,
    public reactionService: ReactionsService
  ) {

    this.channelID = this.channelDataService.channelID;
    this.messageID = this.channelService.activeMessageID;
    this.loadMessage();
  }


  /**
   * get Message, about which the thread is about
   */
  async loadMessage() {
    const docRef = await getDoc(this.getAnswerRef(this.channelID, this.messageID));
    this.loadedMessage = docRef.data();
    this.getUserData(this.loadedMessage.messageUserID);

  }


  async getUserData(id: string) {

    const ud = await getDoc(doc(collection(this.firestore, 'users'), id));
    const userData = ud.data()!;

    if (userData) {
      this.username = userData['firstname'] + " " + userData['lastname'];
      this.userImg = userData['profileImg'];
      this.isOnline = userData['isOnline']
    } else {
      this.username = 'Gast';
      this.userImg = 'guest-profile.png';
    }
    this.messageFullyLoaded = true;
  }


  /**
   * get the Ref of the message
   */
  getAnswerRef(channelId: string, messageId: string) {
    return doc(this.firestore, "channels", channelId, "messages", messageId);
  }


  /**
   * send Emoji selection to the reactionService
   * @param event 
   * @param message 
   */
  handleReactionMessage(event: any, message: any) {
    const typ = 'messageReaction';
    this.reactionService.handleReaction(this.channelID, this.messageID, '', '', '', event, message, this.loadedMessage.messageUserName, typ)
    this.toggleEmojiMessage()
  }


  /**
   * toggle the visibility of the emojibar
   */
  toggleEmojiMessage() {
    this.isEmojiOpen = !this.isEmojiOpen;

  }
}
