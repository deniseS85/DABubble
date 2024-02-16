import { Component } from '@angular/core';
import { MainscreenComponent } from '../mainscreen.component';
import { ChannelDataService } from '../../services/channel-data.service'

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent {
  searchChannel: string;

  constructor(
    public main: MainscreenComponent,
    public channelDataService: ChannelDataService,
  ) { }
}
