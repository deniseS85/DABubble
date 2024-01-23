import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login-animation',
  templateUrl: './login-animation.component.html',
  styleUrl: './login-animation.component.scss'
})
export class LoginAnimationComponent implements OnInit {

  shouldPlayAnimation: boolean = true;
  
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.shouldPlayAnimation$.subscribe(shouldPlay => {
      this.shouldPlayAnimation = shouldPlay;
    });
  }
  
}
