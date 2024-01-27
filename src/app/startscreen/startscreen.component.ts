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
        if (view === 'privacy') {
            this.isPrivacy = true;
            this.isImprint = false;
        } else if (view === 'imprint') {
            this.isImprint = true;
            this.isPrivacy = false;
        } else {
            this.isPrivacy = false;
            this.isImprint = false;
            this.isSignup = view === 'signup';
            this.isLogin = view === 'login';
            this.isResetPassword = view === 'resetPassword';
            this.isSelectAvatar = view === 'selectAvatar';
        
            if (this.isSelectAvatar && data) {
                this.userData = data;
            }
        }
    }

    goBack(): void {
        if (this.viewsHistory.length > 0) {
            let lastView = this.viewsHistory.pop();
            while (lastView === 'privacy' || lastView === 'imprint') {
                lastView = this.viewsHistory.pop();
            }
            this.toggleView(lastView);
        }
    }

}