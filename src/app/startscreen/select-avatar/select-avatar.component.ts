import { Component, EventEmitter, Output, HostListener, Input, inject, OnInit } from '@angular/core';
import { StartscreenComponent } from '../startscreen.component';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { collection, addDoc } from "firebase/firestore"; 
import { User } from '../../models/user.class';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-select-avatar',
  templateUrl: './select-avatar.component.html',
  styleUrl: './select-avatar.component.scss'
})
export class SelectAvatarComponent implements OnInit {
    @Output() backToSignup = new EventEmitter<void>();
    @Output() openImprint = new EventEmitter<void>(); 
    @Output() openPrivacy = new EventEmitter<void>(); 
    @Input() userData: any = {};
    shouldWordBreak: boolean = window.innerWidth <= 577;
    hideElement: boolean = window.innerWidth <= 950;
    avatarSrc = './assets/img/profile.png';
    showConfirmation: boolean = false;
    firestore: Firestore = inject(Firestore);
    user = new User();
    isGoogleLogin: boolean = false;

    constructor(public startscreen: StartscreenComponent, private router: Router, private authService: AuthService) {}

   
    ngOnInit() {
        this.authService.isGoogleLogin$.subscribe(status => {
          this.isGoogleLogin = status;
        });
    }

    toggleAvatar() {
        this.startscreen.toggleView('signup');
    }

    @HostListener('window:resize', ['$event'])
      onResize(event: Event): void {
        this.shouldWordBreak = window.innerWidth <= 577;
        this.hideElement = window.innerWidth <= 950;
    }

    selectAvatar(avatarNr: number) {
        this.avatarSrc = `./assets/img/avatar${avatarNr}.png`;
        let profileImg = `avatar${avatarNr}.png`;
        this.userData = {
          ...this.userData,
          profileImg: profileImg
      };
    }

    async addNewUser() {
        this.showConfirmation = true;
       
        let updatedUserData = {
            ...this.userData,
            id: ''
        };
       
        let docRef = await addDoc(this.getUserRef(), updatedUserData);
        await updateDoc(doc(this.getUserRef(), docRef.id), { id: docRef.id });
        this.router.navigate(['/main', docRef.id]);

        setTimeout(() => {
            this.showConfirmation = false;
            if (this.isGoogleLogin) {
                this.authService.setUserDetails(
                    this.userData.firstname,
                    this.userData.lastname,
                    this.userData.profileImg
                );
                
            } else {
                this.startscreen.toggleView('login')
            }
        }, 2000);
      
    }

    getUserRef() {
        return collection(this.firestore, 'users');
    }
}
