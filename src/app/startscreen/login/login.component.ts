import { Component, EventEmitter, Output } from '@angular/core';
import { endBefore } from '@firebase/firestore';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
    @Output() openSignup = new EventEmitter<void>();
    @Output() openResetPassword = new EventEmitter<void>();
    @Output() openImprint = new EventEmitter<void>(); 
    @Output() goBack = new EventEmitter<void>();

}
