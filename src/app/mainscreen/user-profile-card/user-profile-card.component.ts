import { Component, Inject, inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { ChatService } from '../../services/chat.service';
import { ChannelDataService } from '../../services/channel-data.service';
import { Firestore } from '@angular/fire/firestore';




@Component({
  selector: 'app-user-profile-card',
  templateUrl: './user-profile-card.component.html',
  styleUrl: './user-profile-card.component.scss'
})
export class UserProfileCardComponent {
  firestore: Firestore = inject(Firestore);
  userID: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { user: User, chatOpen: boolean, channelOpen: boolean, userID: any  }, 
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
  const userFullName = this.data.user.firstname + " " + this.data.user.lastname;
  this.userID = this.data.userID;

  
  this.chatService.getChatIDByUserIDs(this.userID, chatPartnerID).then(chatID => {
    if (chatID) {
      /* this.chatService.chatID = chatID; */
      console.log('chatID',chatID)
      console.log('currentUser', this.userID);
      console.log('chatpartner', chatPartnerID);

      this.channelDataService.highlightUserInWorkspace(userFullName);
      this.dialogRef.close({ chatOpen: true, channelOpen: false });
    } else {
      console.error('Chat nicht gefunden');
    }
  });
}

  closeDialog(){
    this.dialogRef.close();
  }

 


}
