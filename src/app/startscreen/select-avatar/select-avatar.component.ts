import { Component, EventEmitter, Output, HostListener, Input, inject } from '@angular/core';
import { StartscreenComponent } from '../startscreen.component';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { collection, addDoc } from "firebase/firestore"; 
import { User } from '../../models/user.class';

@Component({
  selector: 'app-select-avatar',
  templateUrl: './select-avatar.component.html',
  styleUrl: './select-avatar.component.scss'
})
export class SelectAvatarComponent {
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

    constructor(public startscreen: StartscreenComponent) {}

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
    }

    async addNewUser() {
        this.showConfirmation = true;
       
        let updatedUserData = {
            ...this.userData,
            profileImg: this.avatarSrc,
            id: ''
        };
       
        let docRef = await addDoc(this.getUserRef(), updatedUserData);
        await updateDoc(doc(this.getUserRef(), docRef.id), { id: docRef.id });
        this.showConfirmation = true;

        setTimeout(() => {
            this.showConfirmation = false;
            this.startscreen.toggleView('login')
        }, 3000);
      
    }

    getUserRef() {
        return collection(this.firestore, 'users');
    }
}
