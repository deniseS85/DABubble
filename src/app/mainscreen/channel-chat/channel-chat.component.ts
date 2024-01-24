import { Component, ElementRef, Renderer2, inject } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AuthService } from "../../auth.service";
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';
import { User } from '../../models/user.class';



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
  userInput = '';
  enabled = false;
  channelNameChange = false;
  channelDescriptionChange = false;
  showProfil = false;
  user = new User;
  allUsers: User[] = [];

  body = this.elRef.nativeElement.ownerDocument.body;
  

  reactions = [
    { users: 'Noah Braun', count: 1 },
  ];

  showContainer: boolean[] = [];

  firestore: Firestore = inject(Firestore);
  unsubUser;

  constructor(private elRef: ElementRef, private renderer: Renderer2, private authservice: AuthService) {
    this.showContainer = new Array(this.reactions.length).fill(false);
    this.unsubUser = onSnapshot(this.getUsersRef(), (list) => {
      this.allUsers = [];
      list.forEach(singleUser => {
        let user = new User(singleUser.data());
        user.id = singleUser.id;
        this.allUsers.push(user); 
      });
    });
  }

  ngOndestroy() {
    this.unsubUser;
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

  doNotClose(event: MouseEvent) : void{
    event.stopPropagation();
  }

  checkUser() {
    console.log(this.allUsers);
    console.log(this.allUsers[0].profileImg)
  }

  getUsersRef() {
    return collection(this.firestore, 'users');
  }
}
