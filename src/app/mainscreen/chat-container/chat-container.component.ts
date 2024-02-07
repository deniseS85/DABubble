import { Component, inject } from '@angular/core';
import { ChannelService } from '../../services/channel.service';
import { Firestore, Unsubscribe, collection, doc, getDoc, onSnapshot, query } from '@angular/fire/firestore';
import { ChannelDataService } from '../../services/channel-data.service';
import { User } from '../../models/user.class';
import { getDownloadURL, ref, uploadBytes, Storage } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChatService } from '../../services/chat.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat-container',
  templateUrl: './chat-container.component.html',
  styleUrl: './chat-container.component.scss'
})
export class ChatContainerComponent {

  allUsers: any[] = [];
  allAnswers: any[] = [];
  allMessages: any[] = [];
  unsubUser: Unsubscribe | undefined;
  messagetext: string = '';

  isShowFileUpload: boolean = false;
  isShowEmojiFooter: boolean = false;
  fileToUpload: any;
  userID: any;
  chatID: any;

  chatPartnerName: string = '';
  chatPartnerImg: string = '';
  isOnline: boolean = false;

  messagesLoaded: boolean = false;

  
  message = {
    messageUserName:'Klemens',
    messageUserProfileImg: 'https://firebasestorage.googleapis.com/v0/b/dabubble-69322.appspot.com/o/images%2F1706965068726_portrait2_edge.png?alt=media&token=c793c2f0-e9ac-43c0-b4a9-0705a51df6e5',
    messagetext: 'hallo',
    messageUserID: '',
    messageid: '',
    timestamp: '12:11',
    date: '2021-11-32',
    isEmojiOpen: false,
    react: [
      {emoji: '',
        user: 'Klemens'}
    ],
    answerInfo: {
            counter: 0,
            lastAnswerTime: ""
          },
    activeUser: true,
    isOnline: true
  }

  firestore: Firestore = inject(Firestore);
  
  constructor(
    private channelService: ChannelService,
    public channelDataService: ChannelDataService,
    private chatService: ChatService,
    private snackBar: MatSnackBar,
    private storage: Storage,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
  ){
    this.userID = this.route.snapshot.paramMap.get('id');
    this.loadChatID();
    this.getUserData();
    // this.loadMessagesOfThisChat()
  }


  loadChatID(){
    const chatPartnerID = this.chatService.userID;
    const allChatsRef = query(collection(this.firestore, "chats"));

    const snap = onSnapshot(allChatsRef,(chats) => {
        chats.forEach(chat =>{
          let array: any[] = [];
          const chatData = chat.data();          
          chatData['chatUsers'].forEach((user: any) =>{
            array.push(user.id)            
          })
          if(array.includes(this.userID) && array.includes(chatPartnerID)){
            this.chatID = chat.data()['chatID']
          }
        })
    })    
  }


  async getUserData() {

    const ud = await getDoc(doc(collection(this.firestore, 'users'), this.chatService.userID));
    const userData = ud.data()!;

    if (userData) {
      this.chatPartnerName = userData['firstname'] + " " + userData['lastname'];
      this.chatPartnerImg = userData['profileImg'];
      this.isOnline = userData['isOnline']
    } else {
      this.chatPartnerName = 'Gast';
      this.chatPartnerImg = 'guest-profile.png';
    }
    
  }

  // async loadMessagesOfThisChat() {
  //   const queryAllAnswers = query((collection(this.firestore, "chats", this.chatID, "messages")));
  //   onSnapshot(queryAllAnswers, (querySnapshot) => {
  //     this.allMessages = [];
  //     console.log(querySnapshot)
  //     // querySnapshot.forEach((message) => {
  //     //   console.log(message.data())
  //     // })



  //     // for (const doc of querySnapshot.docs) {
  //     //   const messageData = doc.data();
  //     //   const userData = await this.loadUserData(messageData['messageUserID']);

