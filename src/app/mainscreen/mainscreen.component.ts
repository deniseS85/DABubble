import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../models/user.class';
import { Firestore, Unsubscribe, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { collection, onSnapshot } from 'firebase/firestore';

@Component({
  selector: 'app-mainscreen',
  templateUrl: './mainscreen.component.html',
  styleUrl: './mainscreen.component.scss'
})
export class MainscreenComponent implements OnInit {
    firestore: Firestore = inject(Firestore);
    user = new User();
    threadOpen: boolean =  true;
    userFirstName: String = '';
    userLastName: String = '';
    userFullName: String = '';
    isProfileMenuOpen: boolean = false;
    isProfileInfoOpen: boolean = false;
    isEditMode: boolean = false;
    editedUserFullName: String = '';
    userID: any;
    userList;
    private unsubscribeSnapshot: Unsubscribe | undefined;
    userIsOnline: boolean = false;
    isChangeImagePopupOpen: boolean = false;
    isChooseAvatarOpen: boolean = false;
    selectedAvatar: string = '';



   /*  @Output() emojiSelectedEvent = new EventEmitter<string>(); */

    constructor(public authService: AuthService, private router: Router, private route: ActivatedRoute) {
            this.userID = this.route.snapshot.paramMap.get('id');
            this.userList = this.getUserfromFirebase();
    }

   /*  emojiSelected(event: any) {
        this.emojiSelectedEvent.emit(event.emoji.native);
      }
 */
    ngOnInit(): void {
        if (this.userID) {
            this.checkIsGuestLogin();
        }
    }

    getProfileImagePath(): string {
        if (this.selectedAvatar) {
            return this.selectedAvatar;
        } else {
            if (this.user.profileImg.startsWith('https://firebasestorage.googleapis.com')) {
                return this.user.profileImg;
            } else {
                return `./assets/img/${this.user.profileImg}`;
            }
        }
    }


    ngOnDestroy(){
        if (this.unsubscribeSnapshot) {
            this.unsubscribeSnapshot();
        }
    }

    getUserID() {
        return doc(collection(this.firestore, 'users'), this.userID);
    }

    async getUserfromFirebase(): Promise<void> {
        try {
          const userDocRef = doc(this.firestore, 'users', this.userID);
          const userDocSnap = await getDoc(userDocRef);
    
          if (userDocSnap.exists()) {
            this.user = new User(userDocSnap.data());
            this.user.id = this.userID;
            this.userFullName = `${this.user.firstname} ${this.user.lastname}`;
            this.userIsOnline = await this.authService.getOnlineStatus(this.userID);
          }
        } catch (error) {}
      }
    

    checkIsGuestLogin(): void {
        getDoc(this.getUserID()).then((docSnapshot) => {
            if (docSnapshot.exists()) {
                this.getUserfromFirebase();
            } else {
                this.userFullName = 'Gast';
                this.user.profileImg = 'guest-profile.png';
                this.user.email = 'E-Mail-Adresse nicht vorhanden.'
            }
        });
    }

    logout(userId: string) {
        this.authService.logout(userId);
        this.router.navigate(['/']); 
    }

    toggleProfileMenu() {
        this.isProfileMenuOpen = !this.isProfileMenuOpen;
    }

    openUserInfo() {
        this.isProfileInfoOpen = true;
        this.isEditMode = false;
    }

    closeUserInfo() {
        this.isProfileInfoOpen = false;
        this.isProfileInfoOpen = false;
    }

    openEditUser() {
        this.editedUserFullName = this.userFullName;
        this.isEditMode = true;
        this.isProfileInfoOpen = false;
    }

    closeEditUser() {
        this.isEditMode = false;
        this.isProfileInfoOpen = false;
    }

    async saveUserChange() {
        let [firstName, lastName] = this.userFullName.split(' ');
        this.user.firstname = firstName;
        this.user.lastname = lastName;
    
        try {
            let updatedData = { ...this.user.toUserJson(), profileImg: this.selectedAvatar };
            updatedData.profileImg = this.selectedAvatar?.replace('./assets/img/', '');
            await updateDoc(this.getUserID(), updatedData);
            await this.changeEmailInAuth(this.user.email);

            this.authService.setUserData(updatedData);
            this.updateUserNameInLocalStorage();
            this.closeEditUser();
            this.closeUserInfo();
            this.isProfileMenuOpen = false;
        } catch (error) {}
    }

    updateUserNameInLocalStorage() {
          localStorage.setItem('userFirstName', this.user.firstname);
          localStorage.setItem('userLastName', this.user.lastname);
    }

    async changeEmailInAuth(newEmail: any) {
        try {
          this.authService.updateAndVerifyEmail(newEmail);
        } catch (error) {}
    }

    toggleChangeImagePopup() {
        this.isChangeImagePopupOpen = !this.isChangeImagePopupOpen;
    }

    openAvatar() {
        this.isChooseAvatarOpen = true;
        this.isChangeImagePopupOpen = false;
    }

    closeAvatar() {
        this.isChooseAvatarOpen = false;
    }

    selectAvatar(avatarNr: number) {
        this.selectedAvatar = `./assets/img/avatar${avatarNr}.png`;
        this.isChooseAvatarOpen = false;
    }

    openUploadImage() {

    }


}
