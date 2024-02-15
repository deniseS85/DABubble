import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { ChatService } from '../../services/chat.service';
import { ChannelDataService } from '../../services/channel-data.service';



@Component({
  selector: 'app-user-profile-card',
  templateUrl: './user-profile-card.component.html',
  styleUrl: './user-profile-card.component.scss'
})
export class UserProfileCardComponent {
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: { user: User, chatOpen: boolean, channelOpen: boolean }, 
    public dialogRef: MatDialogRef<UserProfileCardComponent>, 
    private chatService: ChatService, 
    private channelDataService: ChannelDataService) {}

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

  openDirectMessage(chatPartnerID: string): void {
      let userFullName = this.data.user.firstname + " " + this.data.user.lastname;
      this.chatService.userID = chatPartnerID;
      this.channelDataService.highlightUserInWorkspace(userFullName);
      this.dialogRef.close({ chatOpen: true, channelOpen: false });
  } 

  closeDialog(){
    this.dialogRef.close();
  }
}
