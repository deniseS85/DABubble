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
    isPrivacy = false;
    viewsHistory: Array<'login' | 'signup' | 'resetPassword' | 'selectAvatar' | 'imprint' | 'privacy'> = [];
    currentView: 'login' | 'signup' | 'resetPassword' | 'selectAvatar' | 'imprint' | 'privacy' = 'login';
    userData: { firstName: string, lastName: string } = { firstName: '', lastName: '' };
    private formData: any = {};  

    toggleView(view: 'login' | 'signup' | 'resetPassword' | 'selectAvatar' | 'imprint' | 'privacy' | undefined = 'login', data?: { firstName: string, lastName: string }): void {
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

        if (view === 'signup') {
            this.formData = {
              currentView: this.currentView,
              userData: this.userData,
            };
          }
    }

    goBack(): void {
        if (this.viewsHistory.length > 0) {
            let lastView = this.viewsHistory.pop();
            this.toggleView(lastView);
        }
    }

    getFormData(): any {
        return this.formData;
      }



}
