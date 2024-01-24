import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
    auth: Auth = inject(Auth);
    private userFirstName: string = '';
    private userLastName: string = '';
    private userImg: string = '';
    private isAnonymous: boolean = false;
    private isGoogleLoginSource = new BehaviorSubject<boolean>(false);
    private userDataSubject = new BehaviorSubject<any>({});
    isGoogleLogin$ = this.isGoogleLoginSource.asObservable();
    userData$ = this.userDataSubject.asObservable();

    
    setUserDetails(firstName: string, lastName: string, profileImg: string): void {
        this.userFirstName = firstName;
        this.userLastName = lastName;
        this.userImg = profileImg;
        this.saveUserData();
    }

    getUserFirstName(): string {
        return this.userFirstName;
    }

    getUserLastName(): string {
        return this.userLastName;
    }

    getUserImg(): string {
        return this.userImg
    }

    getUserEmail(): string {
        let user = this.auth.currentUser;
        return user ? user.email || '' : '';
    }

    saveUserData(): void {
        localStorage.setItem('userFirstName', this.userFirstName);
        localStorage.setItem('userLastName', this.userLastName);
        localStorage.setItem('userImg', this.userImg);
    }

    restoreUserData(): void {
        this.userFirstName = localStorage.getItem('userFirstName') || '';
        this.userLastName = localStorage.getItem('userLastName') || '';
        this.userImg = localStorage.getItem('userImg') || '';
    }

    setAnonymousStatus(isAnonymous: boolean): void {
        this.isAnonymous = isAnonymous;
    }

    isUserAnonymous(): boolean {
        return this.isAnonymous;
    }

    signInWithGoogle() {
        return signInWithPopup(this.auth, new GoogleAuthProvider());
    }

    forgotPassword(email: string) {
        sendPasswordResetEmail(this.auth, email).then(() => {
        }).catch((err) => {})
    } 

    setGoogleLoginStatus(status: boolean) {
        this.isGoogleLoginSource.next(status);
    }

    async logout() {
            this.setAnonymousStatus(false);
            let user = this.auth.currentUser;
            
            if (user && user.isAnonymous) {
                try {
                    await user.delete();
                } catch (error) {}
            }
            try {
                await this.auth.signOut();
                localStorage.removeItem('userFirstName');
                localStorage.removeItem('userLastName');
                localStorage.removeItem('userImg');
            } catch (error) {}
    }  

    setUserData(updatedData: any): void {
        const currentData = this.userDataSubject.value;
        const newData = { ...currentData, ...updatedData };
        this.userDataSubject.next(newData);
    }
}