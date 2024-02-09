import { Component, inject } from '@angular/core';
import { ChannelService } from '../../../services/channel.service';
import { ChannelDataService } from '../../../services/channel-data.service';
import { ActivatedRoute } from '@angular/router';
import { Firestore, Unsubscribe, collection, doc, getDoc, onSnapshot} from '@angular/fire/firestore';
import { DatePipe } from '@angular/common';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../models/user.class';


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
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private storage: Storage
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
    this.onMessageChange();
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

        if (this.fileToUpload) {
          await this.uploadFile(this.fileToUpload);
        }

          this.answer = {
            answertext: this.answertext,
            answerUserID: this.userID,
            answerID: '',
            timestamp: this.datePipe.transform(new Date(), 'HH:mm'),
            date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
            react: [],
            fileUpload: this.fileToUpload,
          }
          this.answertext = '';
          this.isButtonDisabled = true;
          this.deleteFileUpload();
          this.channelService.sendAnswer(this.channelID, this.messageID, this.answer);
      }
    } catch(error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }


// ----------------------------file upload function-----------------------------------------


isFiledUploaded: boolean = false;
fileToUpload: any = '';
isButtonDisabled: boolean = true;
imagePreview: string = '';

onMessageChange() {
  this.isButtonDisabled = this.answertext.trim() === '';

  if (this.isButtonDisabled && this.fileToUpload != '') {
    this.isButtonDisabled = false;
  }
}

openFileUpload() {
  this.isFiledUploaded = true;
}

handleEnterKey() {
  this.onMessageChange();
  if (this.answertext.trim() !== '') {
      this.sendAnswer();
  }
}

deleteFileUpload() {
  this.isFiledUploaded = false;
  this.fileToUpload = '';
  this.onMessageChange();
  this.imagePreview = '';
}


async uploadFiles(event: any) {
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
allUsers: User[] = [];
unsubUser: Unsubscribe | undefined;

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
  this.answertext += `@${user.firstname}${user.lastname}`;
  this.closeShowChannelMembersFooter();
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


  
}
