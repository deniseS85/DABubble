import { Component, ElementRef, HostListener, OnInit, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../models/user.class';
import { Firestore, Unsubscribe, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { collection, onSnapshot } from 'firebase/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SearchService } from '../services/search-service.service';
import { Channel } from '../models/channel.class';
import { UserService } from '../services/user.service';



@Component({
  selector: 'app-mainscreen',
  templateUrl: './mainscreen.component.html',
  styleUrl: './mainscreen.component.scss'
})
export class MainscreenComponent implements OnInit {
    firestore: Firestore = inject(Firestore);
    user = new User();
    threadOpen: boolean =  false;
    channelOpen: boolean = true;
    chatOpen: boolean = false;
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
    selectedAvatarNr!: number | string | null;
    emailChanged: boolean = false;
    screenWidth: number = window.innerWidth;
    isProfileHovered: boolean = false;
    isLogoutHovered: boolean = false;
    searchInput: string = '';
    isInputFilled: boolean = false;
    searchResults: { channels: Channel[], users: User[] } = { channels: [], users: [] };
    selectedUser: User = new User();
    userProfileView: User = new User();

    constructor(
        public authService: AuthService, 
        private router: Router, 
        private route: ActivatedRoute, 
        private storage: Storage, 
        private snackBar: MatSnackBar,
        private searchService: SearchService,
        private userservice: UserService) {
            this.userID = this.route.snapshot.paramMap.get('id');
            this.userList = this.getUserfromFirebase();       
    }

    ngOnInit(): void {
        if (this.userID) {
            this.checkIsGuestLogin();
            this.subscribeToUserChanges(); 
        }
    }

    private subscribeToUserChanges(): void {
        const userDocRef = doc(this.firestore, 'users', this.userID);
    
        this.unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                this.user = new User(doc.data());
                this.user.id = this.userID;
                this.userFullName = `${this.user.firstname} ${this.user.lastname}`;
                this.userIsOnline = this.user.isOnline;
            }
        });
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: Event): void {
        this.screenWidth = window.innerWidth;
    }


    getProfileImagePath(): string {
        if (this.selectedAvatarNr !== null && this.selectedAvatarNr !== undefined) {
            if (typeof this.selectedAvatarNr === 'string' && this.selectedAvatarNr.startsWith('https')) {
                return this.selectedAvatarNr;
            } else {
                return `./assets/img/avatar${this.selectedAvatarNr}.png`;
            }
        } else if (this.user.profileImg.startsWith('https://firebasestorage.googleapis.com')) {
            return this.user.profileImg;
        } else {
            return `./assets/img/${this.user.profileImg}`;
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
            this.userIsOnline = this.user.isOnline;
            
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
                this.userIsOnline = true;
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

    openUserInfoResponsiv() {
        if (window.innerWidth < 750) {
            this.toggleProfileMenu();
        }
    }

    closeUserInfo() {
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
        this.isChangeImagePopupOpen = false;
    }

    async saveUserChange() {
        let [firstName, lastName] = this.userFullName.split(' ');
        this.user.firstname = firstName;
        this.user.lastname = lastName;

        if (this.selectedAvatarNr !== null && this.selectedAvatarNr !== undefined) {
            if (typeof this.selectedAvatarNr === 'string' && this.selectedAvatarNr.startsWith('https')) {
                this.user.profileImg = this.selectedAvatarNr;
            } else {
                let oldFileName = this.extractFileNameFromPath(this.user.profileImg);
                if (this.user.profileImg.startsWith('https')) {
                    let oldImgRef = ref(this.storage, `images/${oldFileName}`);
                    await deleteObject(oldImgRef);
                  }
                this.user.profileImg = `avatar${this.selectedAvatarNr}.png`;
            }
        }
        try {
            await this.updateData();
            this.closeEditUser();
                this.closeUserInfo();
                this.isProfileMenuOpen = false;
           /*  setTimeout(() => {
                this.closeEditUser();
                this.closeUserInfo();
                this.isProfileMenuOpen = false;
                this.emailChanged = false;
            }, 3000); */
        } catch (error) {}
    }

    extractFileNameFromPath(path: string): string {
        let pathArray = path.split('%2F');
        let fileNameWithToken = pathArray[pathArray.length - 1];
        return fileNameWithToken.split('?')[0];
    }

    async updateData() {
        let updatedData = { ...this.user.toUserJson()};
       /*  this.authService.updateAndVerifyEmail(this.user.email);
        this.emailChanged = true; */
        await updateDoc(this.getUserID(), updatedData);
        this.userservice.setUserData(updatedData);
        this.updateUserNameInLocalStorage();
    }

    updateUserNameInLocalStorage() {
          localStorage.setItem('userFirstName', this.user.firstname);
          localStorage.setItem('userLastName', this.user.lastname);
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
        this.selectedAvatarNr = avatarNr;
        this.isChooseAvatarOpen = false;
    }

    async uploadFiles(event: any) {
        this.isChangeImagePopupOpen = false;
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
            this.selectedAvatarNr = url;
        
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

    search(): void {
        const [matchingChannels, matchingUsers] = this.searchService.search(this.searchInput);
        this.searchResults.channels = matchingChannels;
        this.searchResults.users = matchingUsers;
        this.isInputFilled = this.searchInput !== '';
      }

      searchfieldShowUser(user: User): void {
        // Übergebe den ausgewählten Benutzer an die Kindkomponente
        this.setUserProfileView(user);
      }
    
      // Funktion, um das Benutzerprofil in der Kindkomponente anzuzeigen
      setUserProfileView(user: User): void {
        this.userProfileView = user;
      }

      searchfieldShowChannel(channel: Channel) {
        console.log(channel);
      } 

      showUserProfileView(user: User): void {
        console.log('Benutzerprofil anzeigen:', user);
      }             
}
