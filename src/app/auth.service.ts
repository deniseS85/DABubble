import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {}

  auth: Auth = inject(Auth);
  private userFirstName: string = '';
  private userLastName: string = '';
  private userImg: string = '';
 
  setUserDetails(firstName: string, lastName: string, profileImg: string): void {
      this.userFirstName = firstName;
      this.userLastName = lastName;
      this.userImg = profileImg;
      this.saveUserData();
  }

  getUserFirstName(): string {
      return this.userFirstName;
  }

  getUserLastName(): string {
      return this.userLastName;
  }

  getUserImg(): string {
      return this.userImg
  }

  private saveUserData(): void {
      localStorage.setItem('userFirstName', this.userFirstName);
      localStorage.setItem('userLastName', this.userLastName);
      localStorage.setItem('userImg', this.userImg);
  }

  restoreUserData(): void {
      this.userFirstName = localStorage.getItem('userFirstName') || '';
      this.userLastName = localStorage.getItem('userLastName') || '';
      this.userImg = localStorage.getItem('userImg') || '';
  }

}