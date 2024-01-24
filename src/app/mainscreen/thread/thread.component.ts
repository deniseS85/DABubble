import { Component, inject } from '@angular/core';
import { MainscreenComponent } from '../mainscreen.component';
import { Firestore, collection, doc, getDoc, getDocs, onSnapshot, query, setDoc } from '@angular/fire/firestore';
import { ChannelService } from '../../services/channel.service';
import { AuthService } from '../../auth.service';
import { DatePipe } from '@angular/common';




@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {    

  /**
   * müssen dann beim Öffnen vom Chat mit übergeben werden
   * hier nehme ich die angelegten Beispielchannel und die Message
   */
  channelID: string = "T1xuWGwkbJf7zzPx2R9X";
  messageID: string = 'eAvmGIZse6lghoOs3U8A';

  /**
   * hier alle Variablen, die aus der Antwort gezogen werden(User, Zeit, Message)
   * Name normalerweise currentUser
   */

  answer: any;
  answertext: string = '';
  answerUserName: string = 'Frederick Beck';
  allAnswers: any[] = [];  
  
  loadedMessage: any  = '';

  userFirstName: string = '';
  userLastName: string = '';
  userImg: string = '';

  firestore: Firestore = inject(Firestore);  

  constructor(
    private main: MainscreenComponent, 
    private channelService: ChannelService, 
    private authService: AuthService,
    private datePipe: DatePipe) {
    this.loadMessage();
    this.loadAnswers();
    this.loadCurrentUser();
  }
  

  async loadCurrentUser(){    
    this.authService.restoreUserData();

      if (this.authService.isUserAnonymous()) {
        this.userFirstName = 'Gast';
        this.userLastName = '';
        this.userImg = 'guest-profile.png';
      }
      this.userFirstName = this.authService.getUserFirstName();
      this.userLastName = this.authService.getUserLastName();
      this.userImg = this.authService.getUserImg();
  }


  async loadMessage() {
    const docRef = await getDoc(this.getAnswerRef(this.channelID, this.messageID));

    this.loadedMessage = docRef.data();   
  }


  async loadAnswers(){
    const queryAllAnswers = await query(this.getAllAnswersRef(this.channelID, this.messageID));

    const unsub = onSnapshot(queryAllAnswers, (querySnapshot) => {
      this.allAnswers = [];
      querySnapshot.forEach((doc: any) => {
        this.allAnswers.push(doc.data())
      })
      
    })
  }


  sendAnswer() {       
    this.answer = {
      answertext: this.answertext,
      answerUserName: this.userFirstName + this.userLastName,
      userProfileImg: this.userImg,
      timestamp: this.datePipe.transform(new Date(), 'HH:mm'),
      date: this.datePipe.transform(new Date(), 'yyyy-MM-dd') // zum Vergkleiche für anzeige "Heute" oder z.B. "21.Januar"
    }

    this.answertext = '';
    this.channelService.sendAnswer(this.channelID, this.messageID, this.answer)
  }


  /**
   * 
   * @param channelId  wird beim erstellen der Componente mit übergeben
   */
  getChannelName(channelId: string){
    //hier dann channel des Threads auslesen
  }

  getChannelRef(){
    return(this.firestore, "channels")
  }

  getMessageRef(channelId: string) {
    return collection(this.firestore, "channels", channelId, "messages");
  }

  getAnswerRef(channelId: string, messageId: string){
    return doc(this.firestore, "channels", channelId, "messages", messageId);
  }

  getAllAnswersRef(channelId: string, messageId: string){
    return collection(this.firestore, "channels", channelId, "messages", messageId, 'answers');
  }

  closeThread() {
    this.main.threadOpen = false;
  }













  /**
   *  Variablen für BeispielChannel
   */

  // channelname: string = 'Entwicklerteam';
  // channelDescription: string = 'Entwicklerteam Chat zum Austauschen von Zeug';
  // channelUsersId: any[]  = [];
  // channelUsers: any[] = [];
  // channelCreator: string = 'Lord Voldemort';

  /**
   * Variablen zum Erstellen einer Message im Channel (simuliert hier Message im Channel auf die geantwortet wird)
   */

  // channelID: string = "T1xuWGwkbJf7zzPx2R9X";
  // senderID: string = 'W23nHK0hmT5yVTETSPL2';
  // senderNamen: string = 'Klemens Naue';
  // // sendTime: Date = ;
  // messageText: string = 'Hey, kannst du mir bitte auf diese Nachricht eine Antwort oder Reaktion senden?';


  // /**
  //  * to create a testchannel make a (click)-function on send-icon
  //  */
  // async createChannel(){

  //   const users = query(collection(this.firestore, "users"));

  //   const querySnap = await getDocs(users);
  //   querySnap.forEach((user: any) => {
  //     this.channelUsersId.push(user.data().id)      //erstelle Array mit Id's der Channelteilnehmer
  //     this.channelUsers.push({                      //erstelle Array mit Namen und ProfilImg von Channelteilnehmern
  //       firstname: user.data().firstname,
  //       lastname: user.data().lastname,
  //       profilImg: user.data().profileImg,
  //     })
  //   });

  //   this.channelService.createChannel(this.channelname, this.channelDescription, this.channelUsersId, this.channelUsers, this.channelCreator)   
  // }


  // createMessage(){

  //   const messageRef = doc(this.getMessageRef(this.channelID));

  //   setDoc(messageRef, {
  //     senderID: this.senderID,
  //     senderNamen: this.senderNamen,
  //     messageText: this.messageText,
  //     messageID: messageRef.id,
  //   });

  // }
}
