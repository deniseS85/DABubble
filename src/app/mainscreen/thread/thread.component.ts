import { Component } from '@angular/core';

@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  threadOpen: boolean =  true;
  
  constructor(){

  }

  closeThread(){
    this.threadOpen = false;
  }


}
