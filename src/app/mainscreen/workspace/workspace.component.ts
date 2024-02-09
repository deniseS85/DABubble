import {
  Component,
  ElementRef,
  Renderer2,
  HostListener,
  OnInit,
  inject,
} from '@angular/core';
import {
  Firestore,
  Unsubscribe,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
} from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../models/user.class';
import { ChannelService } from '../../services/channel.service';
import { ChannelDataService } from '../../services/channel-data.service';
import { query } from 'firebase/firestore';
import { MainscreenComponent } from '../mainscreen.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { ChatService } from '../../services/chat.service';
import { SearchService } from '../../services/search-service.service';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',

  animations: [
    trigger('upDownAnimation', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('0.3s ease-in-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1 }),
        animate('0.3s ease-in-out', style({ height: 0, opacity: 0 })),
      ]),
    ]),

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
export class WorkspaceComponent implements OnInit {
  panelOpenState1 = false;
  panelOpenState2 = false;

  user = new User();
  userID: any;
  allUsers: User[] = [];
  allUsersDM: User[] = [];
  userFullName: String = '';
  highlightedUser: string | null = null;

  selectedUsers: User[] = [];
  searchQuery: string = '';

  isWorkspaceContainer: boolean = true;
  isChannelCreateWindow: boolean = false;
  isFirstScreen: boolean = true;
  isSecondScreen: boolean = false;
  isShowInputNames: boolean = false;
  isButtonDisabled: boolean = true;
  isScreenSmall: boolean = false;

  createdChannelName: string = '';
  createdChannelDescription: string = '';

  body = this.elRef.nativeElement.ownerDocument.body;
  userList;
  private unsubscribeSnapshot: Unsubscribe | undefined;

  firestore: Firestore = inject(Firestore);
  unsubUser: Unsubscribe | undefined;
  channels: any[] = [];
  chats: any[] = [];

  constructor(
    private main: MainscreenComponent,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    public channelService: ChannelService,
    public chatService: ChatService,
    public channelDataService: ChannelDataService,
    private searchservice: SearchService
  ) {
    this.userID = this.route.snapshot.paramMap.get('id');
    this.userList = this.getUserfromFirebase();
    this.loadChannels();
    this.loadChats();
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  async ngOnInit(): Promise<void> {
    if (this.userID) {
      this.checkIsGuestLogin();
    }
    this.getUserList();
    this.checkScreenSize();
    this.channelDataService.highlightUser$.subscribe((userFullName) => {
      this.highlightedUser = userFullName;
      this.highlightUserElement();
    });
  }

  ngOnDestroy() {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }
    if (this.unsubUser) {
      this.unsubUser();
    }
    if (this.userID) {
      this.checkIsGuestLogin();
    }
    this.getUserList();
  }

  /**
   * Show/hide the workspace container with the button on the left side
   */
  toggleWorkspace() {
    this.isWorkspaceContainer = !this.isWorkspaceContainer;
  }

  /**
   * Monitoring the width of the screen and set the channel create windows to mobile/desktop view
   */
  private checkScreenSize(): void {
    this.isScreenSmall = window.innerWidth < 750;
    if (this.isScreenSmall || !this.isSecondScreen) {
      this.isFirstScreen = true;
    } else {
      this.isFirstScreen = false;
    }
  }

  /**
   * Retrieve and update the user list using Firestore snapshot.
   */
  private getUserList(): void {
    this.unsubUser = onSnapshot(this.channelService.getUsersRef(), (list) => {
      this.updateAllUsersList(list);
    });
  }

  /**
   * Update the allUsers array based on the provided Firestore snapshot.
   *
   * @param {any} list - Firestore snapshot of user data.
   */
  private updateAllUsersList(list: any): void {
    this.allUsers = [];
    list.forEach((singleUser: { data: () => any; id: string }) => {
      let user = new User(singleUser.data());
      user.id = singleUser.id;
      this.allUsers.push(user);
    });
  }

  /**
   * Get the profile image path for a user.
   *
   * @param {User} user - The user object.
   * @returns {string} The profile image path.
   */
  getProfileImagePath(user: User): string {
    if (user.profileImg.startsWith('https://firebasestorage.googleapis.com')) {
      return user.profileImg;
    } else {
      return `./assets/img/${user.profileImg}`;
    }
  }

  /**
   * Get the document reference for the user.
   */
  getUserID() {
    return doc(collection(this.firestore, 'users'), this.userID);
  }

