import { Component, Inject, inject } from '@angular/core';
import { Firestore, updateDoc, doc, collection, getDoc, deleteDoc } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-answer',
  templateUrl: './edit-answer.component.html',
  styleUrl: './edit-answer.component.scss'
})
export class EditAnswerComponent {

  answertex: string = '';
  answer: any = {
    answertext: ""
  };
  firestore: Firestore = inject(Firestore);
  isAnswertextEmojiOpen = false;
  

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EditAnswerComponent>,
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
