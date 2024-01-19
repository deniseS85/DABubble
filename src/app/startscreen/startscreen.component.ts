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
    isSelectAvatar = false;
    isImprint = false;
    viewsHistory: Array<'login' | 'signup' | 'resetPassword' | 'selectAvatar' | 'imprint'> = [];
    currentView: 'login' | 'signup' | 'resetPassword' | 'selectAvatar' | 'imprint' = 'login';

    toggleView(view: 'login' | 'signup' | 'resetPassword' | 'selectAvatar' | 'imprint' | undefined = 'login'): void {
        this.viewsHistory.push(this.currentView);
        this.currentView = view;
        this.isLogin = view === 'login' ? !this.isLogin : false;
        this.isSignup = view === 'signup' ? !this.isSignup : false;
        this.isResetPassword = view === 'resetPassword' ? !this.isResetPassword : false;
        this.isSelectAvatar = view === 'selectAvatar' ? !this.isSelectAvatar : false;
        this.isImprint = view === 'imprint' ? !this.isImprint : false;
    }

    goBack(): void {
      if (this.viewsHistory.length > 0) {
        const lastView = this.viewsHistory.pop();
        this.toggleView(lastView);
      }
    }

}
