import { Component, inject } from '@angular/core';
import { MainscreenComponent } from '../mainscreen.component';
import { Firestore, arrayRemove, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc } from '@angular/fire/firestore';
import { ChannelService } from '../../services/channel.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog} from '@angular/material/dialog';
import { EditAnswerComponent } from './edit-answer/edit-answer.component';
import { ChannelDataService } from '../../services/channel-data.service';
import { ReactionsService } from '../../services/reactions.service';
import { ActivatedRoute } from '@angular/router';




@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  channelID: string = "";
  messageID: string = '';

  activeChannelName: any = '';

  answer: any;
  answertext: string = '';
  isAnswertextEmojiOpen = false;
  allAnswers: any[] = [];

  loadedMessage: any = '';

  userID: any;
  userImg: string = '';
  userNameComplete: string = '';
  // activeUserAnswer: boolean = true;

  reaction: string = "";
  allReactions: any[] = [];

  firestore: Firestore = inject(Firestore);

  constructor(
    private main: MainscreenComponent,
    public channelService: ChannelService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    public channelDataService: ChannelDataService,
    private reactionService: ReactionsService,
  ) {
    this.userID = this.route.snapshot.paramMap.get('id');
    this.channelID = this.channelDataService.channelID;
    this.messageID = this.channelService.activeMessageID;
    this.loadAnswers();
    this.loadCurrentUser();
    this.getChannelName();
  }


  async getChannelName(){
    const chat = this.channelService.getChannelName(this.channelID);
    const channelData = await getDoc(chat);
    this.activeChannelName = channelData.data()?.['channelname'];
  }


  async loadCurrentUser() {
    const data = await getDoc(doc(collection(this.firestore, 'users'), this.userID));
    const currentUser = data.data();
    
    if(currentUser){
      this.userNameComplete = currentUser['firstname'] + " " + currentUser['lastname'];
      this.userImg = currentUser['profileImg']
    }
  }


  /**
   * Funktion kürzen aufteilen
   */
  async loadAnswers() {
    const queryAllAnswers = await query(this.getAllAnswersRef(this.channelID, this.messageID));

    const unsub = onSnapshot(queryAllAnswers, (querySnapshot) => {
      this.allAnswers = [];
      querySnapshot.forEach((doc: any) => {
        this.allReactions = [];
        
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


  /**
   * 
   * @param channelId  wird beim erstellen der Componente mit übergeben
   */

  getChannelRef() {
    return (this.firestore, "channels")
  }


  getMessageRef(channelId: string) {
    return collection(this.firestore, "channels", channelId, "messages");
  }


  getAllAnswersRef(channelId: string, messageId: string) {
    return collection(this.firestore, "channels", channelId, "messages", messageId, 'answers');
  }


  closeThread() {
    this.main.threadOpen = false;
    
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





  /**
   * worksapce function
   */



  // newDMChat(){

  //   const allUsersQuery = query(this.channelService.getUsersRef())

  //   let newPair: any[] = [];

  //   console.log(allUsersQuery)
  //   onSnapshot(allUsersQuery, (querySnapshot) => {          
          
  //         // build Array with allUsers
  //         querySnapshot.forEach((doc: any) => {
            
  //           if(this.allUsers.length > 0){
              
  //             this.allUsers.forEach((user: any) => {

  //               newPair = [];
  //               newPair.push(user, doc.data())
  //               const chatname = user.firstname + ' & ' + doc.data().firstname;
  //               const chatUsers = newPair;
  //               this.chatService.createNewChat(chatname, chatUsers)
                
  //             })
  //           }
  //            this.allUsers.push(doc.data())           

  //         },
  //         );          
  //       });
  // }

  // async loadChannels() {
  //   const queryAllChannels = query(this.channelService.collectionRef);    

  //   onSnapshot(queryAllChannels, (querySnapshot) => {
  //     this.channels = [];
  //     querySnapshot.forEach((doc: any) => {
  //       doc.data().channelUsers.forEach((user:any) => {
  //         if(user.id === this.userID){
  //           this.channels.push(doc.data());
  //         } else { return }
  //       })        
  //     });
  //   });
  // }


}
