import { Component, EventEmitter, Output } from '@angular/core';
import { StartscreenComponent } from '../startscreen.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  @Output() backToLogin = new EventEmitter<void>();
    
  constructor(public startscreen: StartscreenComponent) { }

  toggleReset() {
      this.startscreen.toggleView('login');
  }

}
