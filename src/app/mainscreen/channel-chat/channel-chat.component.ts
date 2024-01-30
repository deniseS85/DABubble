import { Component, ElementRef, Renderer2, inject, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AuthService } from "../../auth.service";
import { Firestore, Unsubscribe, collection, doc, getDoc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { ChannelService } from '../../services/channel.service';
import { Channel } from "../../models/channel.class";
import { ActivatedRoute } from '@angular/router';
import { Chat } from '../../models/channel.interface';
import { ChannelDataService } from '../../services/channel-data.service';

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
  ],
})
export class ChannelChatComponent implements OnInit, OnDestroy{
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

  newChannelName: string = '';
  newChannelDescription: string = '';
  newChannelMember: string = '';

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

  /* //////////////////////////////////////// */
  chats: Chat[] = [ 
    {
    avatar: "../../../assets/img/avatarNoah.png",
    reactionMenu: {
      emoji: "../../../assets/img/emoji1.png",
      handsUp: "../../../assets/img/hands-up.png",
      addReaction: "../../../assets/img/add_reaction.png",
      answer: "../../../assets/img/Answer.png",
      isEmojiOpen: false,
      selectedEmojis: []
    },
    userName: "Noah Braun",
    chatUserID: 'kdsjfkdsjfkjjkdjfddks',
    sendingTime: "14.25 Uhr",
    messageContent: "Super neuer Chat, Klasse!",
    answerInfo: {
      counter: 2,
      lastAnswerTime: "Letzte Antwort 14:56 Uhr"
    },
    date: "Dienstag, 14.Januar",
  },
  {
    avatar: "../../../assets/img/avatarSofia.png",
    reactionMenu: {
      emoji: "../../../assets/img/emoji1.png",
      handsUp: "../../../assets/img/hands-up.png",
      addReaction: "../../../assets/img/add_reaction.png",
      answer: "../../../assets/img/Answer.png",
      isEmojiOpen: false,
      selectedEmojis: []
    },
    userName: "Sofia Müller",
    chatUserID: 'kldfjkdjkjsfdksjkd',
    sendingTime: "14.25 Uhr",
    messageContent: "Ja, wirklich der Wahnsinn!",
    answerInfo: {
      counter: 0,
      lastAnswerTime: ""
    },
    date: "Heute",
  },
  {
    avatar: "../../../assets/img/avatarSofia.png",
    reactionMenu: {
      emoji: "../../../assets/img/emoji1.png",
      handsUp: "../../../assets/img/hands-up.png",
      addReaction: "../../../assets/img/add_reaction.png",
      answer: "../../../assets/img/Answer.png",
      isEmojiOpen: false,
      selectedEmojis: []
    },
    userName: "Ich",
    chatUserID: '58cPaPteJ8gFgzmP1pMv',
    sendingTime: "14.25 Uhr",
    messageContent: "Ich bin der currentUser!",
    answerInfo: {
      counter: 3,
      lastAnswerTime: "Letzte Antwort"
    },
    date: "Heute",
  },
  
];
 /*  chatUserID: string = ''; */
  userIsOnline: boolean = false;
  /* //////////////////////////////////////// */

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private authservice: AuthService,
    public channelService: ChannelService,
    private route: ActivatedRoute,
    public channelDataService: ChannelDataService 
  ) {
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
    this.chats.forEach((chat, i) => {
      chat.animationState = i === index ? state : 'hidden';
    });
  }

  toggleAnimationState1(state: 'visible' | 'hidden'): void {
    this.animationState1 = state;
  }

  toggleEmoji(event: Event, chatIndex: number) {
    event.stopPropagation();
  
    this.chats.forEach((chat, index) => {
      if (index === chatIndex) {
        chat.reactionMenu.isEmojiOpen = !chat.reactionMenu.isEmojiOpen;
      } else {
        chat.reactionMenu.isEmojiOpen = false;
      }
    });
  }
  
  emojiSelected(selectedEmoji: any, chatIndex: number) {
    if (!this.chats[chatIndex].reactionMenu.selectedEmojis) {
      this.chats[chatIndex].reactionMenu.selectedEmojis = [];
    }
  
    let userSelectedEmojis = this.chats[chatIndex].reactionMenu.selectedEmojis;
    let emojiIndex = userSelectedEmojis.indexOf(selectedEmoji.emoji.native);
  
    if (emojiIndex !== -1) {
      userSelectedEmojis.splice(emojiIndex, 1);
    } else {
      userSelectedEmojis.push(selectedEmoji.emoji.native);
    }
  }

  getUniqueEmojis(selectedEmojis: string[]): string[] {
    return Array.from(new Set(selectedEmojis));
  }
  
  getEmojiCount(selectedEmojis: string[], emoji: string): number {
    return selectedEmojis.filter(e => e === emoji).length;
  }

  getEmojiPath(chat: Chat, index: number): string {
    const selectedEmojis = chat.reactionMenu.selectedEmojis;
  
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
    } catch (error) {}
  }

  isCurrentUser(chatIndex: number): boolean {
    console.log(this.chats[chatIndex].chatUserID === this.userID);
    return  this.chats[chatIndex].chatUserID === this.userID;
  }
  
  

  // User filter function
  
  selectedUsers: User[] = [];
  searchQuery: string = '';

  isButtonDisabled: boolean = true;

  userList;
  
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
}