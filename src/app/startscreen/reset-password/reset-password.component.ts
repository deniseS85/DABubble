import { Component, EventEmitter, Output, HostListener, ElementRef, ViewChild } from '@angular/core';
import { StartscreenComponent } from '../startscreen.component';
import { AuthService } from '../../auth.service';

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
    
    constructor(public startscreen: StartscreenComponent, private authService: AuthService) { }

    toggleReset() {
        this.startscreen.toggleView('login');
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: Event): void {
        this.shouldWordBreak = window.innerWidth <= 577;
    }

    sendResetMail() {
        let mail = this.email.nativeElement.value;
        this.isEmailInvalid = !this.isValidEmail(mail);
        
        if (!this.isEmailInvalid) {
            this.authService.forgotPassword(mail);
            this.confirmationContainer.nativeElement.style.display = 'flex';
            setTimeout(() => {
                this.startscreen.toggleView('login')
              }, 2000);
          }
        
    }
    

    isValidEmail(email: string): boolean {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
      }
   
}
