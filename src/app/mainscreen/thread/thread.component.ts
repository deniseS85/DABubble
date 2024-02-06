import { Component, inject } from '@angular/core';
import { MainscreenComponent } from '../mainscreen.component';
import { Firestore, Unsubscribe, collection, doc, getDoc, onSnapshot, query } from '@angular/fire/firestore';
import { ChannelService } from '../../services/channel.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog} from '@angular/material/dialog';
import { EditAnswerComponent } from './edit-answer/edit-answer.component';
import { ChannelDataService } from '../../services/channel-data.service';
import { ReactionsService } from '../../services/reactions.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../models/user.class';



@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  user: User = new User;
  channelID: string = "";
  messageID: string = '';

  activeChannelName: any = '';

  answer: any;
 /*  answertext: string = ''; */
 /*  isAnswertextEmojiOpen = false; */
  allAnswers: any[] = [];
  userFullName: string = '';
  userIsOnline: boolean = false;

  loadedMessage: any = '';

  allUsers: User[] = [];
  userID: any;
/*   userImg: string = ''; */
/*   userNameComplete: string = ''; */

  userList;
  unsubUser: Unsubscribe | undefined;

/*   reaction: string = ""; */
  /* allReactions: any[] = []; */

  firestore: Firestore = inject(Firestore);

  constructor(
    private main: MainscreenComponent,
    public channelService: ChannelService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    public channelDataService: ChannelDataService,
    private reactionService: ReactionsService,
    private authservice: AuthService
  ) {
    this.userID = this.route.snapshot.paramMap.get('id');
    this.userList = this.getUserfromFirebase();
    this.channelID = this.channelDataService.channelID;
    this.messageID = this.channelService.activeMessageID;
    
   /*  this.loadCurrentUser(); */
    this.getChannelName();
  }

  ngOnInit() {
    if (this.userID) {
      this.checkIsGuestLogin();
    }
    this.getAllUserInfo();
    this.loadAnswers();
  }

  ngOnDestroy() {
    this.unsubUser;
  }

  /**
  * Retrieves user data from Firebase Firestore.
  * Populates local user data with the fetched user document.
  * Sets user online status.
  * 
  * @returns {Promise<void>} A Promise that resolves when user data retrieval is completed.
  */
  async getUserfromFirebase(): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'users', this.userID);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        this.user = new User(userDocSnap.data());
        this.user.id = this.userID;
        this.userFullName = `${this.user.firstname} ${this.user.lastname}`;
        this.userIsOnline = await this.authservice.getOnlineStatus(this.userID);
      }
    } catch (error) {
    }
  }

  getUserID() {
    return doc(collection(this.firestore, 'users'), this.userID);
  }

  /**
    * Checks if the current user is a guest login.
    * Retrieves user data from Firestore if the user exists, otherwise sets default values for a guest user.
    * 
    * @returns {void}
    */
  checkIsGuestLogin(): void {
    getDoc(this.getUserID()).then((docSnapshot) => {
      if (docSnapshot.exists()) {
        // If user exists, retrieve user data
        this.getUserfromFirebase();
      } else {
        // If user does not exist, set default values for a guest user
        this.userFullName = 'Gast';
        this.user.profileImg = 'guest-profile.png';
      }
    });
  }

   /**
   * Get the profile image path for a user.
   *
   * @param {User} user - The user object.
   * @returns {string} The profile image path.
   */
   getProfileImagePath(user: User): string {
    if (user.profileImg.startsWith('https://firebasestorage.googleapis.com')) {
      return user.profileImg;
    } else {
      return `./assets/img/${user.profileImg}`;
    }
  }


  async getChannelName(){
    const chat = this.channelService.getChannelName(this.channelID);
    const channelData = await getDoc(chat);
    this.activeChannelName = channelData.data()?.['channelname'];
  }


   /**
   * Retrieves all user information from the database.
   * Subscribes to changes in the user data and updates the local allUsers array accordingly.
   * 
   * @returns {void}
   */
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


   /**
 * Closes the emoji containers for a specific message.
 * Sets the isEmojiOpen property of the message at the specified chatIndex to false.
 * 
 * @param {number} chatIndex - The index of the message in the allMessages array.
 * @returns {void}
 */
   closeEmojiContainers(chatIndex: number): void {
    this.allAnswers[chatIndex].isEmojiOpen = false;
    this.allAnswers[chatIndex].isEmojiBelowAnswerOpen = false;
  }


  /**
   * Funktion kürzen aufteilen
   */
  async loadAnswers() {
    const queryAllAnswers = await query(this.getAllAnswersRef(this.channelID, this.messageID));

      onSnapshot(queryAllAnswers, async (querySnapshot) => {
      this.allAnswers = [];
      
      for (const doc of querySnapshot.docs) {
        const answerData = doc.data();
        const userData = await this.loadUserData(answerData['answerUserID']);

        if (userData) {
            const answer = {
                ...answerData,
                ...userData,
                isEmojiOpen: false
            };
            this.allAnswers.push(answer);
        }
        this.sortMessagesByTimeStamp();
      }
  });
  this.updateMessagesWithUserData();

  }

  sortMessagesByTimeStamp() {
    this.allAnswers.sort((a, b) => {
      const timestampA = new Date(`${a.date} ${a.timestamp}`);
      const timestampB = new Date(`${b.date} ${b.timestamp}`);
      return timestampA.getTime() - timestampB.getTime();
    });
  }

  updateMessagesWithUserData() {
    this.channelService.userData$.subscribe((userData) => {
      this.allAnswers.forEach((answer) => {
        if (answer.answerUserID === userData.id) {
          Object.assign(answer, userData);
        }
      });
    });
  }

  async loadUserData(messageUserID: string): Promise<any> {
    const user = this.allUsers.find(u => u.id === messageUserID);

    if (user) {
      const userDocRef = doc(this.firestore, 'users', messageUserID);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const updatedUser = doc.data();
          Object.assign(user, updatedUser);
          this.channelService.userDataSubject.next({ ...user });
        }
      });

      const userData = await Promise.resolve({
        firstname: user.firstname,
        lastname: user.lastname,
        profileImg: user.profileImg,
        isOnline: user.isOnline,
        unsubscribe: unsubscribe
      });

      return userData;
    } else {
      return null;
    }
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

  toggleEmoji(event: Event, chatIndex: number): void {
    this.allAnswers.forEach((answer, index) => {
      if (index === chatIndex) {
        answer.isEmojiOpen = !answer.isEmojiOpen;
      } 
    });
  }


  handleReactionMessage(event: any, answer: any){
    const typ = 'threadReaction';
    this.reactionService.handleReaction(this.channelID, this.messageID, answer.answerID, '', '', event, answer, this.userFullName, typ)
  }





  /**
   * worksapce function to give every UserPair an own chat
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

}
