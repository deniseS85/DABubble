import { Component, ElementRef, Renderer2, inject, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AuthService } from "../../auth.service";
import { Firestore, Unsubscribe, collection, doc, getDoc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { ChannelService } from '../../services/channel.service';
import { Channel } from "../../models/channel.class";
import { ActivatedRoute } from '@angular/router';

interface Chat {
  avatar: string;
  reactionMenu: {
    emoji: string;
    handsUp: string;
    addReaction: string;
    answer: string;
    isEmojiOpen: boolean;
    selectedEmojis: string[];
  };
  userName: string;
  sendingTime: string;
  messageContent: string;
  answerInfo: {
    counter: number;
    lastAnswerTime: string;
  };
  date: string; 
}

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
  unsubChannelUser: Unsubscribe | undefined;

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
    sendingTime: "14.25 Uhr",
    messageContent: "Ja, wirklich der Wahnsinn!",
    answerInfo: {
      counter: 0,
      lastAnswerTime: ""
    },
    date: "Heute",
  },
];
  chatUserID: string = '';
  /* //////////////////////////////////////// */

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private authservice: AuthService,
    public channelService: ChannelService,
    private route: ActivatedRoute
  ) {
    this.showContainer = new Array(this.reactions.length).fill(false);
    this.userID = this.route.snapshot.paramMap.get('id');

  }

  ngOnInit() {
    if (this.userID) {
      this.checkIsGuestLogin();
    }

    this.unsubUser = onSnapshot(this.channelService.getUsersRef(), (list) => {
      this.allUsers = [];
      list.forEach(singleUser => {
        let user = new User(singleUser.data());
        user.id = singleUser.id;
        this.allUsers.push(user);
      });
    });

    this.unsubChannelUser = onSnapshot(this.channelService.getChannelRef(), (list) => {
      this.channelInfo = [];
      list.forEach(channel => {
        let channelInfo = new Channel(channel.data());
        this.channelName = channelInfo.channelname;
        this.channelUsers = channelInfo.channelUsers;
        this.channelCreator = channelInfo.channelCreator;
        this.channelDescription = channelInfo.description;
        this.channelID = channelInfo.channelID;
        console.log();
      });
    });
  }

  ngOnDestroy() {
    this.unsubUser;
    this.unsubChannelUser;
    this.unsubscribeSnapshot;
  }

  showReaction(index: number) {
    this.showContainer[index] = true;
  }

  hideReaction(index: number) {
    this.showContainer[index] = false;
  }

  toggleAnimationState(state: 'visible' | 'hidden'): void {
    this.animationState = state;
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
    let emojiToAdd = selectedEmoji.emoji.native;
  
    if (!this.chats[chatIndex].reactionMenu.selectedEmojis) {
      this.chats[chatIndex].reactionMenu.selectedEmojis = [];
    }
    this.chats[chatIndex].reactionMenu.selectedEmojis.push(emojiToAdd);
  }

  getUniqueEmojis(selectedEmojis: string[]): string[] {
    return Array.from(new Set(selectedEmojis));
  }
  
  getEmojiCount(selectedEmojis: string[], emoji: string): number {
    return selectedEmojis.filter(e => e === emoji).length;
  }

  openPopup(): void {
    this.renderer.setStyle(this.body, 'overflow', 'hidden');
  }

  closePopup(): void {
    this.renderer.setStyle(this.body, 'overflow', 'auto');
  }

  doNotClose(event: MouseEvent): void {
    event.stopPropagation();
  }

  checkUser() {

  }

  saveNewDescription() {
    this.updateChannel(this.channelID,{
      description: this.newChannelDescription
      });
  }

  saveNewChannelName() {
    this.updateChannel(this.channelID,{
      channelname: this.newChannelName
      });
  }

  async updateChannel(channelID: string, item: {}) {
    await updateDoc(this.getSingelChannelRef(this.channelID), item);
    console.log(item);
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

  getUserfromFirebase(): void {
    this.unsubscribeSnapshot = onSnapshot(this.getUserID(), (element) => {
      this.user = new User(element.data());
      this.user.id = this.userID;
      this.chatUserID = this.userID;
      this.userFullName = `${this.user.firstname} ${this.user.lastname}`;
    });
  }

  isCurrentUser(chatUserID: string): boolean {
    return this.chatUserID === this.userID;
  }
}