  //     //   if (userData) {
  //     //     const message = {
  //     //       ...messageData,
  //     //       ...userData,
  //     //     };
  //     //     this.allMessages.push(message);
  //     //     this.loadAnswers(messageData['messageID'], doc);
  //     //   }
  //     //   this.sortMessagesByTimeStamp();
  //     // }
  //   });
  //   // this.updateMessagesWithUserData();
  // }


  // async loadUserData(messageUserID: string): Promise<any> {
  //   const user = this.allUsers.find(u => u.id === messageUserID);

  //   if (user) {
  //     const userDocRef = doc(this.firestore, 'users', messageUserID);
  //     const unsubscribe = onSnapshot(userDocRef, (doc) => {
  //       if (doc.exists()) {
  //         const updatedUser = doc.data();
  //         Object.assign(user, updatedUser);
  //         this.channelService.userDataSubject.next({ ...user });
  //       }
  //     });

  //     const userData = await Promise.resolve({
  //       firstname: user.firstname,
  //       lastname: user.lastname,
  //       profileImg: user.profileImg,
  //       isOnline: user.isOnline,
  //       unsubscribe: unsubscribe
  //     });

  //     return userData;
  //   } else {
  //     return null;
  //   }
  // }


   /**
   * Retrieves all user information from the database.
   * Subscribes to changes in the user data and updates the local allUsers array accordingly.
   * 
   * @returns {void}
   */
  //  getAllUserInfo(): void {
  //   this.unsubUser = onSnapshot(this.channelService.getUsersRef(), (list) => {
  //     this.allUsers = [];
  //     list.forEach(singleUser => {
  //       let user = new User(singleUser.data());
  //       user.id = singleUser.id;
  //       this.allUsers.push(user);
  //     });
  //   });
  // }


  toggleEmoji(id: string){

  }

  handleReaction($event: any, message: any){

  }

  editAnswer(id: string){

  }


  sendMessage(){

    const message = {
      messagetext: this.messagetext,
      messageUserID: this.userID,
      messageID: '',
      timestamp: this.datePipe.transform(new Date(), 'HH:mm'),
      date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
      react: [],
      answerInfo: {
        counter: 0,
        lastAnswerTime: ""
      },
      fileUpload: '',
    }
    this.messagetext = '';
    this.chatService.sendMessage(message, this.chatID)
    this.closeFileUpload();
  }


  toggleFileUpload() {
    this.isShowFileUpload = !this.isShowFileUpload;
  }

  closeFileUpload() {
    this.isShowFileUpload = false;
  }

  closeEmojiFooter() {
    this.isShowEmojiFooter = false;
  }

  toggleEmojiFooter() {
    this.isShowEmojiFooter = !this.isShowEmojiFooter;
  }

  addEmojiToMessage(event: any) {
    this.messagetext += event.emoji.native;
  }


  async uploadFiles(event: any) {
    let files = event.target.files;
    console.log(files);
  
    if (!files || files.length === 0) {
      return;
    }
  
    let file = files[0];
  
    if (!(await this.isValidFile(file))) {
      return;
    }
  
    let timestamp = new Date().getTime();
    let imgRef = ref(this.storage, `images/${timestamp}_${file.name}`);
  
    uploadBytes(imgRef, file).then(async () => {
        let url = await getDownloadURL(imgRef);
        this.fileToUpload = url;
    });
}

async isValidFile(file: File): Promise<boolean> {
  if (file.size > 500000) {
    this.showSnackbar('Error: Sorry, your file is too large.');
    return false;
  }

  let allowedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'application/pdf'];
  if (!allowedFormats.includes(file.type)) {
    this.showSnackbar('Error: Invalid file format. Please upload a JPEG, PNG, GIF, JPG, PDF.');
    return false;
  }

  return true;
}


showSnackbar(message: string): void {
  this.snackBar.open(message, 'Close', {
    duration: 3000,
  });
}


}
