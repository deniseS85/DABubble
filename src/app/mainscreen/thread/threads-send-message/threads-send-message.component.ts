import { Component, inject } from '@angular/core';
import { ChannelService } from '../../../services/channel.service';
import { ChannelDataService } from '../../../services/channel-data.service';
import { ActivatedRoute } from '@angular/router';
import { Firestore, collection, doc, getDoc} from '@angular/fire/firestore';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-threads-send-message',
  templateUrl: './threads-send-message.component.html',
  styleUrl: './threads-send-message.component.scss'
})
export class ThreadsSendMessageComponent {

/*   user: User = new User; */
  channelID: string = "";
  messageID: string = '';

  answer: any;
  answertext: string = '';
  isAnswertextEmojiOpen: boolean = false;
  userID: any ;
 /*  currentUsername: string = '';
  currentUserImg: string = ''; */

  firestore: Firestore = inject(Firestore);



  constructor(
    public channelService: ChannelService,
    public channelDataService: ChannelDataService,
    private route: ActivatedRoute,
    private datePipe: DatePipe
  ){
    this.channelID = this.channelDataService.channelID;
    this.messageID = this.channelService.activeMessageID;
    this.userID = this.route.snapshot.paramMap.get('id');
  /*   this.getUserData() */
  }



  /**
   * get Username and ProfilImg
   */
/*   async getUserData() {
    const data = await getDoc(doc(collection(this.firestore, 'users'), this.userID));
    const currentUser = data.data();
    
    if(currentUser){
      this.currentUsername = currentUser['firstname'] + " " + currentUser['lastname'];
      this.currentUserImg = currentUser['profileImg']
    }
  }  
   */

    
 
  /**
   * Emojimenu open/close
   */
  toggleEmojiAnswer() {
    this.isAnswertextEmojiOpen = !this.isAnswertextEmojiOpen
  }

  addEmojiToMessage(event: any) {
    this.answertext += event.emoji.native;
  }

  /**
   * 
   * @param event selectedEmoji
   */
  addEmojitoText(event: any) {
    const emoji = event.emoji.native;

    this.answertext = this.answertext + emoji;
    this.toggleEmojiAnswer();
  }

  closeEmojiFooter() {
    this.isAnswertextEmojiOpen = false;
  }


  /**
   * collect all metadatas of answer and send/store it through using channelService
   */
  async sendAnswer() {
    try {
      const userDocRef = doc(this.firestore, 'users', this.userID);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
          this.answer = {
            answertext: this.answertext,
            answerUserID: this.userID,
            answerID: '',
            timestamp: this.datePipe.transform(new Date(), 'HH:mm'),
            date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
            react: [],
          }
          this.answertext = '';
          this.channelService.sendAnswer(this.channelID, this.messageID, this.answer);
      }
    } catch(error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }
}
