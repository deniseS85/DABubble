import { Component, ElementRef, Renderer2, inject } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AuthService } from "../../auth.service";
import { Firestore, Unsubscribe, collection, doc, onSnapshot } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { ChannelService } from '../../services/channel.service';
import { Channel } from "../../models/channel.class";



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
export class ChannelChatComponent {
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

  body = this.elRef.nativeElement.ownerDocument.body;


  reactions = [
    { users: 'Noah Braun', count: 1 },
  ];

  showContainer: boolean[] = [];

  firestore: Firestore = inject(Firestore);
  unsubUser: Unsubscribe | undefined;
  unsubChannelUser: Unsubscribe | undefined;

  constructor(private elRef: ElementRef, private renderer: Renderer2, private authservice: AuthService, public channelService: ChannelService) {
    this.showContainer = new Array(this.reactions.length).fill(false);

  }

  ngOnInit() {
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
        console.log(channelInfo);
    
        this.channelInfo.push(channelInfo);
      });
    });
  }

  ngOndestroy() {
    this.unsubUser;
    this.unsubChannelUser;
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
}
