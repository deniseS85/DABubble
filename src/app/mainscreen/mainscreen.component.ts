import { Component, ElementRef, HostListener, Input, OnInit, ViewChild, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../models/user.class';
import { Firestore, Unsubscribe, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { collection, onSnapshot } from 'firebase/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Channel } from '../models/channel.class';
import { UserService } from '../services/user.service';
import { ChannelDataService } from '../services/channel-data.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { UserProfileCardComponent } from './user-profile-card/user-profile-card.component';
import { MatDialog } from '@angular/material/dialog';
import { ChannelService } from '../services/channel.service';
import { Message } from '../models/message.interface';
import { DomSanitizer } from '@angular/platform-browser';
import { WorkspaceComponent } from './workspace/workspace.component';

@Component({
    selector: 'app-mainscreen',
    templateUrl: './mainscreen.component.html',
    styleUrl: './mainscreen.component.scss',

    animations: [
        trigger('leftRightAnimation', [
            transition(':enter', [
                style({ width: 0, opacity: 0 }),
                animate('0.3s ease-in-out', style({ width: '*', opacity: 1 })),
            ]),
            transition(':leave', [
                style({ width: '*', opacity: 1 }),
                animate('0.3s ease-in-out', style({ width: 0, opacity: 0 })),
            ]),
        ]),

    ],
})
export class MainscreenComponent implements OnInit {
    @ViewChild(WorkspaceComponent) workspaceComponent!: WorkspaceComponent;

    firestore: Firestore = inject(Firestore);
    user = new User();
    workspaceOpen: boolean = true;
    channelOpen: boolean = true;
    threadOpen: boolean = false;
    chatOpen: boolean = false;
    allChatSectionsOpen: boolean = true;
    isMobileScreen: boolean = false;
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
    searchResults: { channels: Channel[], users: User[], messages: Message[] } = { channels: [], users: [], messages: [] };
    selectedUser: User = new User();
    userProfileView: User = new User();
    showProfil = false;
    editThread: boolean = false;
    allChannels: Channel[] = [];


    constructor(
        public authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private storage: Storage,
        private snackBar: MatSnackBar,
        private userservice: UserService,
        private channelDataService: ChannelDataService,
        public dialog: MatDialog,
        private channelservice: ChannelService,
        private sanitizer: DomSanitizer) {
        this.userID = this.route.snapshot.paramMap.get('id');
        this.userList = this.getUserfromFirebase();
        this.checkMobileScreen();
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

    checkMobileScreen() {
            if(window.innerWidth < 750) {
                this.isMobileScreen = true;
                this.allChatSectionsOpen = false;
            } else {
                this.isMobileScreen = false;
                this.allChatSectionsOpen = true;
            }
    }


    @HostListener('window:resize', ['$event'])
    onResize(event: Event): void {
        this.screenWidth = window.innerWidth;
        this.checkMobileScreen();
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

    getProfileImagePathSearch(user: any): string {
        if (user && user.profileImg) {
            if (user.profileImg.startsWith('https://firebasestorage.googleapis.com')) {
                return user.profileImg;
            } else {
                return `./assets/img/${user.profileImg}`;
            }
        } else {
            return '';
        }
    }

    ngOnDestroy() {
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
        } catch (error) { }
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
        } catch (error) { }
    }

    extractFileNameFromPath(path: string): string {
        let pathArray = path.split('%2F');
        let fileNameWithToken = pathArray[pathArray.length - 1];
        return fileNameWithToken.split('?')[0];
    }

    async updateData() {
        let updatedData = { ...this.user.toUserJson() };
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

    async search(): Promise<void> {
        let allMessages = await this.channelservice.getAllMessages();
        let allChannels = await this.channelservice.getAllChannels();
        let allUsers = await this.userservice.getAllUsers();
        let trimmedInput = this.searchInput.trim();

        this.allChannels = allChannels;
        this.searchResults.channels = [];
        this.searchResults.users = [];
        this.searchResults.messages = [];

        if (!trimmedInput) {
            this.isInputFilled = false;
            return;
        }

        if (trimmedInput.startsWith('@')) {
            this.filterUsers(trimmedInput, allUsers);
        } else if (trimmedInput.startsWith('#')) {
            this.filterChannels(trimmedInput, allChannels);
        } else if (/^[a-zA-Z]+$/.test(trimmedInput) && trimmedInput.length >= 2) {
            this.filterMessages(trimmedInput, allMessages, allUsers);
        }
        this.isInputFilled = true;
    }

    private async filterUsers(query: string, allUsers: any[]): Promise<void> {
        this.searchResults.users = allUsers.filter(user =>
            user && user.firstname && user.lastname &&
            (user.firstname.toLowerCase().includes(query.slice(1).toLowerCase()) ||
                user.lastname.toLowerCase().includes(query.slice(1).toLowerCase()))
        );
    }

    private async filterChannels(query: string, allChannels: any[]): Promise<void> {
        this.searchResults.channels = allChannels.filter(channel =>
            channel && channel.channelname && channel.channelname.toLowerCase().includes(query.slice(1).toLowerCase())
        );
    }

    private filterMessages(query: string, allMessages: any[], allUsers: any[]): void {
        let matchingMessages = allMessages.filter(message =>
            message && message.messagetext && message.messagetext.toLowerCase().includes(query.toLowerCase())
        );
        this.searchResults.messages = matchingMessages.map(message => {
            let highlightedText = message.messagetext.replace(new RegExp(`(${query})`, 'gi'), (match: string) => `<span style="background-color: lightgrey">${match}</span>`);
            let user = this.userservice.getUserById(allUsers, message.messageUserID);

            return { ...message, highlightedText: this.sanitizer.bypassSecurityTrustHtml(highlightedText), user };
        });
    }






    /* erster user directMessage, von chat neuer user suchen, neuer chat öffnet sich nicht */
    searchfieldShowUser(user: User): void {
        const dialogRef = this.dialog.open(UserProfileCardComponent, {
            data: { user: user, chatOpen: this.chatOpen, channelOpen: this.channelOpen }
        });

        this.searchInput = '';
        this.closeSearch();

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.chatOpen) {
                this.chatOpen = result.chatOpen;
            }

            if (result && result.channelOpen !== undefined) {
                this.channelOpen = result.channelOpen;
            }
        });
    }




    searchfieldShowMessage(message: any) { }








    // Funktion, um das Benutzerprofil in der Kindkomponente anzuzeigen
    /*  setUserProfileView(user: User): void {
       this.userProfileView = user;
     } */

    searchfieldShowChannel(event: MouseEvent, channel: Channel) {
        this.openChannel(channel.channelID);
        this.searchInput = '';
        this.closeSearch();
    }

    /*   showUserProfileView(user: User): void {
        console.log('Benutzerprofil anzeigen:', user);
      }    */

    openChannel(channelID: string): void {
        this.channelOpen = false;
        this.threadOpen = false;
        this.channelDataService.updateChannelInfo(channelID);

        setTimeout(() => {
            this.channelOpen = true;
        }, 0.02);
    }

    closeSearch() {
        this.isInputFilled = false;
    }

    /**
    * Show/hide the workspace container with the button on the left side
    */
    toggleWorkspace() {
        this.workspaceOpen = !this.workspaceOpen;
    }

    openWorkspaceMobile() {
        this.allChatSectionsOpen = false;
        this.workspaceOpen = true;
    }    

}
