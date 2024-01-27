import { Component, EventEmitter, Output, HostListener, Input, inject, OnInit } from '@angular/core';
import { StartscreenComponent } from '../startscreen.component';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { collection, addDoc } from "firebase/firestore"; 
import { User } from '../../models/user.class';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';


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
    

    constructor(public startscreen: StartscreenComponent, private router: Router, private authService: AuthService, private storage: Storage) {}

   
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

        setTimeout(() => {
            this.showConfirmation = false;
            if (this.isGoogleLogin) {
                this.authService.setUserDetails(
                    this.userData.firstname,
                    this.userData.lastname,
                    this.userData.profileImg
                );
                this.router.navigate(['/main', docRef.id]);
                
            } else {
                this.startscreen.toggleView('login')
            }
        }, 2000);
      
    }

    getUserRef() {
        return collection(this.firestore, 'users');
    }

    uploadFiles(event: any) {
        const file = event.target.files[0];
        const imgRef = ref(this.storage, `images/${file.name}`);
      
        uploadBytes(imgRef, file).then(() => {
          getDownloadURL(imgRef).then((url) => {
            console.log(url);
            
            this.avatarSrc = url;
            this.userData = {
              ...this.userData,
              profileImg: this.avatarSrc
            };
      
            // Hier kannst du weitere Aktionen durchführen, nachdem die URL erhalten wurde
          }).catch(error => console.log(error));
        }).catch(error => console.log(error));
      }

   
/* const filePath = `uploads/${new Date().getTime()}_${fileUpload.file?.name}`;
        const fileRef = this.storage.ref(filePath);
        const uploadTask = this.storage.upload(filePath, fileUpload.file);
        const snapshot = await lastValueFrom(uploadTask.snapshotChanges());

        if (snapshot?.state === 'success') {
            fileUpload.name = fileUpload.file.name;
            fileUpload.path = filePath;
            const updatedFileUpload = await this.getDownloadURL(fileRef, fileUpload);
            return updatedFileUpload;
        } else {
            throw new Error('File upload failed');
        }
      } catch (error) {
          throw error;
      }
      
      
      deleteFile(filePath: string) {
      const fileRef = this.storage.ref(filePath);
      try {
          fileRef.delete();
      } catch (error) {
          throw error;
      }
  }*/
    
}
