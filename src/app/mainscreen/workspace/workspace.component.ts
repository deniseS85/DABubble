import {
  Component,
  ElementRef,
  Renderer2,
  ChangeDetectorRef,
  ViewChild,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  Firestore,
  Unsubscribe,
  collection,
  doc,
  getDoc,
  onSnapshot,
} from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../models/user.class';
import { ChannelService } from '../../services/channel.service';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent {
  @ViewChild('channelCreateWindow')
  channelCreateWindow!: ElementRef<HTMLElement>;
  @ViewChild('channelCreateContainer')
  channelCreateContainer!: ElementRef<HTMLElement>;
  panelOpenState1 = false;
  panelOpenState2 = false;

  user = new User();
  userID: any;
  allUsers: User[] = [];
  userFullName: String = '';
  
  selectedUsers: User[] = [];

  showInputNames: boolean = false;

  channelCreateForm: FormGroup;
  body = this.elRef.nativeElement.ownerDocument.body;
  userList;
  private unsubscribeSnapshot: Unsubscribe | undefined;

  firestore: Firestore = inject(Firestore);
  unsubUser: Unsubscribe | undefined;

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    public channelService: ChannelService
  ) {
    this.channelCreateForm = this.formBuilder.group({
      channelName: ['', [Validators.required]],
      selectedOption: ['specificMembers'],
    });

    this.userID = this.route.snapshot.paramMap.get('id');
    this.userList = this.getUserfromFirebase();
  }

  ngOnInit(): void {
    if (this.userID) {
      this.checkIsGuestLogin();
    }
    this.unsubUser = onSnapshot(this.channelService.getUsersRef(), (list) => {
      this.allUsers = [];
      list.forEach((singleUser) => {
        let user = new User(singleUser.data());
        user.id = singleUser.id;
        this.allUsers.push(user);
      });
    });
  }

   getProfileImagePath(): string {
        if (this.user.profileImg.startsWith('https://firebasestorage.googleapis.com')) {
          return this.user.profileImg;
        } else {
          return `./assets/img/${this.user.profileImg}`;
        }
    }

  ngOnDestroy() {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }
    if (this.userID) {
      this.checkIsGuestLogin();
    }

    this.unsubUser = onSnapshot(this.channelService.getUsersRef(), (list) => {
      this.allUsers = [];
      list.forEach((singleUser) => {
        let user = new User(singleUser.data());
        user.id = singleUser.id;
        this.allUsers.push(user);
      });
    });
  }

  getUserID() {
    return doc(collection(this.firestore, 'users'), this.userID);
  }

  getUserfromFirebase(): void {
    this.unsubscribeSnapshot = onSnapshot(this.getUserID(), (element) => {
      this.user = new User(element.data());
      this.user.id = this.userID;
      this.userFullName = `${this.user.firstname} ${this.user.lastname}`;
    });
  }

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
   * Handles the click event on selectable elements. Removes the class "selected" from all other elements and sets this class to clicked elements
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

  private findParentElement(target: HTMLElement): HTMLElement | null {
    while (target && !target.classList.contains('selectable')) {
      target = target.parentElement!;
    }
    return target;
  }

  showChannelCreateWindow(): void {
    this.channelCreateWindow.nativeElement.style.display = 'block';
    this.renderer.setStyle(this.body, 'overflow', 'hidden');
  }

  hideChannelCreateWindow(event: MouseEvent): void {
    if (this.channelCreateWindow && this.channelCreateContainer) {
      if (
        !this.channelCreateContainer.nativeElement.contains(
          event.target as Node
        )
      ) {
        this.closeChannelCreateWindow();
      }
    }
  }

  closeChannelCreateWindow(): void {
    this.channelCreateWindow.nativeElement.style.display = 'none';
    this.renderer.setStyle(this.body, 'overflow', 'auto');
    const inputElements =
      this.channelCreateWindow.nativeElement.querySelectorAll(
        'input'
      ) as NodeListOf<HTMLInputElement>;
    inputElements.forEach((inputElement) => {
      inputElement.value = '';
    });
  }

  channelCreateSecondScreen(): void {
    if (this.channelCreateWindow) {
      const firstScreen =
        this.channelCreateWindow.nativeElement.querySelectorAll(
          '.first-screen'
        ) as NodeListOf<HTMLInputElement>;
      const secondScreen =
        this.channelCreateWindow.nativeElement.querySelectorAll(
          '.second-screen'
        ) as NodeListOf<HTMLInputElement>;
      firstScreen.forEach((firstScreen) => {
        firstScreen.style.display = 'none';
        this.renderer.setStyle(this.body, 'overflow', 'auto');
      });
      secondScreen.forEach((secondScreen) => {
        secondScreen.style.display = 'block';
        this.renderer.setStyle(this.body, 'overflow', 'hidden');
      });
    }
  }

  onShowClick() {
    this.showInputNames = true;
    this.cdr.detectChanges();
  }

  onHideClick() {
    this.showInputNames = false;
    this.cdr.detectChanges();
  }

  searchQuery: string = '';

  onSearchInputChange(event: any): void {
    this.searchQuery = event.target.value;
  }

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


  selectUser(user: User): void {
    if (!this.selectedUsers.includes(user)) {
      this.selectedUsers.push(user);
      this.updateSelectedUsersInput();
    }
  }

  removeUser(user: User): void {
    this.selectedUsers = this.selectedUsers.filter((u) => u !== user);
    this.updateSelectedUsersInput();
  }

  updateSelectedUsersInput(): void {
    const selectedUsersNames = this.selectedUsers
      .map((u) => `${u.firstname} ${u.lastname}`)
      .join(', ');
    this.channelCreateForm
      .get('selectedUsersInput')
      ?.setValue(selectedUsersNames);
  }

  
}
