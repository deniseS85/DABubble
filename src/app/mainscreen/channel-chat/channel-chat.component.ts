import { Component, ElementRef, Renderer2 } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';



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

  body = this.elRef.nativeElement.ownerDocument.body;

  reactions = [
    { user: 'Noah Braun', count: 1 },
  ];

  showContainer: boolean[] = [];

  constructor(private elRef: ElementRef, private renderer: Renderer2) {
    this.showContainer = new Array(this.reactions.length).fill(false);
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

  openPopup() {
    this.renderer.setStyle(this.body, 'overflow', 'hidden');
  }

  closePopup() {
    this.renderer.setStyle(this.body, 'overflow', 'auto');
  }

  doNotClose(event: MouseEvent) {
    event.stopPropagation();
  }

  checkUser() {

  }
}
