import { Component, ElementRef, Renderer2, inject, OnInit, OnDestroy, ViewChild, AfterViewChecked, HostListener, AfterViewInit, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AuthService } from "../../services/auth.service";
import { Firestore, Unsubscribe, collection, doc, getDoc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { ChannelService } from '../../services/channel.service';
import { Channel } from "../../models/channel.class";
import { ActivatedRoute } from '@angular/router';
import { ChannelDataService } from '../../services/channel-data.service';
import { DatePipe } from '@angular/common';
import { deleteDoc, getDocs, query } from 'firebase/firestore';
import { MainscreenComponent } from '../mainscreen.component';
import { ReactionsService } from '../../services/reactions.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { ChatService } from '../../services/chat.service';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';



@Component({
  selector: 'app-channel-chat',
  templateUrl: './channel-chat.component.html',
  styleUrl: './channel-chat.component.scss',

  animations: [
    trigger('slideAndFade', [
      state('hidden', style({
        transform: 'translateX(30px)',
        opacity: 0,
      })),
      state('visible', style({
        transform: 'translateX(-45px)',
        opacity: 1,
      })),
      transition('hidden => visible', animate('200ms 150ms ease-out')),
      transition('visible => hidden', animate('200ms ease-in')),
    ]),
    trigger('slideAndFadeLeft', [
      state('hidden', style({
        transform: 'translateX(-100px)',
        opacity: 0,
      })),
      state('visible', style({
        transform: 'translateX(-40px)',
        opacity: 1,
      })),
      transition('hidden => visible', animate('200ms 150ms ease-out')),
      transition('visible => hidden', animate('200ms ease-in')),
    ]),
    trigger('removeBorder', [
      state('false', style({
        border: '1px solid #ADB0D9',
        borderRadius: '20px',
        padding: '20px',
        gap: '20px',
        marginTop: '20px',
      })),
      state('true', style({
        border: 'none',
        borderRadius: 'initial',
        padding: '10px',
        gap: '20px',
        marginTop: '10px',
      })),
      transition('true <=> false', animate('100ms ease')),
    ]),
    trigger('rollOutInAnimation', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('0.3s ease-in-out',
          style({ height: '*', opacity: 1 }))
      ]
      ),
      transition(':leave', [
        style({ height: '*', opacity: 1 }),
        animate('0.3s ease-in-out',
          style({ height: 0, opacity: 0 }))
      ]
      )
    ]),
  ],
})
export class ChannelChatComponent implements OnInit, OnDestroy, AfterViewChecked, AfterViewInit {
  @Input() userProfileView: User = new User;
  body = this.elRef.nativeElement.ownerDocument.body;
  firestore: Firestore = inject(Firestore);
  addUSerOpen: boolean = false;
  addUserResponsiv: boolean = false;
  showMembersOpen: boolean = false;
  editChannelOpen: boolean = false;
  enabled: boolean = false;
  channelNameChange: boolean = false;
  channelDescriptionChange: boolean = false;
  showProfil: boolean = false;
  userIsOnline: boolean = false;
  officialChannel: boolean = true;
  isChannelCreator: boolean = true;
  isShowEmojiFooter: boolean = false;
  isShowEmojiFooterEdit: boolean = false;
  isDateAllreadyThere: boolean = false;

  user: User = new User;
  channel: Channel = new Channel;

  userID: any;

  allUsers: User[] = [];
  channelInfo: Channel[] = [];
  channelUsers: any[] = [];
  channelName: string = '';
  channelCreator: string = '';
  channelDescription: string = '';
  usersData: any[] = [];
  DateCheck: any[] = [];

  newChannelName: string = '';
  newChannelDescription: string = '';

  messagetext: any = '';
  message: any;
  allMessages: any[] = [];
  editMessages: boolean[] = [];
  editedMessage: string = '';
  userFullName: string = '';

  selectedUsers: User[] = [];
  selectedUser: User = new User();
  searchQuery: string = '';
  isButtonDisabled: boolean = true;
  userList;
  unsubUser: Unsubscribe | undefined;
  private unsubscribeSnapshot: Unsubscribe | undefined;
  @ViewChild('chatContainer') chatContainer!: ElementRef;

   private shouldScrollToBottom: boolean = true;

  isChannelOpen: boolean = false;
  isChatOpen: boolean = true;
  imagePreview: string = '';
  isFirstTimeEmojiOpen: boolean = true;
  isSmallScreen: boolean = false;
  /* isUserMember: boolean | undefined; */

