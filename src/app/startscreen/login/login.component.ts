import { Component, EventEmitter, Output, inject } from '@angular/core';
import { signInAnonymously, signInWithEmailAndPassword } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { collection, getDocs, query, where } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';

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
    logInForm!: FormGroup;
    userAlreadyExists: boolean = true;
    firestore: Firestore = inject(Firestore);

    constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) { 
        this.setLoginForm();
    }

    async logInUser() {
        let email = this.logInForm.value.email;
        let userExistsResult = await this.isAlreadyUser(email);
    
        if (userExistsResult.exists) {
            let userFirstName = userExistsResult.userData?.firstname;
            let userLastName = userExistsResult.userData?.lastname;
            let userImg = userExistsResult.userData?.profileImg;

            if (userFirstName && userLastName && userImg) {
                this.authService.setUserDetails(userFirstName, userLastName, userImg);
        
                console.log(`Eingeloggter Benutzer: ${userFirstName} ${userLastName}`);
        
                await signInWithEmailAndPassword(this.authService.auth, email, this.logInForm.value.password);
                this.router.navigate(['/main']);
            }
          } else {
              this.userAlreadyExists = false;
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
}
