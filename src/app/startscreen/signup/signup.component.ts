import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { StartscreenComponent } from '../startscreen.component';
import { createUserWithEmailAndPassword } from '@firebase/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
    @Output() openLogin = new EventEmitter<void>();
    @Output() openSelectAvatar = new EventEmitter<any>();
    @Output() openImprint = new EventEmitter<void>(); 
    @Output() openPrivacy = new EventEmitter<void>();
    signUpForm!: FormGroup;
    userAlreadyExists: boolean = false;
    shouldWordBreak: boolean = window.innerWidth <= 511 && window.innerHeight > 896;
    isChecked: boolean = false;
    @ViewChild('checkboxSelector') checkboxSelector!: ElementRef;

    constructor(public startscreen: StartscreenComponent, private formBuilder: FormBuilder, private authService: AuthService) { 
        this.setSignUpForm();
    }


    @HostListener('window:resize', ['$event'])
    onResize(event: Event): void {
        this.shouldWordBreak = window.innerWidth <= 511 && window.innerHeight > 896;
    }

    toggleChecked () {
        this.isChecked = !this.isChecked;
    }

    toggleSignup() {
        this.startscreen.toggleView('login'); 
    }

    async signUpUser() {
        await createUserWithEmailAndPassword(this.authService.auth, this.signUpForm.value.email, this.signUpForm.value.password)
        .then((userCredential) => {
            let signUpFormData = this.signUpForm.value;
            delete signUpFormData.password;
            this.openSelectAvatar.emit({ ...signUpFormData });
            this.checkboxSelector.nativeElement.classList.remove('checkbox-selected');
        })
        .catch((error) => {
            if (error.code === 'auth/email-already-in-use') {
                this.userAlreadyExists = true;
            }
        })
    }

    setSignUpForm() {
        this.signUpForm = this.formBuilder.group({
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&-]{8,}$/)]]
         });
    }
}
