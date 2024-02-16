import { Component } from '@angular/core';
import { MainscreenComponent } from '../mainscreen.component';
import { ChannelChatComponent } from "../channel-chat/channel-chat.component";

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent {
  searchChannel: string;

  constructor(
    public main: MainscreenComponent,
    public chat: ChannelChatComponent
  ) { }
}
