import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
import { MainscreenComponent } from '../mainscreen.component';
import { Firestore, Unsubscribe, collection, deleteDoc, doc, getDoc, onSnapshot, query, updateDoc } from '@angular/fire/firestore';
import { ChannelService } from '../../services/channel.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog} from '@angular/material/dialog';
import { ChannelDataService } from '../../services/channel-data.service';
import { ReactionsService } from '../../services/reactions.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../models/user.class';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent implements AfterViewChecked, AfterViewInit{

  user: User = new User;
  channelID: string = "";
  messageID: string = '';

  activeChannelName: any = '';

  answer: any;
  editAnswers: boolean[] = [];
  editedAnswer: string = '';
  isShowEmojiFooterEdit: boolean = false;
  allAnswers: any[] = [];
  userFullName: string = '';
  userIsOnline: boolean = false;  

  loadedMessage: any = '';
  allUsers: User[] = [];
  userID: any;
  userList;
  unsubUser: Unsubscribe | undefined;
  
  isMobileScreen: boolean = false;
  allChatSectionsOpen: boolean = true;

  firestore: Firestore = inject(Firestore);
  @ViewChild('answerContainer') answerContainer!: ElementRef;
  private shouldScrollToBottom: boolean = true;
  private subscriptions: Subscription[] = [];

  @Input() isThreadOpenState: string = 'closed';

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
    this.getChannelName();
    this.checkMobileScreen();
    this.checkMidSize();
  }


  @HostListener('window:resize', ['$event'])
    onResize(event: Event): void {
        this.checkMobileScreen();
        this.checkMidSize()
  }

  checkMidSize(){
    if(window.innerWidth < 1700 && window.innerWidth > 1450){
      return true
    } else { return false}
  }

  checkMobileScreen() {
    if(window.innerWidth < 750) {
        this.main.threadOpen = true;
        this.main.workspaceOpen = false;
        this.main.channelOpen = false;
    } else {
        this.allChatSectionsOpen = true;
    }
  }

  ngOnInit() {
    if (this.userID) {
      this.checkIsGuestLogin();
    }
    this.getAllUserInfo();
    this.loadAnswers();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
    }
  }

  ngAfterViewInit() {
    if (this.answerContainer) {
      this.subscriptions.push(
        this.answerContainer.nativeElement.addEventListener('scroll', this.handleScroll.bind(this))
      );
      this.scrollToBottom();
    }
  }

  private handleScroll() {
    const element = this.answerContainer.nativeElement;
    const atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;

    this.shouldScrollToBottom = atBottom;
  }

  scrollToBottom(): void {
    try {
      this.answerContainer.nativeElement.scrollTop = this.answerContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: Event): void {
    let element = event.target as HTMLElement;
    let atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
    this.shouldScrollToBottom = atBottom;
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

       const unsubscribe = onSnapshot(queryAllAnswers, async (querySnapshot) => {
      this.allAnswers = [];
      
      for (const doc of querySnapshot.docs) {
        const answerData = doc.data();
        const userData = await this.loadUserData(answerData['answerUserID']);

        if (userData) {
            const answer = {
                ...answerData,
                ...userData,
                isEmojiOpen: false,
                unsubscribe: unsubscribe
            };
            this.allAnswers.push(answer);
        }
        this.sortMessagesByTimeStamp();
      }
      // boolean to open just the answer, that i want to edit
      this.editAnswers.push(false)
      
  });
  // this.updateMessagesWithUserData();
  }


  isCurrentUser(chatIndex: number): boolean {
    return this.allAnswers[chatIndex].answerUserID === this.userID;
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


  async editAnswer(id: string, index: number) {
    const docRef = doc(this.getAllAnswersRef(this.channelID, this.messageID), id)
    const docSnap = await getDoc(docRef);
    this.answer = docSnap.data();
    this.editedAnswer = this.answer.answertext;
    this.editAnswers.splice(index, 1, true)
    this.main.editThread = true;
  }


  async cancelEdit(index: number){
    this.editAnswers.splice(index, 1, false)
    this.main.editThread = false;
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
    this.editAnswers += event.emoji.native;
  }


  /**
   * save new Messagetext or delete if String is empty 
   * @param id 
   * @param index 
   */
  async saveEditedMessage(id: string, index: number){
    const docRef = doc(collection(this.firestore, 'channels', this.channelID, 'messages', this.messageID, "answers"), id );
    if(this.editedAnswer.length <= 1){
      await deleteDoc(docRef)      
    } else{
      await updateDoc(docRef, {answertext: this.editedAnswer})
    }
    this.main.editThread = false;
    this.editAnswers.splice(index, 1, false)
  }


  // Emojis

  toggleEmoji(event: Event, chatIndex: number): void {
    const emojiContainer = event.target as HTMLElement;
    const { top, bottom } = emojiContainer.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = viewportHeight - bottom;
    
    this.allAnswers.forEach((answer, index) => {
      if (index === chatIndex) {
        answer.isEmojiOpen = !answer.isEmojiOpen;
      } 
    });
    if (spaceBelow < 600) {
      setTimeout(() => {
        this.answerContainer.nativeElement.scrollTop = this.answerContainer.nativeElement.scrollHeight;
      }, 100);
    }
  }

  toggleEmojiBelowAnswer(event: Event, chatIndex: number): void {
    const emojiContainer = event.target as HTMLElement;
    const { top, bottom } = emojiContainer.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = viewportHeight - bottom;

    this.allAnswers.forEach((message, index) => {
      if (index === chatIndex) {
        message.isEmojiBelowAnswerOpen = !message.isEmojiBelowAnswerOpen;
      }
    });

    if (spaceBelow < 600) {
      setTimeout(() => {
        this.answerContainer.nativeElement.scrollTop = this.answerContainer.nativeElement.scrollHeight;
      }, 100);
    }
  }


  handleReactionMessage(event: any, answer: any){
    const typ = 'threadReaction';
    this.reactionService.handleReaction(this.channelID, this.messageID, answer.answerID, '', '', event, answer, this.userFullName, typ)
  }


  isPDFFile(url: string | boolean): boolean {
    if (typeof url === 'string') {
        return url.toLowerCase().includes('.pdf');
    }
    return false;
}

}
