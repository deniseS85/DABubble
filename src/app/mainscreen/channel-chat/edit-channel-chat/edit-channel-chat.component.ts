import { Component, Inject, inject } from '@angular/core';
import { Firestore, updateDoc, doc, collection, getDoc, deleteDoc } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-edit-channel-chat',
  templateUrl: './edit-channel-chat.component.html',
  styleUrl: './edit-channel-chat.component.scss'
})
export class EditChannelChatComponent {
 
  messageText: string = '';
  message: any = {
    messagetext: ''
  }
  firestore: Firestore = inject(Firestore);
  isMessageEmojiOpen = false;

  constructor(
    public dialog: MatDialog, 
    public dialogRef: MatDialogRef<EditChannelChatComponent>, 
    @Inject(MAT_DIALOG_DATA) public messageData: {channelid: string, messageid: string}, 
    public dialogModalRef: MatDialogRef<any>) 
    {
    this.getMessageData();
  }
  
  async getMessageData(){
    const docRef = doc(collection(this.firestore, "channels", this.messageData.channelid, "messages"), this.messageData.messageid);
    const message = await getDoc(docRef);

    this.message = message.data();
    this.messageText = this.message.messagetext
  }

   async updateMessageText(){
    
    if(this.messageText ==''){
      await deleteDoc(doc(collection(this.firestore, "channels", this.messageData.channelid, "messages"), this.messageData.messageid))
      .then(() => {        
        this.dialogRef.close();
      })
    } else{
      await updateDoc(doc(collection(this.firestore, "channels", this.messageData.channelid, "messages"), this.messageData.messageid), {...this.message, messagetext: this.messageText})
      .then(() => {        
        this.dialogRef.close();
      })
    }
  }

  toggleEmojiMessage(){
    this.isMessageEmojiOpen = !this.isMessageEmojiOpen
  }

  addEmojitoText(event: any){
    const emoji = event.emoji.native
    this.messageText = this.messageText+emoji;
    this.toggleEmojiMessage();
  }

  closeDialog(){
    this.dialogRef.close();
  }
   
}