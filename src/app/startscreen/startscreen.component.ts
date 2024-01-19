import { Component } from '@angular/core';


@Component({
  selector: 'app-startscreen',
  templateUrl: './startscreen.component.html',
  styleUrl: './startscreen.component.scss'
})
export class StartscreenComponent {
    isLogin = true;
    isSignup = false;

    toggleSignup() {
      this.isLogin = !this.isLogin;
      this.isSignup = !this.isSignup;
    }

}
