import { Component, OnInit } from '@angular/core';
import { MainscreenComponent } from '../mainscreen.component';
import { ChannelService } from '../../services/channel.service';
import { ChannelDataService } from '../../services/channel-data.service';

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent implements OnInit {
  searchChannel: string;

  constructor(
    public main: MainscreenComponent,
    private channelservice: ChannelService,
    private channelDataService: ChannelDataService
  ) { }

  ngOnInit(): void {
    if(this.channelDataService.channelName !== '') {
      this.main.newMessageOpen = false;
      this.main.searchChannel = '';
    }
  }

}
