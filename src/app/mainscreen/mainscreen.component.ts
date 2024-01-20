import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-mainscreen',
  templateUrl: './mainscreen.component.html',
  styleUrl: './mainscreen.component.scss'
})
export class MainscreenComponent implements OnInit {
  threadOpen: boolean =  true;
  userFirstName: String = '';
  userLastName: String = '';
  userImg: String = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
      this.authService.restoreUserData();
      this.userFirstName = this.authService.getUserFirstName();
      this.userLastName = this.authService.getUserLastName();
      this.userImg = this.authService.getUserImg();
  }
}
