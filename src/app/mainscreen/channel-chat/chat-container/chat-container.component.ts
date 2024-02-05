import { Component } from '@angular/core';

@Component({
  selector: 'app-chat-container',
  templateUrl: './chat-container.component.html',
  styleUrl: './chat-container.component.scss'
})
export class ChatContainerComponent {

  allAnswers: any[] = [];
  constructor(){

  }



  toggleEmoji(id: string){

  }

  handleReaction($event: any, message: any){

  }

  editAnswer(id: string){

  }


}
