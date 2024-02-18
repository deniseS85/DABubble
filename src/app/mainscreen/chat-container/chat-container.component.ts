import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { ChannelService } from '../../services/channel.service';
import { Firestore, Unsubscribe, collection, deleteDoc, doc, getDoc, onSnapshot, query } from '@angular/fire/firestore';
import { ChannelDataService } from '../../services/channel-data.service';
import { User } from '../../models/user.class';
import { getDownloadURL, ref, uploadBytes, Storage } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChatService } from '../../services/chat.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { getDocs, updateDoc } from 'firebase/firestore';
import { ReactionsService } from '../../services/reactions.service';
import { MainscreenComponent } from '../mainscreen.component';

@Component({
  selector: 'app-chat-container',
  templateUrl: './chat-container.component.html',
  styleUrl: './chat-container.component.scss'
})
export class ChatContainerComponent {

  allUsers: any[] = [];
  allAnswers: any[] = [];
  allMessages: any[] = [];
  message: any;
  private unsubscribeSnapshot: Unsubscribe | undefined;
  unsubUser: Unsubscribe | undefined;
  messagetext: string = '';
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('answerContainer') answerContainer!: ElementRef;

  isShowFileUpload: boolean = false;
  isShowEmojiFooter: boolean = false;
  isShowEmojiFooterEdit: boolean = false;
  userID: any;
  chatID: string = '';
  userData: any;

  chatPartnerName: string = '';
  chatPartnerImg: string = '';
  isOnline: boolean = false;
  selfChat: boolean = false;
  chatAllreadyStarted: boolean = false;
  editMessages: boolean[] = [];
  editedMessage: string = '';

  messagesLoaded: boolean = false;
  unsubscribeUserData: Unsubscribe | undefined;

  firestore: Firestore = inject(Firestore);

  constructor(
    private channelService: ChannelService,
    public channelDataService: ChannelDataService,
    private chatService: ChatService,
    private snackBar: MatSnackBar,
    private storage: Storage,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private reactionService: ReactionsService,
    public main: MainscreenComponent,
  ) {
    this.userID = this.route.snapshot.paramMap.get('id');
    this.setBooleanForSelfChat();
    this.loadChatID();    
    this.getUserData();
  }


  ngOnDestroy() {
    if (this.unsubscribeSnapshot) {
        this.unsubscribeSnapshot();
    }
}


  setBooleanForSelfChat(){
    const chatPartnerID = this.chatService.userID;
    if(this.userID == chatPartnerID){
      this.selfChat = true
    } 
  }


  async loadChatID() {
    const chatPartnerID = this.chatService.userID;
    const allChatsRef = await getDocs(collection(this.firestore, "chats"));
    let array: any[] = [];
    

    allChatsRef.forEach((chat) => {
      const chatData = chat.data();

      if (chatData['chatUsers'].includes(this.userID)) {
        array.push(chatData)
      } else { return }
    })    
   
    if(this.userID == chatPartnerID){
      array.forEach((chat) => {
      
      if(chat['chatUsers'].length ==1){
        this.chatID = chat['chatID']
        } 
      }    
      
    )} else {
      array.forEach((chat) => {
      
        if(chat['chatUsers'].includes(chatPartnerID)){
          this.chatID = chat['chatID']
          } 
        })
    }

    this.loadMessagesOfThisChat()
  } 


