import { Component, EventEmitter, Output, HostListener } from '@angular/core';
import { StartscreenComponent } from '../startscreen.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
    @Output() backToLogin = new EventEmitter<void>();
    @Output() goBack = new EventEmitter<void>();
    @Output() openImprint = new EventEmitter<void>(); 
    shouldWordBreak: boolean = window.innerWidth <= 577;
    
    constructor(public startscreen: StartscreenComponent) { }

    toggleReset() {
        this.startscreen.toggleView('login');
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: Event): void {
        this.shouldWordBreak = window.innerWidth <= 577;
    }
}
