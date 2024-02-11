import { Component, ElementRef, Inject, Renderer2 } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { ChatService } from '../../services/chat.service';
import { ChannelDataService } from '../../services/channel-data.service';
import { ChannelService } from '../../services/channel.service';

@Component({
  selector: 'app-user-profile-card',
  templateUrl: './user-profile-card.component.html',
  styleUrl: './user-profile-card.component.scss'
})
export class UserProfileCardComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: { user: User, chatOpen: boolean, channelOpen: boolean }, 
    public dialogRef: MatDialogRef<UserProfileCardComponent>, 
    private chatService: ChatService, 
    private channelDataService: ChannelDataService,
    private channelservice: ChannelService,
    private elRef: ElementRef,
    private renderer: Renderer2,) {}

  getProfileImagePath(user: User): string {
    if (user.profileImg.startsWith('https://firebasestorage.googleapis.com')) {
      return user.profileImg;
    } else {
      return `./assets/img/${user.profileImg}`;
    }
  }

  doNotClose(event: MouseEvent): void {
    event.stopPropagation();
  }

  /* openChannelDirectMessage(event: MouseEvent, chatPartnerID: string): void {
      let userFullName = this.data.user.firstname + " " + this.data.user.lastname;
      this.chatService.userID = chatPartnerID;
      this.channelDataService.highlightUserInWorkspace(userFullName);
      this.dialogRef.close({ chatOpen: true, channelOpen: false });
  } */

  openDirectMessage(event: MouseEvent, chatPartnerID: string): void {
    this.setChatUserID(chatPartnerID);
    const target = event.target as HTMLElement;
    const selectableElement = this.findParentElement(target);
    console.log(target)
   /*  this.elRef.nativeElement
      .querySelectorAll('.selectable')
      .forEach((element: HTMLElement) => element.classList.remove('selected'));
    this.renderer.addClass(selectableElement, 'selected'); */

    let userFullName = this.data.user.firstname + " " + this.data.user.lastname;
    this.channelDataService.highlightUserInWorkspace(userFullName);
    this.dialogRef.close({ chatOpen: false, channelOpen: false });
}

  setChatUserID(userID: string){
    this.chatService.userID = userID;
  }



  private findParentElement(target: HTMLElement): HTMLElement | null {
    while (target && !target.classList.contains('selectable')) {
      target = target.parentElement!;
    }
    return target;
  }

  /* handleClickChat(event: MouseEvent, userID: string): void {
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
    this.main.threadOpen = false;
    setTimeout(() => {
      this.main.chatOpen = true;
    }, 50);
  } */

  closeDialog(){
    this.dialogRef.close();
  }
}