  async getUserData() {
    const userDocRef = doc(this.firestore, 'users', this.chatService.userID);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();

        this.chatPartnerName = `${userData['firstname']} ${userData['lastname']}`;
        this.chatPartnerImg = userData['profileImg'];
        this.isOnline = userData['isOnline'];
        this.channelService.userDataSubject.next({ ...userData });

      }
    });
    this.unsubscribeUserData = unsubscribe;

  }

  async loadMessagesOfThisChat() {

    let userIDofThisMessage;
    const queryAllAnswers = await query(collection(this.firestore, "chats", this.chatID, "messages"));

    this.unsubscribeSnapshot = onSnapshot(queryAllAnswers, (querySnapshot) => {

      this.allMessages = [];
      querySnapshot.forEach(async (message) => {
        // let messageData = ({...message.data(), editMessage: false})
        
        userIDofThisMessage = message.data()['messageUserID'];        
        const userDatas = await getDoc(doc(this.firestore, 'users', userIDofThisMessage));
        
        if (message.data()['messageUserID'] === this.userID) {          
          let updatedMessage = ({
            ...message.data(),
            username: userDatas.data()!['firstname'] + ' ' + userDatas.data()!['lastname'],
            userImg: userDatas.data()!['profileImg'],
            isOnline: userDatas.data()!['isOnline'],
            activeUser: true,
          })
          this.allMessages.push(updatedMessage);

        } else {
          let updatedMessage = ({
            ...message.data(),
            username: userDatas.data()!['firstname'] + ' ' + userDatas.data()!['lastname'],
            userImg: userDatas.data()!['profileImg'],
            isOnline: userDatas.data()!['isOnline'],
            activeUser: false,
          })
          this.allMessages.push(updatedMessage);

        }
        if(this.allMessages.length != 0){
          this.chatAllreadyStarted = true;
        }

        this.sortMessagesByTimeStamp();
      })
      this.editMessages.push(false)
    });
    
  }

  sortMessagesByTimeStamp() {
    this.allMessages.sort((a, b) => {
      const timestampA = new Date(`${a.date} ${a.timestamp}`);
      const timestampB = new Date(`${b.date} ${b.timestamp}`);
      return timestampA.getTime() - timestampB.getTime();
    });
  }

  isCurrentUser(chatIndex: number): boolean {
    return this.allMessages[chatIndex].messageUserID === this.userID;
  }


  toggleEmoji(event: Event, messageindex: number) {
    const emojiContainer = event.target as HTMLElement;
    const { top, bottom } = emojiContainer.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = viewportHeight - bottom;
    
    this.allMessages.forEach((answer, index) => {
      if (index === messageindex) {
        answer.isEmojiOpen = !answer.isEmojiOpen;
      } 
    });
    if (spaceBelow < 600) {
      setTimeout(() => {
        this.answerContainer.nativeElement.scrollTop = this.answerContainer.nativeElement.scrollHeight;
      }, 100);
    }
  }

  toggleEmojiBelowAnswer(event: Event, messageindex: number): void {
    const emojiContainer = event.target as HTMLElement;
    const { top, bottom } = emojiContainer.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = viewportHeight - bottom;

    this.allMessages.forEach((answer, index) => {
      if (index === messageindex) {
        answer.isEmojiBelowAnswerOpen = !answer.isEmojiBelowAnswerOpen;
      }
    });

    if (spaceBelow < 600) {
      setTimeout(() => {
        this.answerContainer.nativeElement.scrollTop = this.answerContainer.nativeElement.scrollHeight;
      }, 100);
    }
  }

  handleReactionMessage(event: any, message: any) {
    const typ = 'chatReaction';
    this.reactionService.handleReaction(this.chatID, message.messageID, '', '', '', event, message, '', typ)
  }

  closeEmojiContainers(index: number): void {
    this.allMessages[index].isEmojiOpen = false;
    this.allMessages[index].isEmojiBelowAnswerOpen = false;
  }

  /**
   * Edit Message
   * @param id 
   * @param index 
   */

  async editMessage(id: string, index: number) {
    const docRef = doc(collection(this.firestore, 'chats', this.chatID, 'messages'), id )
    const docSnap = await getDoc(docRef);
    this.message = docSnap.data();
    this.editedMessage = this.message.messagetext;
    this.editMessages.splice(index, 1, true)
  }

  async cancelEdit(index: number){
    this.editMessages.splice(index, 1, false)
  }


  closeEmojiFooterEdit() {
    this.isShowEmojiFooterEdit = false;
  }

  toggleEmojiFooterEdit() {
    this.isShowEmojiFooterEdit = !this.isShowEmojiFooterEdit;
  }


  /**
   * 
   * @param event 
   */
  addEmojiToEditMessage(event: any) {
    this.editedMessage += event.emoji.native;
  }


  /**
   * save new Messagetext or delete if String is empty 
   * @param id 
   * @param index 
   */
  async saveEditedMessage(id: string,index: number){
    const docRef = doc(collection(this.firestore, 'chats', this.chatID, 'messages'), id );
    if(this.editedMessage.length <= 1){
      await deleteDoc(docRef)      
    } else{
      await updateDoc(docRef, {messagetext: this.editedMessage})
    }
    this.editMessages.splice(index, 1, false)
  }  


  async sendMessage() {
    this.userID = this.route.snapshot.paramMap.get('id');

    if (this.fileToUpload) {
      await this.uploadFile(this.fileToUpload);
    }

    const message = {
      messagetext: this.messagetext,
      messageUserID: this.userID,
      messageID: '',
      timestamp: this.datePipe.transform(new Date(), 'HH:mm'),
      date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
      react: [],
      fileUpload: this.fileToUpload,
      editMessage: false,
    }
    this.messagetext = '';
    this.isButtonDisabled = true;
    this.deleteFileUpload();
    this.chatService.sendMessage(message, this.chatID)
    this.closeFileUpload();
    setTimeout(() => {
      this.scrollToBottom();
    }, 10);
  }


  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) { }
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

  // ----------------------------file upload function-----------------------------------------

  isFiledUploaded: boolean = false;
  fileToUpload: any = '';
  isButtonDisabled: boolean = true;
  imagePreview: string = '';
  
  onMessageChange() {
    this.isButtonDisabled = this.messagetext.trim() === '';

    if (this.isButtonDisabled && this.fileToUpload != '') {
      this.isButtonDisabled = false;
    }
  }

  openFileUpload() {
    this.isFiledUploaded = true;
  }

  deleteFileUpload() {
    this.isFiledUploaded = false;
    this.fileToUpload = '';
    this.onMessageChange();
    this.imagePreview = '';
  }


  async uploadFiles(event: any) {
    console.log("uploadFiles")
    let files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    let file = files[0];

    if (!(await this.isValidFile(file))) {
      return;
    }

    let reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };

    reader.readAsDataURL(file);
    this.isFiledUploaded = true;
    this.fileToUpload = file;
    this.onMessageChange();
  }

  async uploadFile(file: File) {
    let timestamp = new Date().getTime();
    let imgRef = ref(this.storage, `images/${timestamp}_${file.name}`);
  
    await uploadBytes(imgRef, file);
    let url = await getDownloadURL(imgRef);
    this.fileToUpload = url;
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

  
  isPDFFile(url: string | boolean): boolean {
    if (typeof url === 'string') {
        return url.toLowerCase().includes('.pdf');
    }
    return false;
}

  // ------------------------------------file upload function end---------------------------------------

  
  // -------------------------------------footer show/search @ members ---------------------------------

isShowChannelMembersFooter: boolean = false;
usersData: any[] = [];

initShowChannelMembersFooter() {
  this.toogleShowChannelMembersFooter();
  this.loadUsersOfThisChannel();
  this.getAllUserInfo();
}

toogleShowChannelMembersFooter() {
  this.isShowChannelMembersFooter = !this.isShowChannelMembersFooter;
}

closeShowChannelMembersFooter() {
  this.isShowChannelMembersFooter = false;
}

addChannelMemberToMessageText(user: { firstname: string; lastname: string; }) {
  this.messagetext += `@${user.firstname}${user.lastname}`;
  this.closeShowChannelMembersFooter();
}

getAllUserInfo(): void {
  this.unsubUser = onSnapshot(this.channelService.getUsersRef(), (list) => {
    this.allUsers = [];
    list.forEach(singleUser => {
      let user = new User(singleUser.data());
      user.id = singleUser.id;
      this.allUsers.push(user);
    });
  });
}

async loadUsersOfThisChannel() {
  let channelDocRef = doc(this.firestore, 'channels', this.channelDataService.channelID);
  let channelDoc = await getDoc(channelDocRef);

  if (channelDoc.exists()) {
    let channelData = channelDoc.data();
    let usersDataPromises = channelData['channelUsers'].map(async (userID: string) => {
      return await this.getUserInfo(userID);
    });
    this.usersData = await Promise.all(usersDataPromises);
  }
  this.updateUserData();
}

updateUserData() {
  this.channelService.userData$.subscribe((userData) => {
    this.usersData.forEach((user) => {
      if (user && user.id && userData && userData.id && user.id === userData.id) {
        Object.assign(user, userData);
      }
    });
  });
}

async getUserInfo(userID: string): Promise<any> {
  const user = this.allUsers.find(u => u.id === userID);

  if (user) {
    const userDocRef = doc(this.firestore, 'users', userID);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const updateUser = doc.data();
        Object.assign(user, updateUser);
        this.channelService.userDataSubject.next({ ...user });
      }
    });
    const userData = await Promise.resolve({
      firstname: user.firstname,
      lastname: user.lastname,
      profileImg: user.profileImg,
      isOnline: user.isOnline,
      email: user.email,
      id: user.id,
      unsubscribe: unsubscribe
    });
    return userData;
  } else {
    return null;
  }
}

  // -------------------------------------footer show/search @ members end---------------------------------

/**
 * BITTE NICHT LÖSCHEN, NOTFALLFUNKTION!!!
 * Create new DM's when there is an Error
 */

// newDMChat() {

//   const allUsersQuery = query(this.channelService.getUsersRef())

//   let newPair: any[] = [];

//   onSnapshot(allUsersQuery, (querySnapshot) => {

//     // build Array with allUsers
//     querySnapshot.forEach((doc: any) => {

//       this.allUsers.push(doc.data())

//       this.allUsers.forEach((user: any) => {

//         newPair = [];

//         if (user.id == doc.data().id) {
//           newPair.push(user.id)
//         } else {
//           newPair.push(user.id, doc.data().id)
//         }

//         const chatname = user.firstname + ' & ' + doc.data().firstname;
//         const chatUsers = newPair;
//         this.chatService.createNewChat(chatname, chatUsers)

//       })
//     },
//     );
//   });
// }

}

function unsubscribe() {
  throw new Error('Function not implemented.');
}


