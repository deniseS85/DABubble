import { Component, Inject, inject } from '@angular/core';
import { Firestore, updateDoc, doc, collection, getDoc, deleteDoc } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-edit-channel-chat',
  templateUrl: './edit-channel-chat.component.html',
  styleUrl: './edit-channel-chat.component.scss'
})
export class EditChannelChatComponent {
 
  constructor(){}
   
   
}