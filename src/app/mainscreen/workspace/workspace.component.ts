import { Component, ElementRef, Renderer2, HostListener, inject } from '@angular/core';
import { Firestore, Unsubscribe, collection, doc, getDoc, onSnapshot } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../models/user.class';
import { ChannelService } from '../../services/channel.service';
import { ChannelDataService } from '../../services/channel-data.service';
import { query } from 'firebase/firestore';
import { MainscreenComponent } from '../mainscreen.component';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',

  animations: [
    trigger('upDownAnimation', [
        transition(':enter', [
            style({ height: 0, opacity: 0 }),
            animate('0.3s ease-in-out', 
                    style({ height: '*', opacity: 1 }))
          ]
        ),
        transition(':leave', [
            style({ height: '*', opacity: 1 }),
            animate('0.3s ease-in-out', 
                    style({ height: 0, opacity: 0 }))
          ]
        )
      ]),
    
    trigger('leftRightAnimation', [
      transition(':enter', [
        style({ width: 0, opacity: 0 }),
        animate('0.3s ease-in-out', 
        style({ width: '*', opacity: 1 }))
      ]
      ),
      transition(':leave', [
        style({ width: '*', opacity: 1 }),
        animate('0.3s ease-in-out', 
        style({ width: 0, opacity: 0 }))
      ]
      )
    ]),
  ],
})
export class WorkspaceComponent {
  panelOpenState1 = false;
  panelOpenState2 = false;

  user = new User();
  userID: any;
  allUsers: User[] = [];
  userFullName: String = '';

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

  constructor(
    private main: MainscreenComponent,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    public channelService: ChannelService,
    public channelDataService: ChannelDataService
  ) {
    this.userID = this.route.snapshot.paramMap.get('id');
    this.userList = this.getUserfromFirebase();
    this.loadChannels()
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
    // await this.getAllChannel();
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

  toggleWorkspace() {
    this.isWorkspaceContainer = !this.isWorkspaceContainer;
  }

  /**
   * Monitoring the width of the screen and set the channel create windows to mobile/desktop view
   */
  private checkScreenSize(): void {
    this.isScreenSmall = window.innerWidth < 700;
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
   * Retrieve and update the channel list.
   * auskommentiert von Klemens
   * @returns {Promise<void>} A Promise that resolves after retrieving the channel list.
   */
  // private async getAllChannel(): Promise<void> {
  //   await this.getChannelList();
  // }

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
    } catch (error) { }
  }

  /**
   * Retrieve and update the channel list.
   * auskommentiert von Klemens --> neueFunktion darunter
   * @returns {Promise<void>} A Promise that resolves after retrieving the channel list.
   */
  // async getChannelList(): Promise<void> {
  //   this.channels = await this.channelService.getAllChannels();
  //   console.log('Channels:', this.channels);
  // }



  /**
   * hier wird Live-Update der Channels aktiviert
   * funktion wird im constructor aufgerufen um bei ersten öffnen des workspaces zu laden
   */
  async loadChannels(){
    const queryAllChannels = await query(this.channelService.collectionRef);

    const unsub = onSnapshot(queryAllChannels, (querySnapshot) => {
      this.channels = [];
      querySnapshot.forEach((doc: any) => {
        this.channels.push(doc.data());
    });    
  });
  
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
   * Handles the click event on selectable elements.
   * Removes the class "selected" from all other elements
   * and sets this class to clicked elements
   *
   * @param {MouseEvent} event - The click event.
   * @returns {void}
   */
  handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    this.selectedChannel(target);
    const selectableElement = this.findParentElement(target);
    this.elRef.nativeElement
      .querySelectorAll('.selectable')
      .forEach((element: HTMLElement) => element.classList.remove('selected'));
    this.renderer.addClass(selectableElement, 'selected');
  }

  selectedChannel(target: HTMLSpanElement) {
    let selectedChannel = (target as HTMLSpanElement).textContent;

    if (selectedChannel?.includes('#')) {
      selectedChannel = selectedChannel.substring(1);
    }
    if (selectedChannel) {
      this.channelDataService.changeSelectedChannel(selectedChannel);
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
   * Display the channel creation window.
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
  }

  /**
   * Handles the input change event for the channel creation input field.
   *
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
   * Navigate to the second screen of channel creation.
   */
  openChannelCreateContainer() {
    this.selectedUsers = this.allUsers;
    this.isSecondScreen = true;
    if(this.isScreenSmall) {
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
   * Für den Channel benötigen wir habe ich noch ein paar Variablen bzw. Arrays mehr
   * UsersID's brauchen wir um messages zu erstellen und individuell zuzuweisen
   * channelCreator für das 'Erstellt von' im channel Menu 
   * und die channelID wird beim erstellen im channel.Service hinzugefügt, diese ist zum löschen und editieren ganz nützlich
   */
  async setNewChannelItems() {    
      const channelname = this.createdChannelName;
      const channelDescription = this.createdChannelDescription;
      const channelUsers =  this.selectedUsers.map(user => {
        return {
          firstname: user.firstname,
          lastname: user.lastname,
          profileImg: user.profileImg
        };
      });
      const channelUsersID = this.selectedUsers.map(user => {
        return user.id
      });
      const channelCreator = this.channelService.getCreatorsName();

    
    this.channelService.createChannel(channelname, channelDescription, channelUsersID, channelUsers, await channelCreator);
    this.closeChannelCreateWindow();
    // this.getAllChannel();
  }


  /**
   * auskommentiert von Klemens --> neue Funktion darüber
   * @param users 
   * @param currentUserId 
   * @returns 
   */
  // setNewChannelItems() {
  //   let newChannel = {
  //     channelname: this.createdChannelName,
  //     description: this.createdChannelDescription,
  //     channelUsers: this.selectedUsers.map(user => {
  //       return {
  //         firstname: user.firstname,
  //         lastname: user.lastname,
  //         profileImg: user.profileImg
  //       };
  //     })
  //   };
  //   this.createNewChannel(newChannel);
  //   this.closeChannelCreateWindow();
  //   this.getAllChannel();
  // }

  // createNewChannel(newChannelItems: {}) {
  //   this.channelService.addNewChannel(newChannelItems);
  // }

  sortUsers(users: User[], currentUserId: string): User[] {
    return users.slice().sort((a, b) => {
      if (a.id === currentUserId) return -1;
      if (b.id === currentUserId) return 1;
      return (a.firstname + ' ' + a.lastname).localeCompare(b.firstname + ' ' + b.lastname);
    });
  }


  /**
   * channelwechsel --> kurzfristig in ordnung, aber nicht gut
   * @param channelID 
   */
  openChannel(channelID: string){
    this.main.channelOpen = false;
    this.main.threadOpen = false;
    this.channelService.activeChannelID = channelID;

    setTimeout(() => {
      this.main.channelOpen = true;
    }, 0.02);
  }
}




