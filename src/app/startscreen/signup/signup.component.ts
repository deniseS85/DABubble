import { Component, EventEmitter, Output } from '@angular/core';
import { StartscreenComponent } from '../startscreen.component';
import { createUserWithEmailAndPassword } from '@firebase/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
    @Output() openLogin = new EventEmitter<void>();
    @Output() openSelectAvatar = new EventEmitter<{ firstName: string, lastName: string }>();
    @Output() openImprint = new EventEmitter<void>(); 
    @Output() openPrivacy = new EventEmitter<void>();
    signUpForm!: FormGroup;
    userAlreadyExists: boolean = false;

    constructor(public startscreen: StartscreenComponent, private formBuilder: FormBuilder, private router: Router, private authService: AuthService) { 
        this.setSignUpForm();
    }

    toggleSignup() {
        this.startscreen.toggleView('login'); 
    }

    async signUpUser() {
        await createUserWithEmailAndPassword(this.authService.auth, this.signUpForm.value.email, this.signUpForm.value.password)
          .then((userCredential) => {
              let { firstLastName } = this.signUpForm.value;
              let [firstName, lastName] = firstLastName.split(' ');
              this.openSelectAvatar.emit({ firstName, lastName });
          })
          .catch((error) => {
              if (error.code === 'auth/email-already-in-use') {
                  console.log('User ist bereits registriert');
                  this.userAlreadyExists = true;
              }
          })
    }

    setSignUpForm() {
        this.signUpForm = this.formBuilder.group({
            firstLastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)]],
            agreement: [false, Validators.requiredTrue]
         });
    }
}
