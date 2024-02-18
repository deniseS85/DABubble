import { Component, EventEmitter, Output, inject } from '@angular/core';
import { signInAnonymously, signInWithEmailAndPassword } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { collection, getDocs, query, where, Firestore } from '@angular/fire/firestore';
import { UserService } from '../../services/user.service';
import { SearchService } from '../../services/search-service.service';
import { ChannelService } from '../../services/channel.service';
import { ChatService } from '../../services/chat.service';


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
    
    constructor(private formBuilder: FormBuilder, 
        private authService: AuthService, 
        private userservice: UserService, 
        private router: Router, 
        private searchservice: SearchService, 
        private channelService: ChannelService,
        private chatService: ChatService
        ) { 
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
                    this.userservice.setUserDetails(firstname, lastname, profileImg);
                    
                    await signInWithEmailAndPassword(this.authService.auth, email, this.logInForm.value.password);
                    let userId = await this.getUserIDFromFirebase(email);

                    if (userId) {
                        this.authService.setOnlineStatus(userId, true);
                        this.router.navigate(['/main', userId]);
                        this.searchservice.loadUsers();
                        this.authService.setSession(userId)
                    } 
                }
            } else {
                this.userAlreadyExists = false;
            }
        } catch (error:any) {
           /*  this.handleAuthError(error); */
            this.isWrongPassword = true;
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
                this.userservice.setUserDetails('Gast', '', 'guest-profile.png');
                this.isAnonymous = true;
                await this.authService.setOnlineStatus(uid, true);
                this.authService.setSession(uid);
                this.chatService.createChatsForGuest(uid);
                this.router.navigate(['/main', uid]);                
            }
        } catch (error: any) {
          /*   this.handleAuthError(error); */
        }
    }

    async loginWithGoogle() {
        this.isGoogleLogin = true;
        this.authService.setGoogleLoginStatus(true);

        try {
            let googleUser = await this.authService.signInWithGoogle();
            // this.authService.setSession(userId);
            let displayName = googleUser.user.displayName;
            let email = googleUser.user.email;
    
            if (displayName && email) {
                let [firstName, lastName] = displayName.split(' ');
                await this.handleUserDetails(firstName, lastName, email);
                this.searchservice.loadUsers();
            }
        } catch (error: any) {
          /*   this.handleAuthError(error); */
        }
    }

    private async handleUserDetails(firstName: string, lastName: string, email: string) {
        const querySnapshot = await getDocs(query(collection(this.firestore, 'users'), where('email', '==', email)));
    
        if (querySnapshot.empty) {
            this.openSelectAvatar.emit({
                firstname: firstName,
                lastname: lastName,
                email: email,
                isOnline: true
            });
        } else {
            let userDocument = querySnapshot.docs[0].data() as UserData;
            this.userservice.setUserDetails(userDocument.firstname, userDocument.lastname, userDocument.profileImg);
            let userId = await this.getUserIDFromFirebase(email);
            this.authService.setSession(userId)
            if (userId) {
                await this.authService.setOnlineStatus(userId, true);
                this.router.navigate(['/main', userId]);
            } 
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

   /*  private handleAuthError(error: any) {
        if (error.code === 'auth/invalid-credential') {
            this.isWrongPassword = true;
        }
    } */
}
