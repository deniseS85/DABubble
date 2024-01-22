import { Component } from '@angular/core';
import { User } from '../models/user.class';

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
    isPrivacy = false;
    isMain = false;
    viewsHistory: Array<'login' | 'signup' | 'resetPassword' | 'selectAvatar' | 'imprint' | 'privacy'> = [];
    currentView: 'login' | 'signup' | 'resetPassword' | 'selectAvatar' | 'imprint'| 'privacy' = 'login';
    userData: User = new User();


    toggleView(view: 'login' | 'signup' | 'resetPassword' | 'selectAvatar' | 'imprint' | 'privacy' | undefined = 'login', data?: User): void {
        this.viewsHistory.push(this.currentView);
        this.currentView = view;
        this.isLogin = view === 'login' ? !this.isLogin : false;
        this.isSignup = view === 'signup' ? !this.isSignup : false;
        this.isResetPassword = view === 'resetPassword' ? !this.isResetPassword : false;
        this.isSelectAvatar = view === 'selectAvatar' ? !this.isSelectAvatar : false;
        this.isImprint = view === 'imprint' ? !this.isImprint : false;
        this.isPrivacy = view === 'privacy' ? !this.isPrivacy : false;
        if (this.isSelectAvatar && data) {
            this.userData = data;
        }
    }

    goBack(): void {
        if (this.viewsHistory.length > 0) {
            let lastView = this.viewsHistory.pop();
            this.toggleView(lastView);
        }
    }
}
