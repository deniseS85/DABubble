import { Component, EventEmitter, Output, inject } from '@angular/core';
import { signInAnonymously, signInWithEmailAndPassword } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { collection, getDocs, query, where, Firestore } from '@angular/fire/firestore';


interface UserData {
  firstname: string;
  lastname: string;
  profileImg: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
    @Output() openSignup = new EventEmitter<void>();
    @Output() openResetPassword = new EventEmitter<void>();
    @Output() openImprint = new EventEmitter<void>(); 
    @Output() openPrivacy = new EventEmitter<void>(); 
    @Output() goBack = new EventEmitter<void>();
    @Output() openSelectAvatar = new EventEmitter<any>();
    logInForm!: FormGroup;
    userAlreadyExists: boolean = true;
    firestore: Firestore = inject(Firestore);
    isAnonymous: boolean = false;
    isGoogleLogin: boolean = false;
    isWrongPassword: boolean = false;
    isSubmitted: boolean = false;
    
    constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router, private route: ActivatedRoute) { 
        this.setLoginForm();
    }

    async logInUser() {
        let email = this.logInForm.value.email;
        this.isSubmitted = true;

        try {
            let userExistsResult = await this.isAlreadyUser(email);
    
            if (userExistsResult.exists) {
                const { firstname, lastname, profileImg } = userExistsResult.userData!;
    
                if (firstname && lastname && profileImg) {
                    this.authService.setUserDetails(firstname, lastname, profileImg);
                    await signInWithEmailAndPassword(this.authService.auth, email, this.logInForm.value.password);
                    let userId = await this.getUserIDFromFirebase(email);

                    if (userId) {
                        this.router.navigate(['/main', userId]);
                    } 
                }
            } else {
                this.userAlreadyExists = false;
            }
        } catch (error:any) {
            if (error.code === 'auth/invalid-credential') {
                this.isWrongPassword = true;
            }
        }
    }

    async isAlreadyUser(email: string): Promise<{ exists: boolean, userData?: UserData }> {
        try {
            let querySnapshot = await getDocs(query(collection(this.firestore, 'users'), where('email', '==', email)));
    
            if (!querySnapshot.empty) {
                let userDocument = querySnapshot.docs[0].data() as UserData;
                return { exists: true, userData: userDocument };
            } else {
                return { exists: false };
            }
        } catch (error) {
            return { exists: false };
        }
    }
    
    setLoginForm() {
        this.logInForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
        });
    }

    async signInAnonymously() {
        try {
            let result = await signInAnonymously(this.authService.auth);
            let user = result.user;
            let uid = user?.uid;
            if (uid) {
                this.authService.setAnonymousStatus(true);
                this.authService.setUserDetails('Gast', '', 'guest-profile.png');
                this.isAnonymous = true;
                this.router.navigate(['/main', uid]);
            }
        } catch (error: any) {
            this.handleAuthError(error);
        }
    }

    async loginWithGoogle() {
        this.isGoogleLogin = true;
        this.authService.setGoogleLoginStatus(true);

        try {
            let googleUser = await this.authService.signInWithGoogle();
            
            let displayName = googleUser.user.displayName;
            let email = googleUser.user.email;
    
            if (displayName && email) {
                let [firstName, lastName] = displayName.split(' ');
                
                let querySnapshot = await getDocs(query(collection(this.firestore, 'users'), where('email', '==', email)));
                if (querySnapshot.empty) {
                    this.openSelectAvatar.emit({
                        firstname: firstName,
                        lastname: lastName,
                        email: email

                    });
                } else {
                    let userDocument = querySnapshot.docs[0].data() as UserData;
                    this.authService.setUserDetails(userDocument.firstname, userDocument.lastname, userDocument.profileImg);
                    let userId = await this.getUserIDFromFirebase(email);

                    if (userId) {
                        this.router.navigate(['/main', userId]);
                    } 
                }
            }
        } catch (error: any) {
            this.handleAuthError(error);
        }
    }

    async getUserIDFromFirebase(email: string): Promise<string | null> {
        try {
            let querySnapshot = await getDocs(query(collection(this.firestore, 'users'), where('email', '==', email)));

            if (!querySnapshot.empty) {
                let userDocument = querySnapshot.docs[0].id;
                return userDocument;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    }

    private handleAuthError(error: any) {
        if (error.code === 'auth/invalid-credential') {
          this.isWrongPassword = true;
        }
    }
}
