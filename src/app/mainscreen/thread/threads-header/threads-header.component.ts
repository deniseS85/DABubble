import { Component, Input } from '@angular/core';
import { MainscreenComponent } from '../../mainscreen.component';

@Component({
  selector: 'app-threads-header',
  templateUrl: './threads-header.component.html',
  styleUrl: './threads-header.component.scss',
  
})
export class ThreadsHeaderComponent {
  
  @Input() activeChannelName = ''; 

  constructor(private main: MainscreenComponent){}

  closeThread() {
    this.main.threadOpen = false;
    if(this.main.isMobileScreen) {
      this.main.channelOpen = true;
    }
  }
}