  /**
   * Retrieve user data from Firebase and update the user object.
   *
   * @returns {Promise<void>} A Promise that resolves after retrieving user data.
   */
  async getUserfromFirebase(): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'users', this.userID);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        this.user = new User(userDocSnap.data());
        this.user.id = this.userID;
        this.userFullName = `${this.user.firstname} ${this.user.lastname}`;
      }
    } catch (error) {}
  }

  /**
   * Check if the user is logged in as a guest and update user information accordingly.
   */
  checkIsGuestLogin(): void {
    getDoc(this.getUserID()).then((docSnapshot) => {
      if (docSnapshot.exists()) {
        this.getUserfromFirebase();
      } else {
        this.userFullName = 'Gast';
        this.user.profileImg = 'guest-profile.png';
      }
    });
  }

  /**
   * Retrieve and update the channel list and load only channels in which currentUser is member
   */
  /* async loadChannels() {
    const queryAllChannels = query(this.channelService.collectionRef);    

    onSnapshot(queryAllChannels, (querySnapshot) => {
      this.channels = [];
      querySnapshot.forEach((doc: any) => {
        doc.data().channelUsers.forEach((user:any) => {
          if(user.id === this.userID){
            this.channels.push(doc.data());
          } else { return }
        })        
      });
    });
  } */

  async loadChannels() {
    const queryAllChannels = await query(this.channelService.collectionRef);

    const unsub = onSnapshot(queryAllChannels, (querySnapshot) => {
      this.channels = [];
      querySnapshot.forEach((doc: any) => {
        this.channels.push(doc.data());
      });
      
      this.openChannel(this.channels[0].channelID);
      this.channelDataService.changeSelectedChannel(this.channels[0].channelname, this.channels[0].channelCreator, this.channels[0].description )
    });
  }

  /**
   * Handles the click event on selectable elements. Removes the class "selected" 
   * from all other elements and sets this class to clicked elements
   */
  handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    this.selectedChannel(target);
    const selectableElement = this.findParentElement(target);
    this.elRef.nativeElement
      .querySelectorAll('.selectable')
      .forEach((element: HTMLElement) => element.classList.remove('selected'));
    this.renderer.addClass(selectableElement, 'selected');
    this.main.chatOpen = false;
    this.main.channelOpen = true;    
  }


  /**
   * Handles the click event on selectable elements. Removes the class "selected" 
   * from all other elements and sets this class to clicked elements
   */
  handleClickChat(event: MouseEvent, userID: string): void {
    this.setChatUserID(userID)
    const target = event.target as HTMLElement;
    this.selectedChannel(target);
    const selectableElement = this.findParentElement(target);
    this.elRef.nativeElement
      .querySelectorAll('.selectable')
      .forEach((element: HTMLElement) => element.classList.remove('selected'));
    this.renderer.addClass(selectableElement, 'selected');
    this.main.chatOpen = false;
    this.main.channelOpen = false;
    setTimeout(() => {
      this.main.chatOpen = true;
    }, 50);
    }

    setChatUserID(userID: string){
      this.chatService.userID = userID;
    }


  /**
   * Getting channel name from clicked element and forward to change the selected channel
   */
  selectedChannel(target: HTMLSpanElement) {
    const selectedChannelName = (target as HTMLSpanElement).textContent;

    if (selectedChannelName) {
        const cleanedChannelName = selectedChannelName.startsWith('#') ? selectedChannelName.substring(1) : selectedChannelName;
        const selectedChannel = this.channels.find(channel => channel.channelname === cleanedChannelName);

        if (selectedChannel) {
            this.channelDataService.changeSelectedChannel(selectedChannel.channelname, selectedChannel.channelCreator, selectedChannel.channelDescription);
        }
    }
}

  /**
   * Find the parent element with the class 'selectable'.
   *
   * @param {HTMLElement} target - The target element.
   * @returns {HTMLElement | null} The parent element or null if not found.
   */
  private findParentElement(target: HTMLElement): HTMLElement | null {
    while (target && !target.classList.contains('selectable')) {
      target = target.parentElement!;
    }
    return target;
  }

  /**
   * Highligth the right user in the workspace when selecting direct-message from channel members
   */
  private highlightUserElement(): void {
    if (this.highlightedUser) {
      const userElement = this.elRef.nativeElement.querySelector(
        `[data-username="${this.highlightedUser}"]`
      );
      if (userElement) {
        userElement.classList.add('selected');
      }
    }
  }

  /**
   * Show/close the channel creation window.
   */
  openChannelCreateWindow() {
    this.isChannelCreateWindow = true;
    this.renderer.setStyle(this.body, 'overflow', 'hidden');
  }

  closeChannelCreateWindow() {
    this.isChannelCreateWindow = false;
    this.renderer.setStyle(this.body, 'overflow', 'auto');
    this.isShowInputNames = false;
    this.searchQuery = '';
    this.selectedUsers = [];
    this.isFirstScreen = true;
    this.isSecondScreen = false;
    this.createdChannelName = ''; 
    this.createdChannelDescription = ''; 
  }

  /**
   * This function updates the status of the "Erstellen" button based on whether
   * the input field is empty or not. If the input is empty, the button is disabled.
   *
   * @param {any} event - The input change event.
   * @returns {void}
   */
  onInputChange(event: any): void {
    this.isButtonDisabled = event.target.value.trim() === '';
  }

  /**
   * Show/hide the second screen of channel creation.
   */
  openChannelCreateContainer() {
    this.selectedUsers = this.allUsers;
    this.isSecondScreen = true;
    if (this.isScreenSmall) {
      this.isFirstScreen = true;
    } else {
      this.isFirstScreen = false;
    }
  }

  closeChannelCreateContainer() {
    this.isShowInputNames = false;
    this.searchQuery = '';
    this.selectedUsers = [];
    this.isFirstScreen = true;
    this.isSecondScreen = false;
  }

  /**
   * Show / Hide input names on button click.
   */
  onShowClick() {
    this.isShowInputNames = true;
    this.searchQuery = '';
    this.selectedUsers = [];
  }

  onHideClick() {
    this.isShowInputNames = false;
    this.selectedUsers = this.allUsers;
  }

  /**
   * Search input change event handler.
   *
   * @param {any} event - The input change event.
   */
  onSearchInputChange(event: any): void {
    this.searchQuery = event.target.value;
    if (this.searchQuery.trim() !== '') {
      this.filterUsers();
    }
  }

  /**
   * Filter users based on the search query.
   *
   * @returns {User[]} The filtered user array.
   */
  filterUsers(): User[] {
    const trimmedQuery = this.searchQuery.trim().toLowerCase();
    if (!trimmedQuery) {
      return this.allUsers;
    }
    return this.allUsers.filter(
      (user) =>
        user.firstname.toLowerCase().includes(trimmedQuery) ||
        user.lastname.toLowerCase().includes(trimmedQuery)
    );
  }

  /**
   * Select / Remove a user and show the selected user in the input.
   *
   * @param {User} user - The user to be selected.
   */
  selectUser(user: User): void {
    if (!this.selectedUsers.includes(user)) {
      this.selectedUsers.push(user);
      this.searchQuery = '';
    }
  }

  removeUser(user: User): void {
    this.selectedUsers = this.selectedUsers.filter((u) => u !== user);
  }

  /**
   * Setting the data to create new channel and forward data to channel creation function
   */
  async setNewChannelItems() {
    const channelname = this.createdChannelName;
    const channelDescription = this.createdChannelDescription;
    const channelUsersIDs = this.selectedUsers.map((user) => user.id);
    const channelCreatorUser = this.allUsers.find((user) => user.id === this.userID);
  
    if (channelCreatorUser) {
      const channelCreator = `${channelCreatorUser.firstname} ${channelCreatorUser.lastname}`;
  
      this.channelService.createChannel(
        channelname,
        channelDescription,
        channelUsersIDs,
        channelCreator
      );
      this.searchservice.loadChannels();
      this.closeChannelCreateWindow();
      this.createdChannelName = '';
      this.createdChannelDescription = '';
    }
  }


  /**
   * Sorting the user list to show the logged-in user on top
   * 
   * @param users - all existing users
   * @param currentUserId - id from current logged-in user
   */
  sortUsers(users: User[], currentUserId: string): User[] {
    return users.slice().sort((a, b) => {
      if (a.id === currentUserId) return -1;
      if (b.id === currentUserId) return 1;
      return (a.firstname + ' ' + a.lastname).localeCompare(
        b.firstname + ' ' + b.lastname
      );
    });
  }

  /**
   * channelwechsel --> kurzfristig in ordnung, aber nicht gut
   * @param channelID
   */
  openChannel(channelID: string) {
    this.main.channelOpen = false;
    this.main.threadOpen = false;
    this.channelDataService.channelID = channelID;

    setTimeout(() => {
      this.main.channelOpen = true;
    }, 0.02);
  }



  /**
   * lädt nur die Personen mit denen ich chatte
   */
  async loadChats(){
    const chatsRef = query(this.chatService.getChatsRef())

    onSnapshot(chatsRef, (chats) => {
      chats.forEach((chat: any) => {
       chat.data().chatUsers.forEach((user: any) =>{
        if(user.id === this.userID){
          this.chats.push(chat.data())
          
          // hier können sie namen für die DM-Liste gezogen werden
          // chat.data().chatUsers.forEach((notMe: any) => {
          //   if (notMe.id != this.userID){
          //     this.chats.push(notMe)
          //   }
          // })
        } else {
          return
        }
       })
      })
    })    
  }



  /**
   * genutzt um einmalig chats zu erstellen
   */

  // async newDMChat(){

  //   let newPair: any[] = [];    
    
  //   const allUsersQuery = query(this.channelService.getUsersRef())
   
  //   onSnapshot(allUsersQuery, (querySnapshot) => {          
          
  //         // build Array with allUsers
  //         querySnapshot.forEach((doc: any) => {
            
  //           if(this.allUsersDM.length > 0){
              
  //             this.allUsersDM.forEach((user: any) => {

  //               newPair = [];
  //               newPair.push(user, doc.data())
  //               const chatname = user.firstname + ' & ' + doc.data().firstname;
  //               const chatUsers = newPair;
                

  //             // this.chatService.createNewChat(chatname, chatUsers)
                
                
  //             })
  //           }
  //            this.allUsersDM.push(doc.data())           

  //         },
  //         );          
  //       });

  //   this.allUsersDM = []
  // }

}



