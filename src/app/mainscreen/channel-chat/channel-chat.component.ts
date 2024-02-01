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
  animationState = 'hidden';
  animationState1 = 'hidden';

  addUSerOpen = false;
  showMembersOpen = false;
  editChannelOpen = false;

  enabled = false;
  channelNameChange = false;
  channelDescriptionChange = false;
  showProfil = false;

  user = new User;
  userID: any;
  channel = new Channel;
  allUsers: User[] = [];
  channelInfo: Channel[] = [];
  channelName: string = '';
  channelCreator: string = '';
  channelDescription: string = '';
  channelUsers: any[] = [];
  channelUsersUpdated: any[] = [];

  newChannelName: string = '';
  newChannelDescription: string = '';

  messagetext: string = '';
  allMessages: any[] = [];
  channelID: string = '';
  userFullName: string = '';
  private unsubscribeSnapshot: Unsubscribe | undefined;

  body = this.elRef.nativeElement.ownerDocument.body;

  reactions = [
    { users: 'Noah Braun', count: 1 },
  ];
  showContainer: boolean[] = [];
  firestore: Firestore = inject(Firestore);
  unsubUser: Unsubscribe | undefined;
  selectedUsers: User[] = [];
  selectedUser: User = new User();
  searchQuery: string = '';
  isButtonDisabled: boolean = true;
  userList;
  userIsOnline: boolean = false;


  constructor(
    private main: MainscreenComponent,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private authservice: AuthService,
    public channelService: ChannelService,
    private route: ActivatedRoute,
    public channelDataService: ChannelDataService,
    private datePipe: DatePipe,
  ) {
    this.loadMessagesOfThisChannel();
    this.showContainer = new Array(this.reactions.length).fill(false);
    this.userID = this.route.snapshot.paramMap.get('id');
    this.userList = this.getUserfromFirebase();

  }

  ngOnInit() {
    if (this.userID) {
      this.checkIsGuestLogin();
    }

    this.getAllUserInfo();
  }

  ngOnDestroy() {
    this.unsubUser;
    this.unsubscribeSnapshot;
  }

  getAllUserInfo() {
    this.unsubUser = onSnapshot(this.channelService.getUsersRef(), (list) => {
      this.allUsers = [];
      list.forEach(singleUser => {
        let user = new User(singleUser.data());
        user.id = singleUser.id;
        this.allUsers.push(user);
      });
    });
  }

  showReaction(index: number) {
    this.showContainer[index] = true;
  }

  hideReaction(index: number) {
    this.showContainer[index] = false;
  }

  toggleAnimationState(state: 'visible' | 'hidden', index: number): void {
    this.allMessages.forEach((message, i) => {
      message.animationState = i === index ? state : 'hidden';
    });
  }

  toggleAnimationState1(state: 'visible' | 'hidden'): void {
    this.animationState1 = state;
  }

  toggleEmoji(event: Event, chatIndex: number) {
    this.allMessages.forEach((message, index) => {
      if (index === chatIndex) {
        message.isEmojiOpen = !message.isEmojiOpen;
        console.log(message.isEmojiOpen)
      }
    });
  }

  emojiSelected(selectedEmoji: any, chatIndex: number) {
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

  closeEmojiContainers(chatIndex: number) {
    this.allMessages[chatIndex].isEmojiOpen = false;
  }

  getUniqueEmojis(selectedEmojis: string[]): string[] {
    return Array.from(new Set(selectedEmojis));
  }

  getEmojiCount(selectedEmojis: string[], emoji: string): number {
    return selectedEmojis.filter(e => e === emoji).length;
  }

  getEmojiPath(message: any, index: number): string {
    const selectedEmojis = message.react.selectedEmojis;

    if (selectedEmojis && selectedEmojis.length > index) {
      return selectedEmojis[selectedEmojis.length - 1 - index];
    }

    return '';
  }

  openPopup(): void {
    this.renderer.setStyle(this.body, 'overflow', 'hidden');
  }

  closePopup(): void {
    this.renderer.setStyle(this.body, 'overflow', 'auto');
    this.searchQuery = '';
    this.selectedUsers = [];
  }

  doNotClose(event: MouseEvent): void {
    event.stopPropagation();
  }

  /**
   * auskommentiert von klemens --> andere Funktion unten
   */
  // addNewMemberToChannelUsers() {
  //   this.channelDataService.channelUsers = this.channelDataService.channelUsers.concat(this.selectedUsers);
  //   this.channelService.addChannelUser(this.channelDataService.channelID, this.channelDataService.channelUsers);
  // }



  /**
   * get selected User, check if he/she is allready Member and add him/her
   */
  async addNewMemberToChannelUsers() {
    let userallreadyInChannel = false;
    const newUser = this.selectedUser.toJson(this.selectedUser);

    userallreadyInChannel = this.checkIfMemberAllreadyIn(this.channelDataService.channelUsers, newUser);
    if (userallreadyInChannel) {
      console.warn(this.selectedUser.firstname, ' is allready Memeber of this channel')
    } else {
          this.addUserToChannel(newUser) 
    }
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
  async addUserToChannel(newUser: any){
    const refChannelUsers = await getDoc(this.getSingelChannelRef(this.channelDataService.channelID))
      
      if(refChannelUsers.exists()){                      
        this.channelUsersUpdated = refChannelUsers.data()['channelUsers'];
        this.channelUsersUpdated.push(newUser);

        await this.updateChannelUsers(this.channelUsersUpdated)        
      } 
  }  

  
  updateChannelUsers(newUsers: any) {
    this.updateChannel(this.channelDataService.channelID, {
      channelUsers: newUsers
    });
  }

  saveNewDescription() {
    this.updateChannel(this.channelDataService.channelID, {
      description: this.newChannelDescription
    });
  }

  saveNewChannelName() {
    this.updateChannel(this.channelDataService.channelID, {
      channelname: this.newChannelName
    });
  }

  async updateChannel(channelID: string, item: {}) {
    await updateDoc(this.getSingelChannelRef(channelID), item);
  }

  getSingelChannelRef(docId: string) {
    return doc(collection(this.firestore, 'channels'), docId);
  }

  checkIsGuestLogin(): void {
    getDoc(this.getUserID()).then((docSnapshot) => {
      if (docSnapshot.exists()) {
        this.getUserfromFirebase();
      } else {
        this.userFullName = 'Gast';
        this.user.profileImg = 'guest-profile.png';
      }
    });
  }

  getUserID() {
    return doc(collection(this.firestore, 'users'), this.userID);
  }

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
    } catch (error) { }
  }

  isCurrentUser(chatIndex: number): boolean {
    return this.allMessages[chatIndex].messageUserID === this.userID;
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
      this.selectedUsers.push(user);
      this.selectedUser = new User(user);
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
      messageUserName: this.authservice.getUserFirstName() + ' ' + this.authservice.getUserLastName(),
      messageUserID: this.userID,
      messageUserProfileImg: this.authservice.getUserImg(),
      messageID: '',
      activeUserMessage: false,
      isEmojiOpen: false,
      timestamp: this.datePipe.transform(new Date(), 'HH:mm'),
      date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),// zum Vergkleiche für anzeige "Heute" oder z.B. "21.Januar"
      react: {
        selectedEmojis: []
      },
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
    const queryAllAnswers = await query(this.channelService.getMessageRef(this.channelService.activeChannelID));

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

  handleReaction($event: any, message: any) {

  }

  editMessage(messageID: string) {

  }
}