  private subscriptions: Subscription[] = [];

  constructor(
    public main: MainscreenComponent,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private authservice: AuthService,
    private reactionService: ReactionsService,
    public channelService: ChannelService,
    private chatService: ChatService,
    private route: ActivatedRoute,
    public channelDataService: ChannelDataService,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private storage: Storage,
    public dialog: MatDialog,
    public userservice: UserService
  ) {

    this.userID = this.route.snapshot.paramMap.get('id');
    this.userList = this.getUserfromFirebase();
  }


    async ngOnInit() {
      if (this.userID) {
        this.checkIsGuestLogin();
      }
      this.getAllUserInfo();
      if (this.channelDataService.channelID) {
        await this.loadMessagesOfThisChannel();
        await this.loadUsersOfThisChannel();
      }
      this.checkScreenSize();
      /*   this.checkIsUserMember(); */
    }

  
    ngAfterViewChecked() {
      if (this.shouldScrollToBottom) {
        this.scrollToBottom();
      }
    }

    ngAfterViewInit() {
      if (this.chatContainer) {
        this.subscriptions.push(
          this.chatContainer.nativeElement.addEventListener('scroll', this.handleScroll.bind(this))
        );
        this.scrollToBottom();
      }
    } 


  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isSmallScreen = window.innerWidth <= 750
  }
  /* 
    checkIsUserMember() {
      this.userservice.getIsUserMember().subscribe((value) => {
        this.isUserMember = value;
      });
    } */

    private handleScroll() {
      const element = this.chatContainer.nativeElement;
      const atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
  
      this.shouldScrollToBottom = atBottom;
    }
  
    scrollToBottom(): void {
      try {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
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
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
  }
  }

  checkUserIsCreator() {
    let userFullName = this.user.firstname + ' ' + this.user.lastname;
    let userNameWOSpace = this.user.firstname + this.user.lastname;
    if (userFullName == this.channelDataService.channelCreator || userNameWOSpace == this.channelDataService.channelCreator) {
      this.isChannelCreator = true;
    } else {
      this.isChannelCreator = false;
    }
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
 * Toggles the animation state of messages.
 * Sets the animationState property of each message in the allMessages array based on the provided state and index.
 *
 * @param {('visible' | 'hidden')} state - The animation state to set ('visible' or 'hidden').
 * @param {number} index - The index of the message to update.
 * @returns {void}
 */
  toggleAnimationState(state: 'visible' | 'hidden', index: number): void {
    this.allMessages.forEach((message, i) => {
      message.animationState = i === index ? state : 'hidden';
    });
  }

  /**
   * Toggles the animation state of a specific element.
   * Sets the animationState1 property to the provided state.
   *
   * @param {('visible' | 'hidden')} state - The animation state to set ('visible' or 'hidden').
   * @returns {void}
   */
  toggleAnimationState1(state: 'visible' | 'hidden', index: number): void {
    /* this.animationState1 = state; */

    this.allMessages.forEach((message, i) => {
      message.animationState1 = i === index ? state : 'hidden';
    });
  }

  /**
   * Toggles the visibility of emojis in a message.
   * Sets the isEmojiOpen property of the message at the specified chatIndex.
   * 
   * @param {Event} event - The event triggering the toggle.
   * @param {number} chatIndex - The index of the message in the allMessages array.
   * @returns {void}
   */
  toggleEmoji(event: Event, chatIndex: number): void {
    const emojiContainer = event.target as HTMLElement;
    const { top, bottom } = emojiContainer.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = viewportHeight - bottom;

    this.allMessages.forEach((message, index) => {
      if (index === chatIndex) {
        message.isEmojiOpen = !message.isEmojiOpen;
      }
    });

    if (spaceBelow < 600) {
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }, 100);
    }
  }

  toggleEmojiBelowAnswer(event: Event, chatIndex: number): void {
    const emojiContainer = event.target as HTMLElement;
    const { top, bottom } = emojiContainer.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = viewportHeight - bottom;

    this.allMessages.forEach((message, index) => {
      if (index === chatIndex) {
        message.isEmojiBelowAnswerOpen = !message.isEmojiBelowAnswerOpen;
      }
    });

    if (spaceBelow < 600) {
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }, 100);
    }
  }

  toggleEmojiFooter() {
    this.isShowEmojiFooter = !this.isShowEmojiFooter;
  }

  closeEmojiFooter() {
    this.isShowEmojiFooter = false;
  }

  addEmojiToMessage(event: any) {
    this.messagetext += event.emoji.native;
    this.onMessageChange();
  }

  /**
   * Handles the selection of an emoji.
   * Adds or removes the selected emoji to/from the selectedEmojis array of the message at the specified chatIndex.
   * 
   * @param {any} selectedEmoji - The selected emoji object.
   * @param {number} chatIndex - The index of the message in the allMessages array.
   * @returns {void}
   */
  emojiSelected(selectedEmoji: any, chatIndex: number): void {
    if (!this.allMessages[chatIndex].react.selectedEmojis) {
      this.allMessages[chatIndex].react.selectedEmojis = [];
    }

    let userSelectedEmojis = this.allMessages[chatIndex].react.selectedEmojis;
    let emojiIndex = userSelectedEmojis.indexOf(selectedEmoji.emoji.native);

    if (emojiIndex !== -1) {
      userSelectedEmojis.splice(emojiIndex, 1);
    } else {
      userSelectedEmojis.push(selectedEmoji.emoji.native);
    }
  }

  handleReactionMessage(event: any, message: any) {
    const typ = 'messageReaction';
    this.reactionService.handleReaction(this.channelDataService.channelID, message.messageID, '', '', '', event, message, this.userFullName, typ)
  }


  /**
 * Closes the emoji containers for a specific message.
 * Sets the isEmojiOpen property of the message at the specified chatIndex to false.
 * 
 * @param {number} chatIndex - The index of the message in the allMessages array.
 * @returns {void}
 */
  closeEmojiContainers(chatIndex: number): void {
    this.allMessages[chatIndex].isEmojiOpen = false;
    this.allMessages[chatIndex].isEmojiBelowAnswerOpen = false;
  }

  /**
   * Retrieves unique emojis from an array of selected emojis.
   * 
   * @param {string[]} selectedEmojis - The array of selected emojis.
   * @returns {string[]} An array containing only unique emojis.
   */
  getUniqueEmojis(selectedEmojis: string[]): string[] {
    return Array.from(new Set(selectedEmojis));
  }

  /**
   * Retrieves the count of a specific emoji in an array of selected emojis.
   * 
   * @param {string[]} selectedEmojis - The array of selected emojis.
   * @param {string} emoji - The emoji to count.
   * @returns {number} The count of the specified emoji.
   */
  getEmojiCount(selectedEmojis: string[], emoji: string): number {
    return selectedEmojis.filter(e => e === emoji).length;
  }

  /**
   * Retrieves the path of an emoji image.
   * 
   * @param {any} message - The message object containing react data.
   * @param {number} index - The index of the emoji in the selectedEmojis array.
   * @returns {string} The path of the emoji image.
   */
  getEmojis(message: any): string[] {
    if (message.react && message.react.length > 0) {
      return message.react.slice(-2).map((reaction: any) => reaction.emoji).reverse();
    }
    return [];
  }


  /**
 * Opens a direct message channel with a user.
 * Sets the channel name to the full name of the user profile view.
 * Closes various UI components related to channel management.
 * 
 * @returns {void}
 */
  openChannelDirectMessage(chatPartnerID: string): void {
    let userFullName = this.userProfileView.firstname + " " + this.userProfileView.lastname;
    this.chatService.userID = chatPartnerID;
    this.main.chatOpen = true;
    this.main.channelOpen = false;
    this.channelDataService.highlightUserInWorkspace(userFullName);
  }

  /**
   * Opens a popup by setting overflow to hidden on the body element.
   * 
   * @returns {void}
   */
  openPopup(): void {
    this.renderer.setStyle(this.body, 'overflow', 'hidden');
  }


  /**
   * Closes a popup by setting overflow to auto on the body element.
   * Resets search query and selected users.
   * 
   * @returns {void}
   */
  closePopup(): void {
    this.renderer.setStyle(this.body, 'overflow', 'auto');
    this.searchQuery = '';
    this.selectedUsers = [];
  }


  doNotClose(event: MouseEvent): void {
    event.stopPropagation();
  }

  /**
   * get selected User, check if he/she is allready Member and add him/her
   */
  async addNewMemberToChannelUsers(channelID: string) {
    let userAlreadyInChannel = false;
    let newUsersArray: any[] = [];
  
    for (const user of this.selectedUsers) {
      const newUserID = user.id;
      userAlreadyInChannel = await this.checkIfMemberAlreadyIn(await this.channelService.getChannelUsers(channelID), newUserID);
  
      if (userAlreadyInChannel) {
        this.openSnackBar(`${user.firstname} is already a member of this channel`);
      } else {
        newUsersArray.push(newUserID);
      }
    }
  
    this.addUserToChannel(newUsersArray, channelID);
  }


  /**
 * 
 * @param users array of all channelmembers
 * @param newUser potential new Member
 * @returns a boolean if the potential member is allready a member of the channel
 */
  checkIfMemberAlreadyIn(users: any[], newUserID: string): boolean {
    let allreadyThere = false;

    users.forEach((user: any) => {
      if (user == newUserID) {
        allreadyThere = true;
      } else {
        return
      }
    })
    return allreadyThere
  }


  /**
   * push new Member datas to the userArray and update
   * @param newUser new member
   */
  async addUserToChannel(newUserArray: any, channelID: string) {
    const refChannelUsers = await getDoc(this.channelService.getSingelChannelRef(channelID));

    if (refChannelUsers.exists()) {
      let channelUsersUpdated = refChannelUsers.data()['channelUsers'];

      newUserArray.forEach((user: any) => {
        channelUsersUpdated.push(user);
      })

      await this.updateChannelUsers(channelUsersUpdated, channelID);
    }
  }

  leaveChannel(channelID: string) {
    const currentUserIndex = this.channelDataService.channelUsers.indexOf(this.userID);

    if (currentUserIndex !== -1) {
      const newUsers = [...this.channelDataService.channelUsers];
      newUsers.splice(currentUserIndex, 1);
      this.updateChannelUsers(newUsers, channelID);
    }
  }

  updateChannelUsers(newUsers: string[], channelID: string) {
    this.updateChannel(channelID, {
      channelUsers: newUsers
    });

  }


  saveNewDescription(channelID: string) {
    this.updateChannel(channelID, {
      channelDescription: this.newChannelDescription
    });
  }

  saveNewChannelName(channelID: string) {
    this.updateChannel(channelID, {
      channelname: this.newChannelName
    });
  }

  async deleteCurrentChannel() {

    this.deleteChannelMessages();
    await deleteDoc(this.channelService.getSingelChannelRef(this.channelDataService.channelID))
    window.location.reload();


  }

  async deleteChannelMessages() {
    const allMessagesRef = query(collection(this.firestore, 'channels', this.channelDataService.channelID, 'messages'));
    const allMessagesDocs = await getDocs(allMessagesRef);

    allMessagesDocs.forEach(message => {

      this.deleteMessagesAnswers(message.id)
      deleteDoc(message.ref);
      console.log('messages gelöscht', message.ref)
    })
  }


  async deleteMessagesAnswers(messageID: string) {
    const allAnswersRef = query(collection(this.firestore, 'channels', this.channelDataService.channelID, 'messages', messageID, 'answers'));
    const allAnswersDocs = await getDocs(allAnswersRef);

    allAnswersDocs.forEach(answer => {
      deleteDoc(answer.ref)
    })
  }


  async updateChannel(channelID: string, item: {}) {
    await updateDoc(this.channelService.getSingelChannelRef(channelID), item);
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

  getUserID() {
    return doc(collection(this.firestore, 'users'), this.userID);
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
        // Populate local user data with fetched user document
        this.user = new User(userDocSnap.data());
        this.user.id = this.userID;
        this.userFullName = `${this.user.firstname} ${this.user.lastname}`;
        // Set user online status
        this.userIsOnline = await this.authservice.getOnlineStatus(this.userID);
      }
    } catch (error) {
      // Handle errors
    }
  }

  isCurrentUser(chatIndex: number): boolean {
    return this.allMessages[chatIndex].messageUserID === this.userID;
  }

  setUserProfileView(user: User) {
    this.userProfileView = user;
    this.channelService.removeSelectedChannels();
  }



  /**
   * Search input change event handler.
   *
   * @param {any} event - The input change event.
   */
  onSearchInputChange(event: any): void {
    this.searchQuery = event.target.value;
    if (this.searchQuery.trim() !== '') {
      this.filterUsers();
    }
  }

  /**
   * Filter users based on the search query.
   *
   * @returns {User[]} The filtered user array.
   */
  filterUsers(): User[] {
    const trimmedQuery = this.searchQuery.trim().toLowerCase();
    if (!trimmedQuery) {
      return this.allUsers;
    }
    return this.allUsers.filter(
      (user) =>
        user.firstname.toLowerCase().includes(trimmedQuery) ||
        user.lastname.toLowerCase().includes(trimmedQuery)
    );
  }

  /**
   * Select / Remove a user and show the selected user in the input.
   *
   * @param {User} user - The user to be selected.
   */
  selectUser(user: User): void {
    if (!this.selectedUsers.includes(user)) {
      this.selectedUsers.push(new User(user));
      // this.selectedUser = new User(user);
      this.searchQuery = '';
      this.checkInputValidity();
    }
  }

  removeUser(user: User): void {
    this.selectedUsers = this.selectedUsers.filter((u) => u !== user);
    this.checkInputValidity();
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

  checkInputValidity() {
    if (this.selectedUsers.length !== 0) {
      this.enabled = true;
    } else {
      this.enabled = false;
    }
  }

  onMessageChange() {
    this.isButtonDisabled = this.messagetext.trim() === '';

    if (this.isButtonDisabled && this.fileToUpload != '') {
      this.isButtonDisabled = false;
    }
  }

  handleEnterKey() {
    this.onMessageChange();
    if (this.messagetext.trim() !== '') {
      this.addMessage();
    }
  }

  async addMessage() {
    try {
      const userDocRef = doc(this.firestore, 'users', this.userID);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {

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
          answerInfo: {
            counter: 0,
            lastAnswerTime: ''
          },
          fileUpload: this.fileToUpload,
        }
        this.messagetext = '';
        this.isButtonDisabled = true;
        this.deleteFileUpload();
        this.channelService.sendMessage(this.channelDataService.channelID, message);
        setTimeout(() => {
          this.scrollToBottom();
        }, 10);
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }


  async loadMessagesOfThisChannel() {
    this.editMessages = [];
    const channelID = this.channelDataService.channelID;
    const queryAllAnswers = query(await this.channelService.getMessageRef(channelID));
    

    const unsubscribe = onSnapshot(queryAllAnswers, async (querySnapshot) => {     
      
      this.allMessages = [];

      for (const doc of querySnapshot.docs) {
        const messageData = doc.data();
        const userData = await this.loadUserData(messageData['messageUserID']);

        this.isDateAllreadyThere = this.checkDateDuplicate(messageData);
        
        if (userData) {
          const message = {
            ...messageData,
            ...userData,
            isEmojiOpen: false,
            dateAllreadyThere: this.isDateAllreadyThere,
            unsubscribe: unsubscribe
          };

          this.allMessages.push(message);
          await this.loadAnswers(messageData['messageID'], doc);
          
        }
        this.sortMessagesByTimeStamp();
        this.editMessages.push(false)
      }

    });
    // this.updateMessagesWithUserData();
  }


  checkActualDate(messageDate){
    const today = this.datePipe.transform(new Date(), 'yyyy-MM-dd')
    if (today == messageDate){
      return true
    } else {
      return false
    }
    
  }


  /**
   * checks message for duplicated dates
   * @param message 
   * @returns 
   */
  checkDateDuplicate(message){
    if(this.DateCheck.includes(message.date)){
      return true
    } else {
      this.DateCheck.push(message.date)
      return false
    }
  }

  sortMessagesByTimeStamp() {
    this.allMessages.sort((a, b) => {
      const timestampA = new Date(`${a.date} ${a.timestamp}`);
      const timestampB = new Date(`${b.date} ${b.timestamp}`);
      return timestampA.getTime() - timestampB.getTime();
    });
  }

  updateMessagesWithUserData() {
    this.channelService.userData$.subscribe((userData) => {
      this.allMessages.forEach((message) => {
        if (message.messageUserID === userData.id) {
          Object.assign(message, userData);
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
        email: user.email,
        id: user.id,
        unsubscribe: unsubscribe
      });

      return userData;
    } else {
      return null;
    }
  }

  async loadUsersOfThisChannel() {
    let channelDocRef = doc(this.firestore, 'channels', this.channelDataService.channelID);
    // let channelDoc = await getDoc(channelDocRef);
    let userArray: any[] = [];

    this.unsubscribeSnapshot = onSnapshot(channelDocRef, async (channel) => {
      userArray = [];
      const channelUsers = channel.data()['channelUsers']
      
      channelUsers.forEach(user => {
        userArray.push(this.getUserInfo(user))
        
      })
      this.usersData = await Promise.all(userArray);
    })

    // if (channelDoc.exists()) {
    //   let channelData = channelDoc.data();
    //   let usersDataPromises = channelData['channelUsers'].map(async (userID: string) => {
    //     return await this.getUserInfo(userID);
    //   });

    //   this.usersData = await Promise.all(usersDataPromises);
    // }
    // this.updateUserData();
  }

  // updateUserData() {
  //   this.channelService.userData$.subscribe((userData) => {
  //     this.usersData.forEach((user) => {
  //       if (user && user.id && userData && userData.id && user.id === userData.id) {
  //         Object.assign(user, userData);
  //       }
  //     });
  //   });
  // }

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

  /**
   * load all Answers of a Message, count them, take last timestamp and update in Firebase
   * @param messageID 
   * @param message 
   */
  async loadAnswers(messageID: string, message: any) {

    const answerRef = query(this.channelService.getAnswerRef(this.channelDataService.channelID, messageID));
    
    let counter = 0;
    let answersTimes: any[] = [];

    const unsubscribe = onSnapshot(answerRef, (answersDoc) => {
      answersTimes = [];
      counter = 0;      
      answersDoc.forEach((answer) => {
        counter++;
        answersTimes.push(answer.data()['timestamp'])
      });

      //create JSON with counter and lastElement of the Timearray
      const answerInfos = {
        counter: counter,
        lastAnswerTime: answersTimes.pop() || ''
      }

      //if there are no answers, no update
      if (counter >= 0) {
        this.updateAnswerInfoStatus(answerInfos, messageID);
      }
    });
    const result = await Promise.resolve({
      unsubscribe: unsubscribe
  });

  return result;
  }


  async updateAnswerInfoStatus(answerInfos: any, messageID: string) {
    const messageRef = doc(await this.channelService.getMessageRef(this.channelDataService.channelID), messageID);    

    await updateDoc(messageRef, { answerInfo: answerInfos })

    const a = (await getDoc(messageRef)).data();
  }


  askForCounter(){

  }

  /**
   * timeout because, the thread must be closed and opened again to open anotzer thread with other datas
   * @param messageID 
   * @returns 
   */
  openThread(messageID: string) {
    if (this.channelService.activeMessageID === messageID && this.main.threadOpen) {
      return;
    }
    this.main.threadOpen = false;
    this.channelService.activeMessageID = messageID;

    setTimeout(() => {
      this.main.threadOpen = true;
      if (this.main.isMobileScreen) {
        this.main.channelOpen = false;
      }
    }, 0.5);

  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }


  /**
   * Edit Message
   * @param id 
   * @param index 
   */
  async editMessage(id: string, index: number) {
    const messageRef = doc(await this.channelService.getMessageRef(this.channelDataService.channelID), id);
    const docSnap = await getDoc(messageRef);
    this.message = docSnap.data();
    this.editedMessage = this.message.messagetext;
    this.editMessages.splice(index, 1, true);
  }

  async cancelEdit(index: number) {
    this.editMessages.splice(index, 1, false)
  }


  closeEmojiFooterEdit() {
    this.isShowEmojiFooterEdit = false;
  }

  toggleEmojiFooterEdit() {
    this.isShowEmojiFooterEdit = !this.isShowEmojiFooterEdit;
  }

  /**
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
  async saveEditedMessage(id: string, index: number) {
    const docRef = doc(await this.channelService.getMessageRef(this.channelDataService.channelID), id);
    if (this.editedMessage.length <= 1) {
      await deleteDoc(docRef)
    } else {
      await updateDoc(docRef, { messagetext: this.editedMessage })
    }
    this.editMessages.splice(index, 1, false)
  }


  // ----------------------------file upload function-----------------------------------------

  isFiledUploaded: boolean = false;
  fileToUpload: any = '';


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

  toggleShowChannelMembersFooter() {
    this.isShowChannelMembersFooter = !this.isShowChannelMembersFooter;
  }

  closeShowChannelMembersFooter() {
    this.isShowChannelMembersFooter = false;
  }

  addChannelMemberToMessageText(user: { firstname: string; lastname: string; }) {
    this.messagetext += `@${user.firstname}${user.lastname}`;
    this.closeShowChannelMembersFooter();
  }

  // -------------------------------------footer show/search @ members end---------------------------------

  
  scrollToMessage(messageID: string): void {
    const foundMessageElement = document.getElementById(messageID);

    if (foundMessageElement) {
      const parentContainer = foundMessageElement.closest('.new-message-avatar-container, .new-message-somebody-container');
     
      parentContainer?.classList.add('highlighted-message-container');
      
      foundMessageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
          parentContainer?.classList.remove('highlighted-message-container');
      }, 1500);
    }
  }

}