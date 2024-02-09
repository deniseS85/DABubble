import { Component, Input, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc } from '@angular/fire/firestore';
import { query, onSnapshot } from 'firebase/firestore';
import { ChannelDataService } from '../../../services/channel-data.service';
import { ChannelService } from '../../../services/channel.service';
import { ReactionsService } from '../../../services/reactions.service';
import { EditAnswerComponent } from '../edit-answer/edit-answer.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-thread-answer',
  templateUrl: './thread-answer.component.html',
  styleUrl: './thread-answer.component.scss'
})
export class ThreadAnswerComponent {
  @Input() userNameComplete = ''; 

  firestore: Firestore = inject(Firestore);
  
  channelID: string = "";
  messageID: string = '';
  allAnswers: any[] = [];
  answer: any;
  
  constructor(
    public channelService: ChannelService,
    public channelDataService: ChannelDataService,
    private reactionService: ReactionsService,
    private dialog: MatDialog,
  ){
   
    this.channelID = this.channelDataService.channelID;
    this.messageID = this.channelService.activeMessageID;
    this.loadAnswers();
  }


  async loadAnswers() {
    const queryAllAnswers = await query(this.getAllAnswersRef(this.channelID, this.messageID));

    const unsub = onSnapshot(queryAllAnswers, (querySnapshot) => {
      this.allAnswers = [];
      querySnapshot.forEach((doc: any) => {
        
        if (doc.data().answerUserName === this.userNameComplete) {
          const newData = doc.data();
          const nd = ({ ...newData, activeUserAnswers: true })
          this.allAnswers.push(nd);  
        } else {
          const newData = doc.data();
          const nd = ({ ...newData, activeUserAnswers: false })
          this.allAnswers.push(nd);                
        }        
      })
    })
  }
  
  
  // Emojis

  toggleEmoji(id: string) {
    this.allAnswers.forEach((answer) => {
      if (answer.answerID === id) {
        answer.isEmojiOpen = !answer.isEmojiOpen;
      } else {
        answer.isEmojiOpen = false;
      }
    });
  }


  handleReaction(event: any, answer: any){
    const typ = 'threadReaction';
    this.reactionService.handleReaction(this.channelID, this.messageID, answer.answerID, '', '', event, answer, this.userNameComplete, typ)
  }

  async editAnswer(id: string) {
    const docRef = doc(this.getAllAnswersRef(this.channelID, this.messageID), id)
    const docSnap = await getDoc(docRef);
    this.answer = docSnap.data();
    this.openEditAnswerDialog(id);
  }

  openEditAnswerDialog(id: string) {
    this.dialog.open(EditAnswerComponent, {
      data: {
        channelid: this.channelID,
        messageid: this.messageID,
        answerid: id
      },
      position: {
        top: '50%',
        right: '20px'
      },
    });
  }

  getAllAnswersRef(channelId: string, messageId: string) {
    return collection(this.firestore, "channels", channelId, "messages", messageId, 'answers');
  }


  isPDFFile(url: string | boolean): boolean {
    if (typeof url === 'string') {
        return url.toLowerCase().includes('.pdf');
    }
    return false;
}

}

