import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Firestore, collection, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

@Component({
  selector: 'app-edit-channel-chat',
  templateUrl: './edit-channel-chat.component.html',
  styleUrl: './edit-channel-chat.component.scss'
})
export class EditChannelChatComponent {
  answertex: string = '';
  answer: any = {
    answertext: ""
  };
  firestore: Firestore = inject(Firestore);
  isAnswertextEmojiOpen = false;
  

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EditChannelChatComponent>,
    @Inject(MAT_DIALOG_DATA) public answerData: {channelid: string,
      messageid: string,
      answerid: string},
      public dialModalRef: MatDialogRef<any>
    ) {

      this.getAnswerData()
    }



  async updateAnswertext(){
    
    if(this.answertex ==''){
      await deleteDoc(doc(collection(this.firestore, "channels", this.answerData.channelid, "messages", this.answerData.messageid, 'answers'), this.answerData.answerid))
      .then(() => {        
        this.dialogRef.close();
      })
    } else{
    await updateDoc(doc(collection(this.firestore, "channels", this.answerData.channelid, "messages", this.answerData.messageid, 'answers'), this.answerData.answerid), {...this.answer, answertext: this.answertex})
      .then(() => {        
        this.dialogRef.close();
      })
    }
  }


  async getAnswerData(){
    const docRef = doc(collection(this.firestore, "channels", this.answerData.channelid, "messages", this.answerData.messageid, 'answers'), this.answerData.answerid)
    const answer = await getDoc(docRef)

    this.answer = answer.data();
    this.answertex = this.answer.answertext
  }


  toggleEmojiAnswer(){
    this.isAnswertextEmojiOpen = !this.isAnswertextEmojiOpen
  }


  addEmojitoText(event: any){
    
   const emoji = event.emoji.native

    this.answertex = this.answertex+emoji;
    this.toggleEmojiAnswer()
  }
  
  
  closeDialog(){
    this.dialogRef.close();
  }




  
}

