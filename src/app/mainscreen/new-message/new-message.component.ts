import { Component } from '@angular/core';
import { MainscreenComponent } from '../mainscreen.component';
@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent {
  searchChannel: string;

  constructor(
    public main: MainscreenComponent
  ) { }

}
