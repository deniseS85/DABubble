import { Component, EventEmitter, Output, HostListener, Input, inject, OnInit } from '@angular/core';
import { StartscreenComponent } from '../startscreen.component';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { collection, addDoc } from "firebase/firestore"; 
import { User } from '../../models/user.class';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Storage, ref, uploadBytes, getDownloadURL, getMetadata } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';
import { ChatService } from '../../services/chat.service';


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
    isSelectAvatar: boolean = false;
    isUploadedImage: boolean = false;
    firestore: Firestore = inject(Firestore);
    user = new User();
    isGoogleLogin: boolean = false;

    constructor(
      public startscreen: StartscreenComponent, 
      private router: Router, 
      private authService: AuthService, 
      private userservice: UserService, 
      private storage: Storage, 
      private snackBar: MatSnackBar,
      private chatService: ChatService) {}

   
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
        this.isSelectAvatar = true;
        this.avatarSrc = `./assets/img/avatar${avatarNr}.png`;
        let profileImg = `avatar${avatarNr}.png`;
        this.userData = {
          ...this.userData,
          profileImg: profileImg
      };
    }

    async addNewUser() {
        this.showConfirmation = true;

        if (!this.isSelectAvatar && !this.isUploadedImage) {
            this.avatarSrc = './assets/img/guest-profile.png';
            this.userData = {
                ...this.userData,
                profileImg: 'guest-profile.png'
            };
        } 
  
        let updatedUserData = {
            ...this.userData,
            id: ''
        };
       
        let docRef = await addDoc(this.getUserRef(), updatedUserData);
        await updateDoc(doc(this.getUserRef(), docRef.id), { id: docRef.id });

        this.chatService.createChatsForNewUser(updatedUserData, docRef.id)

        setTimeout(() => {
            this.showConfirmation = false;
            if (this.isGoogleLogin) {
                this.userservice.setUserDetails(
                    this.userData.firstname,
                    this.userData.lastname,
                    this.userData.profileImg
                );
                this.router.navigate(['/main', docRef.id]);
                
            } else {
                this.startscreen.toggleView('login');
                window.location.reload()
            }
        }, 2000);
        
    }

    getUserRef() {
        return collection(this.firestore, 'users');
    }

    async uploadFiles(event: any) {
        let files = event.target.files;
      
        if (!files || files.length === 0) {
          return;
        }
      
        let file = files[0];
      
        if (!(await this.isValidFile(file))) {
          return;
        }
      
        let timestamp = new Date().getTime();
        let imgRef = ref(this.storage, `images/${timestamp}_${file.name}`);
      
        uploadBytes(imgRef, file).then(async () => {
            let url = await getDownloadURL(imgRef);
            this.avatarSrc = url;
            this.userData = {
                ...this.userData,
                profileImg: this.avatarSrc
            };
            this.isUploadedImage = true;
        });
    }

    async isValidFile(file: File): Promise<boolean> {
        if (file.size > 500000) {
          this.showSnackbar('Error: Sorry, your file is too large.');
          return false;
        }
      
        let allowedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
        if (!allowedFormats.includes(file.type)) {
          this.showSnackbar('Error: Invalid file format. Please upload a JPEG, PNG, GIF, JPG.');
          return false;
        }
      
        return true;
    }

    showSnackbar(message: string): void {
        this.snackBar.open(message, 'Close', {
          duration: 3000,
        });
    }
    
}
