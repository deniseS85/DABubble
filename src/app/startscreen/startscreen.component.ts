import { Component } from '@angular/core';


@Component({
  selector: 'app-startscreen',
  templateUrl: './startscreen.component.html',
  styleUrl: './startscreen.component.scss'
})
export class StartscreenComponent {
    isLogin = true;
    isSignup = false;
    isResetPassword = false;

    toggleView(view: 'login' | 'signup' | 'resetPassword'): void {
      this.isLogin = view === 'login' ? !this.isLogin : false;
      this.isSignup = view === 'signup' ? !this.isSignup : false;
      this.isResetPassword = view === 'resetPassword' ? !this.isResetPassword : false;
    }

}
