import { Component } from '@angular/core';
import { MainscreenComponent } from '../mainscreen.component';

@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {
  
  constructor(private main: MainscreenComponent){
  }

  closeThread(){
    this.main.threadOpen = false;
  }


}
