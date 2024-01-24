import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../models/user.class';
import { Firestore, Unsubscribe, doc, updateDoc } from '@angular/fire/firestore';
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
    userImg: String = '';
    userEmail: String = '';
    isProfileMenuOpen: boolean = false;
    isProfileInfoOpen: boolean = false;
    isEditMode: boolean = false;
    userID: any;
    userList;
    private unsubscribeSnapshot: Unsubscribe | undefined;

    constructor(public authService: AuthService, private router: Router, private route: ActivatedRoute) {
            this.userID = this.route.snapshot.paramMap.get('id');
            this.userList = this.getUserfromFirebase();
    }

    ngOnInit(): void {
        this.authService.restoreUserData();

        if (this.authService.isUserAnonymous()) {
            this.userFirstName = 'Gast';
            this.userLastName = '';
            this.userImg = 'guest-profile.png';
        }
        this.userFirstName = this.authService.getUserFirstName();
        this.userLastName = this.authService.getUserLastName();
        this.userImg = this.authService.getUserImg();
    }

    ngOnDestroy(){
        if (this.unsubscribeSnapshot) {
            this.unsubscribeSnapshot();
        }
    }

    getUserID() {
        return doc(collection(this.firestore, 'users'), this.userID);
    }

    getUserfromFirebase(): void {
        if (this.userID) {
            this.unsubscribeSnapshot = onSnapshot(this.getUserID(), (element) => {
            this.user = new User(element.data());
            this.user.id = this.userID;
            this.userFullName = `${this.user.firstname} ${this.user.lastname}`;
          });
        }
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/']); 
    }

    toggleProfileMenu() {
        this.isProfileMenuOpen = !this.isProfileMenuOpen;
    }

    openUserInfo() {
        this.isProfileInfoOpen = true;
        this.isEditMode = false;
        this.userEmail = this.getUserEmail();
    }

    closeUserInfo() {
        this.isProfileInfoOpen = false;
        this.isProfileInfoOpen = false;
    }

    openEditUser() {
        this.isEditMode = true;
        this.isProfileInfoOpen = false;
    }

    closeEditUser() {
        this.isEditMode = false;
        this.isProfileInfoOpen = false;
    }

    getUserEmail() {
        let currentUser = this.authService.auth.currentUser;
        return currentUser?.email || 'E-Mail nicht vorhanden';
    }

    async saveUserChange() {
        let updatedData = this.user.toJson();
        await updateDoc(this.getUserID(), updatedData);
        this.authService.setUserData(updatedData);
        this.updateUserNameInLocalStorage();
        this.closeEditUser();
        this.closeUserInfo();
    } 

    updateUserNameInLocalStorage() {
          localStorage.setItem('userFirstName', this.user.firstname);
          localStorage.setItem('userLastName', this.user.lastname);
    }

}
