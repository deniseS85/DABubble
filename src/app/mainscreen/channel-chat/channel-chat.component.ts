import { Component, ElementRef, Renderer2, inject, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AuthService } from "../../services/auth.service";
import { Firestore, Unsubscribe, collection, doc, getDoc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { ChannelService } from '../../services/channel.service';
import { Channel } from "../../models/channel.class";
import { ActivatedRoute } from '@angular/router';
import { ChannelDataService } from '../../services/channel-data.service';
import { DatePipe } from '@angular/common';
import { getCountFromServer, getDocs, query } from 'firebase/firestore';
import { MainscreenComponent } from '../mainscreen.component';
import { ReactionsService } from '../../services/reactions.service';


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
      transition('hidden => visible', animate('100ms ease-out')),
      transition('visible => hidden', animate('100ms ease-in')),
    ]),

    trigger('slideAndFadeLeft', [
      state('hidden', style({
        transform: 'translateX(-30px)',
        opacity: 0,
      })),
      state('visible', style({
        transform: 'translateX(45px)',
        opacity: 1,
      })),
      transition('hidden => visible', animate('100ms ease-out')),
      transition('visible => hidden', animate('100ms ease-in')),
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
export class ChannelChatComponent implements OnInit, OnDestroy {
  body = this.elRef.nativeElement.ownerDocument.body;
  firestore: Firestore = inject(Firestore);

  animationState = 'hidden';
  animationState1 = 'hidden';

  addUSerOpen: boolean = false;
  showMembersOpen: boolean = false;
  editChannelOpen: boolean = false;
  enabled: boolean = false;
  channelNameChange: boolean = false;
  channelDescriptionChange: boolean = false;
  showProfil: boolean = false;
  userIsOnline: boolean = false;
  officialChannel: boolean = true;
  isChannelCreator: boolean = true;

  user: User = new User;
  channel: Channel = new Channel;
  userProfileView: User = new User();

  userID: any;

  allUsers: User[] = [];
  channelInfo: Channel[] = [];
  channelUsers: any[] = [];
  channelName: string = '';
  channelCreator: string = '';
  channelDescription: string = '';

  newChannelName: string = '';
  newChannelDescription: string = '';

  messagetext: string = '';
  allMessages: any[] = [];
  userFullName: string = '';

  selectedUsers: User[] = [];
  selectedUser: User = new User();
  searchQuery: string = '';
  isButtonDisabled: boolean = true;
  userList;

  private unsubscribeSnapshot: Unsubscribe | undefined;
  unsubUser: Unsubscribe | undefined;

  constructor(
    private main: MainscreenComponent,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private authservice: AuthService,
    private reactionService: ReactionsService,
    public channelService: ChannelService,
    private route: ActivatedRoute,
    public channelDataService: ChannelDataService,
    private datePipe: DatePipe,
  ) {

    this.userID = this.route.snapshot.paramMap.get('id');
    this.userList = this.getUserfromFirebase();
  }

  ngOnInit() {
    if (this.userID) {
      this.checkIsGuestLogin();
    }
    this.getAllUserInfo();
    this.loadMessagesOfThisChannel();
 
  }

  ngOnDestroy() {
    this.unsubUser;
    this.unsubscribeSnapshot;
  }

  checkUserIsCreator() {
    let userFullName = this.user.firstname + this.user.lastname;
        if(userFullName == this.channelDataService.channelCreator) {
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
    toggleAnimationState1(state: 'visible' | 'hidden'): void {
      this.animationState1 = state;
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
      this.allMessages.forEach((message, index) => {
        if (index === chatIndex) {
          message.isEmojiOpen = !message.isEmojiOpen;
          console.log(message.isEmojiOpen)
        }
      });
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

    handleReactionMessage(event: any, message: any){
      const typ = 'messageReaction';
      console.error(this.userFullName)
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
  getEmojiPath(message: any, index: number): string {
    
    // const selectedEmojis = message.react[index].emoji;
    // if (selectedEmojis && selectedEmojis.length > index) {
    //   console.warn(selectedEmojis)
    //   return selectedEmojis[selectedEmojis.length - 1 - index];
    // }
    return '';
  }


    /**
   * Opens a direct message channel with a user.
   * Sets the channel name to the full name of the user profile view.
   * Closes various UI components related to channel management.
   * 
   * @returns {void}
   */
    openChannelDirectMessage(): void {
      let userFullName = this.userProfileView.firstname + " " + this.userProfileView.lastname;
      this.addUSerOpen = false;
      this.showMembersOpen = false;
      this.showProfil = false;
      this.officialChannel = false;
      this.channelDataService.channelName = userFullName;
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
  async addNewMemberToChannelUsers() {
    let userallreadyInChannel = false;
    let newUsersArray: any = [];
    this.selectedUsers.forEach((user) => {
      const newUser = user.toJson(user);
      userallreadyInChannel = this.checkIfMemberAllreadyIn(this.channelDataService.channelUsers, newUser);

      if (userallreadyInChannel) {
        console.warn(this.selectedUser.firstname, ' is allready Memeber of this channel')
      } else {
        newUsersArray.push(newUser)
      }
      this.addUserToChannel(newUsersArray)
    })
  }

  /**
   * 
   * @param users array of all channelmembers
   * @param newUser potential new Member
   * @returns a boolean if the potential member is allready a member of the channel
   */
  checkIfMemberAllreadyIn(users: any, newUser: any) {
    let allreadyThere = false;

    users.forEach((user: any) => {
      if (user.firstname == newUser.firstname) {
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
  async addUserToChannel(newUserArray: any) {
    const refChannelUsers = await getDoc(this.getSingelChannelRef(this.channelDataService.channelID))

    if (refChannelUsers.exists()) {
      let channelUsersUpdated = refChannelUsers.data()['channelUsers'];

      newUserArray.forEach((user: any) => {
        channelUsersUpdated.push(user);
      })

      await this.updateChannelUsers(channelUsersUpdated)
    }
  }


  leaveChannel() {

    const newusers: any = this.channelDataService.channelUsers;
    newusers.forEach((user: any) => {
      if (user.id == this.userID) {
        const index = newusers.indexOf(user);
        newusers.splice(index, 1)
      } else {
        return
      }
    })

    this.updateChannelUsers(newusers);
  }


  updateChannelUsersIDS(newIDs: string) {
    this.updateChannel(this.channelDataService.channelID, {
      channelUsersID: newIDs
    });
  }

  updateChannelUsers(newUsers: any) {
    this.updateChannel(this.channelDataService.channelID, {
      channelUsers: newUsers
    });
  }

  saveNewDescription() {
    this.updateChannel(this.channelDataService.channelID, {
      channelDescription: this.newChannelDescription
    });
  }

  saveNewChannelName() {
    this.updateChannel(this.channelDataService.channelID, {
      channelname: this.newChannelName
    });
  }

  deleteCurrentChannel() {
  }

  async updateChannel(channelID: string, item: {}) {
    await updateDoc(this.getSingelChannelRef(this.channelDataService.channelID), item);
  }

  getSingelChannelRef(docId: string) {
    return doc(collection(this.firestore, 'channels'), docId);
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
  }

  // User filter function



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


  /**
   * collect datas of currentUSer(writer of the message), messagetext, timestamp and reactions etc.
   */
  addMessage() {

    const message = {
      messagetext: this.messagetext,
      messageUserName: this.userFullName, 
      messageUserID: this.userID,
      messageUserProfileImg: this.getProfileImagePath(this.userProfileView),
      messageID: '',
      activeUserMessage: false,
      isEmojiOpen: false,
      timestamp: this.datePipe.transform(new Date(), 'HH:mm'),
      date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),// zum Vergkleiche für anzeige "Heute" oder z.B. "21.Januar"
      react: [],
      answerInfo: {
        counter: 0,
        lastAnswerTime: ""
      },
    }

    this.messagetext = '';
    this.channelService.sendMessage(this.channelDataService.channelID, message);
  }



  /**
   * load all messages of an channelChat an add boolean, if currentUser is Sender of Message
   */
  async loadMessagesOfThisChannel() {
    const queryAllAnswers = await query(this.channelService.getMessageRef(this.channelDataService.channelID));
    const unsub = onSnapshot(queryAllAnswers, (querySnapshot) => {
      this.allMessages = [];
      const currentUsername = this.authservice.getUserFirstName() + ' ' + this.authservice.getUserLastName()
      querySnapshot.forEach((doc: any) => {

        if (doc.data().messageUserName === currentUsername) {
          const newData = doc.data();
          const nd = ({ ...newData, activeUserMessage: true })
          this.allMessages.push(nd);;

        } else {
          const newData = doc.data();
          const nd = ({ ...newData, activeUserMessage: false })
          this.allMessages.push(nd);
        }
        //for every Message load Answers
        this.loadAnswers(doc.data().messageID, doc);
      })
    })
  }


  /**
   * load all Answers of a Message, count them, take last timestamp and update in Firebase
   * @param messageID 
   * @param message 
   */
  async loadAnswers(messageID: string, message: any) {

    const answerRef = this.channelService.getAnswerRef(this.channelDataService.channelID, messageID);
    let counter = 0;
    let answersTimes: any[] = [];

    //for each Answer count 1+ and push time in timearray
    const snap = await getDocs(answerRef);
    snap.forEach((doc: any) => {
      counter++;
      answersTimes.push(doc.data().timestamp)
    });

    //create JSON with counter and lastElement of the Timearray
    const answerInfos = {
      counter: counter,
      lastAnswerTime: answersTimes.pop()
    }

    //if there are no answers, no update
    if (counter > 0) {
      this.updateAnswerInfoStatus(answerInfos, messageID);
    }
  }



  async updateAnswerInfoStatus(answerInfos: any, messageID: string) {
    const messageRef = doc(this.channelService.getMessageRef(this.channelDataService.channelID), messageID);

    await updateDoc(messageRef, { answerInfo: answerInfos })
    const a = (await getDoc(messageRef)).data();
    // console.log(a['answerInfo'])
  }


  openThread(messageID: string) {

    this.main.threadOpen = false;
    this.channelService.activeMessageID = messageID;
    setTimeout(() => {
      this.main.threadOpen = true
    }, 0.001);

  }



  toggleEmojiNew(messageID: string) {

  }


  editMessage() {

  }
}