import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, reauthenticateWithCredential, verifyBeforeUpdateEmail, getAuth, updateEmail, updateProfile, User, sendEmailVerification } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    auth: Auth = inject(Auth);
    firestore: Firestore = inject(Firestore);
    private isAnonymous: boolean = false;
    private isGoogleLoginSource = new BehaviorSubject<boolean>(false);
    private userDataSubject = new BehaviorSubject<any>({});
    isGoogleLogin$ = this.isGoogleLoginSource.asObservable();
    userData$ = this.userDataSubject.asObservable();
 

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

    async logout(userId: string) {
        this.setAnonymousStatus(false);
    
        try {
            const user = this.auth.currentUser;
    
            if (user) {
                await this.setOnlineStatus(userId, false);
    
                if (user.isAnonymous) {
                    await user.delete();
                }
            }
            await this.auth.signOut();
            localStorage.removeItem('userFirstName');
            localStorage.removeItem('userLastName');
            localStorage.removeItem('userImg');
        } catch (error) {
            console.error('Fehler beim Ausloggen:', error);
        }
    }

    async updateAndVerifyEmail(newEmail: any): Promise<void> {
       

       
          
     /*    updateEmail(auth.currentUser, "user@example.com").then(() => {
            // Email updated!
            // ...
          }).catch((error) => {
            // An error occurred
            // ...
          }); */
        /* if (user) {
            verifyBeforeUpdateEmail(user, newEmail).then(() => {
                console.log('email gesendet')
              }).catch((error) => {
                // An error happened.
              });
            
        }  */
    }

    async setOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
        try {
          const userDocRef = doc(this.firestore, 'users', userId);
          await updateDoc(userDocRef, { isOnline: isOnline });
        } catch (error) {}
    }

    async getOnlineStatus(userId: string): Promise<boolean> {
        try {
          const userDocRef = doc(this.firestore, 'users', userId);
          const userDocSnap = await getDoc(userDocRef);
    
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            return userData['isOnline'] || false;
          } else {
            console.log(`Benutzerdokument mit ID ${userId} existiert nicht.`);
            return false;
          }
        } catch (error) {
          console.error('Fehler beim Abrufen des Online-Status:', error);
          return false;
        }
    }


}
