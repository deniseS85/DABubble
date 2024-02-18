import { Component, Input, inject } from '@angular/core';
import { Firestore, Unsubscribe, collection, doc, getDoc, onSnapshot } from '@angular/fire/firestore';
import { ChannelDataService } from '../../../services/channel-data.service';
import { ChannelService } from '../../../services/channel.service';
import { ReactionsService } from '../../../services/reactions.service';

@Component({
  selector: 'app-thread-question',
  templateUrl: './thread-question.component.html',
  styleUrl: './thread-question.component.scss'
})
export class ThreadQuestionComponent {

  @Input() usernameCurrentUser: string = '';
  channelID: string;
  messageID: string;
  loadedMessage: any = '';
  isEmojiOpen: boolean = false;
  username: any = '';
  userImg: any = '';
  isOnline: boolean = false;
  messageFullyLoaded: boolean = false; 
  unsubscribeUserData: Unsubscribe | undefined;

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
    const docRef = this.getAnswerRef(this.channelID, this.messageID);

    const unsubscribe = onSnapshot(docRef, (message) => {      
      this.loadedMessage = message.data();
      this.getUserData(this.loadedMessage.messageUserID);
    });
    this.unsubscribeUserData = unsubscribe;
  }


  async getUserData(id: string) {
    const userDocRef = doc(collection(this.firestore, 'users'), id);
  
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data()!;
        this.username = userData['firstname'] + " " + userData['lastname'];
        this.userImg = userData['profileImg'];
        this.isOnline = userData['isOnline'];
        this.messageFullyLoaded = true;
      }
    });
  
    // Speichern Sie die Abonnement-Funktion für die spätere Aufhebung
    this.unsubscribeUserData = unsubscribe;
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
    this.reactionService.handleReaction(this.channelID, this.messageID, '', '', '', event, message, this.usernameCurrentUser, typ)
    this.toggleEmojiMessage()
  }


  /**
   * toggle the visibility of the emojibar
   */
  toggleEmojiMessage() {
    this.isEmojiOpen = !this.isEmojiOpen;

  }
}
