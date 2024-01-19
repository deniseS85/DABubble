import { Component, EventEmitter, Output } from '@angular/core';
import { StartscreenComponent } from '../startscreen.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
    @Output() openLogin = new EventEmitter<void>();
    @Output() openSelectAvatar = new EventEmitter<void>();
    @Output() openImprint = new EventEmitter<void>(); 
  
    constructor(public startscreen: StartscreenComponent) { }

    toggleSignup() {
        this.startscreen.toggleView('login'); 
    }
}
