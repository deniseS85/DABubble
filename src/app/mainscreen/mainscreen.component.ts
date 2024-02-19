import { Component, ElementRef, HostListener, OnInit, ViewChild, inject } from '@angular/core';
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
import { ChannelChatComponent } from './channel-chat/channel-chat.component';

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
export class MainscreenComponent implements OnInit/* , AfterViewInit  */ {
    @ViewChild(WorkspaceComponent) workspaceComponent!: WorkspaceComponent;
    @ViewChild(ChannelChatComponent) channelChatComponent!: ChannelChatComponent;
    @ViewChild('inputEmail') inputEmail!: ElementRef;
    firestore: Firestore = inject(Firestore);
    user = new User();
    workspaceOpen: boolean = true;
    channelOpen: boolean = true;
    threadOpen: boolean = false;
    chatOpen: boolean = false;
    onlyThread: boolean = false;
    closeChannel: boolean = false;
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
    searchChannel: string = '';
    isInputFilled: boolean = false;
    searchResults: { channels: Channel[], users: User[], messages: Message[] } = { channels: [], users: [], messages: [] };
    selectedUser: User = new User();
    userProfileView: User = new User();
    showProfil = false;
    editThread: boolean = false;
    allChannels: Channel[] = [];
    messageID: string = '';
    newMessageOpen: boolean = false;
    loading = false;

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
        if (window.innerWidth < 750) {
            this.isMobileScreen = true;
            this.allChatSectionsOpen = false;
        } else {
            this.isMobileScreen = false;
            this.allChatSectionsOpen = true;
            if (this.threadOpen) {
                this.channelOpen = true;
            }
        }
    }

    /**
     * if size <1450px, close channel if thread is open
     */
    checkMidSize1450() {
        if (window.innerWidth < 1450) {
            this.onlyThread = true;
        } else {
            this.onlyThread = false;
        }
    }

    /**
     * if size <1050px, close workspace if thread is open
     */
    checkSmallSize() {
        if (window.innerWidth < 1050) {
            this.workspaceOpen = false;
        } else {
            this.workspaceOpen = true;
        }
    }


    @HostListener('window:resize', ['$event'])
    onResize(event: Event): void {
        this.screenWidth = window.innerWidth;
        this.checkMobileScreen();
        this.checkMidSize1450();
        this.checkSmallSize();
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
        try {
            let [firstName, lastName] = this.userFullName.split(' ');
            this.user.firstname = firstName;
            this.user.lastname = lastName;
            this.loading = true;

            if (this.selectedAvatarNr !== null && this.selectedAvatarNr !== undefined) {
                this.checkProfileImage();
            }
            const newEmail = this.inputEmail.nativeElement.value.trim();
            
            if (newEmail.length > 0) {
                this.user.email = newEmail;
                this.emailChanged = true;
            }
            await this.updateData();
            this.handleUserChangeCompletion();
           
        } catch (error) { }
    }

    async updateData() {
        let updatedData = { ...this.user.toUserJson() };
        await updateDoc(this.getUserID(), updatedData);
        this.userservice.setUserData(updatedData);
        this.updateUserNameInLocalStorage();
    }

    

    /* async changeNewMail() {
        try {
            await this.authService.updateAndVerifyEmail(this.user.email);
            this.emailChanged = true;
        } catch (error) {
            console.error('Fehler bei der E-Mail-Verifizierung oder Aktualisierung:', error);
        } finally {
            this.emailChanged = false;
        }
    
    } */

    async checkProfileImage() {
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

    handleUserChangeCompletion() {
        setTimeout(() => {
            this.closeEditUser();
            this.closeUserInfo();
            this.isProfileMenuOpen = false;
            this.emailChanged = false;
            this.loading = false;
        }, 3000);
    }

    extractFileNameFromPath(path: string): string {
        let pathArray = path.split('%2F');
        let fileNameWithToken = pathArray[pathArray.length - 1];
        return fileNameWithToken.split('?')[0];
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
        let trimmedInput = this.searchInput.trim() || this.searchChannel.trim();

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
            if(trimmedInput = this.searchInput.trim()) {
                this.filterMessages(trimmedInput, allMessages, allUsers);
            }
            
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
   
   
    searchfieldShowUser(user: User): void {
        const dialogRef = this.dialog.open(UserProfileCardComponent, {
            data: { user: user, chatOpen: { chatID: null, isOpen: false }, channelOpen: this.channelOpen, userID: this.userID }
        });

        this.searchInput = '';
        this.closeSearch();
        this.workspaceComponent.channelService.removeSelectedChannels();
        this.chatOpen = false;

        if (!this.chatOpen) {
            this.channelOpen = true;
        }

        dialogRef.afterClosed().subscribe(result => {
            this.handleChatAndChannelIsOpen(result);
        });
    }

    private handleChatAndChannelIsOpen(result: any) {
        if (result && result.chatOpen) {
            if (this.isMobileScreen && !this.chatOpen) {
                this.chatOpen = true;
                this.workspaceOpen = false;
            } else {
                this.chatOpen = result.chatOpen;
                this.channelOpen = true;
            }
        } else {
            this.channelOpen = true;
        }

        if (result && result.channelOpen !== undefined) {
            this.channelOpen = result.channelOpen;
        }

        if (!this.chatOpen) {
            this.workspaceOpen = true;
        }
    }
    
    async searchfieldShowMessage(message: any): Promise<void> {
        const messageID = message.messageID;
        const allMessages = await this.channelservice.getAllMessages();
        const foundMessage = await allMessages.find((msg: any) => msg.messageID === messageID);

        if (foundMessage && foundMessage.channelID) {
            this.openChannel(foundMessage.channelID);
            this.findChannelFromMessage(foundMessage.channelID);
            this.messageID = messageID;
            setTimeout(() => {
                if (window.innerWidth <= 1450 && this.channelChatComponent) {
                    this.channelChatComponent.scrollToMessage(this.messageID);
                }
            }, 400);
            if (window.innerWidth < 1050) {
                this.workspaceOpen = false;
            }
        } else {
            console.error('Nachricht mit der ID ' + messageID + ' gefunden, aber keine gültige channelID vorhanden.');
        }
    }


    async findChannelFromMessage(channelID: string): Promise<void> {
        const allChannels = await this.channelservice.getAllChannels();
        const foundChannel: Channel = await allChannels.find((channel: Channel) => channel.channelID === channelID)
        this.searchfieldShowChannel(null, foundChannel);
    }

    searchfieldShowChannel(event: MouseEvent | null, channel: Channel) {
        this.openChannel(channel.channelID);
        this.searchInput = '';
        this.closeSearch();
        if (this.workspaceComponent) {
            this.workspaceComponent.handleClickChannel(event, channel);
        }
    }

    openChannel(channelID: string): void {
        this.channelOpen = false;
        this.threadOpen = false;
        this.channelDataService.updateChannelInfo(channelID);

        setTimeout(() => {
            this.channelOpen = true;
        }, 20);
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
