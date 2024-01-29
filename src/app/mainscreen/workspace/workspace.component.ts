import { Component, ElementRef, Renderer2, ChangeDetectorRef, ViewChild, inject } from '@angular/core';
import { Firestore, Unsubscribe, collection, doc, getDoc, onSnapshot } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../models/user.class';
import { ChannelService } from '../../services/channel.service';
import { ChannelDataService } from '../../services/channel-data.service';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
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

  isChannelCreateWindow: boolean = false;
  isFirstScreen: boolean = true;
  isSecondScreen: boolean = false;
  isShowInputNames: boolean = false;
  isButtonDisabled: boolean = true;

  createdChannelName: string = '';
  createdChannelDescription: string = '';

  body = this.elRef.nativeElement.ownerDocument.body;
  userList;
  private unsubscribeSnapshot: Unsubscribe | undefined;

  firestore: Firestore = inject(Firestore);
  unsubUser: Unsubscribe | undefined;
  channels: any[] = [];

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    public channelService: ChannelService,
    public channelDataService: ChannelDataService
  ) {
    this.userID = this.route.snapshot.paramMap.get('id');
    this.userList = this.getUserfromFirebase();
  }

  async ngOnInit(): Promise<void> {
    if (this.userID) {
      this.checkIsGuestLogin();
    }
    this.getUserList();
    await this.getAllChannel();
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
   *
   * @returns {Promise<void>} A Promise that resolves after retrieving the channel list.
   */
  private async getAllChannel(): Promise<void> {
    await this.getChannelList();
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
   * Retrieve and update the channel list.
   *
   * @returns {Promise<void>} A Promise that resolves after retrieving the channel list.
   */
  async getChannelList(): Promise<void> {
    this.channels = await this.channelService.getAllChannels();
    console.log('Channels:', this.channels);
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
    const selectableElement = this.findParentElement(target);
    this.elRef.nativeElement
      .querySelectorAll('.selectable')
      .forEach((element: HTMLElement) => element.classList.remove('selected'));
    this.renderer.addClass(selectableElement, 'selected');
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
  toggleChannelCreateWindow() {
    this.isChannelCreateWindow = !this.isChannelCreateWindow;
    if (this.isChannelCreateWindow) {
      this.renderer.setStyle(this.body, 'overflow', 'hidden');
    } else {
      this.renderer.setStyle(this.body, 'overflow', 'auto');
    }
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
  toggleChannelCreateContainer() {
    this.isFirstScreen = !this.isFirstScreen;
    this.isSecondScreen= !this.isSecondScreen;
  }

  /**
   * Show / Hide input names on button click.
   */
  onShowClick() {
    this.isShowInputNames = true;
  }
  onHideClick() {
    this.isShowInputNames = false;
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

  setNewChannelItems() {
    let newChannel = {
      channelname: this.createdChannelName,
      description: this.createdChannelDescription,
      channelUsers: this.selectedUsers,
    };
    this.createNewChannel(newChannel);
    console.log('setChannel:', this.selectedUsers);
    
  }

  createNewChannel(newChannelItems: {}) {
    this.channelService.addNewChannel(newChannelItems);
  }
}
