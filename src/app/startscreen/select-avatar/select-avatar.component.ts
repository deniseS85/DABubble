import { Component, EventEmitter, Output, HostListener } from '@angular/core';
import { StartscreenComponent } from '../startscreen.component';

@Component({
  selector: 'app-select-avatar',
  templateUrl: './select-avatar.component.html',
  styleUrl: './select-avatar.component.scss'
})
export class SelectAvatarComponent {
    @Output() backToSignup = new EventEmitter<void>();
    @Output() openImprint = new EventEmitter<void>(); 
    @Output() openPrivacy = new EventEmitter<void>(); 
    shouldWordBreak: boolean = window.innerWidth <= 577;
    hideElement: boolean = window.innerWidth <= 950;
    avatarSrc = './assets/img/profile.png';
    showConfirmation: boolean = false;
    
    constructor(public startscreen: StartscreenComponent) { }

    toggleAvatar() {
        this.startscreen.toggleView('signup');
    }

    @HostListener('window:resize', ['$event'])
      onResize(event: Event): void {
        this.shouldWordBreak = window.innerWidth <= 577;
        this.hideElement = window.innerWidth <= 950;
    }

    selectAvatar(avatarNr: number) {
        this.avatarSrc = `./assets/img/avatar${avatarNr}.png`;
    }

    onSubmit() {
      this.showConfirmation = true;

      setTimeout(() => {
          this.showConfirmation = false;
      }, 3000); 
    }
}
