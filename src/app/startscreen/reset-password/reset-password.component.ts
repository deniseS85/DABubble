import { Component, EventEmitter, Output, HostListener, ElementRef, ViewChild, inject } from '@angular/core';
import { StartscreenComponent } from '../startscreen.component';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
    @Output() backToLogin = new EventEmitter<void>();
    @Output() goBack = new EventEmitter<void>();
    @Output() openImprint = new EventEmitter<void>();
    @Output() openPrivacy = new EventEmitter<void>(); 
    shouldWordBreak: boolean = window.innerWidth <= 577;
    @ViewChild('email') email!: ElementRef;
    @ViewChild('confirmationContainer') confirmationContainer!: ElementRef;
    isEmailInvalid: boolean = false;
    firestore: Firestore = inject(Firestore);
    confirmationMessage: string = '';
    
    constructor(public startscreen: StartscreenComponent) { }

    toggleReset() {
        this.startscreen.toggleView('login');
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: Event): void {
        this.shouldWordBreak = window.innerWidth <= 577;
    }

    async sendResetMail() {
        let mail = this.email.nativeElement.value;
        this.isEmailInvalid = !this.isValidEmail(mail);
    
        if (!this.isEmailInvalid) {
            let userExists = await this.isAlreadyUser(mail);
            this.confirmationMessage = userExists ? 'E-Mail wurde gesendet.' : 'Benutzer nicht registriert.';
            this.confirmationContainer.nativeElement.style.display = 'flex';
            setTimeout(() => {
                this.startscreen.toggleView('login');
            }, 2000);
        }
    }

    async isAlreadyUser(email: string): Promise<boolean> {
        try {
          let querySnapshot = await getDocs(query(collection(this.firestore, 'users'), where('email', '==', email)));
          return !querySnapshot.empty;
        } catch (error) {
          return false;
        }
    }
    
    isValidEmail(email: string): boolean {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
      }
   
}
