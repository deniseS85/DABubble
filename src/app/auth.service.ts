import { Injectable, OnDestroy, inject } from '@angular/core';
import { Auth, User, authState, idToken, user } from '@angular/fire/auth';
import { Subscription } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  constructor() {
      this.userSubscription = this.user$.subscribe((aUser: User | null) => {})
      this.authStateSubscription = this.authState$.subscribe((aUser: User | null) => {})
      this.idTokenSubscription = this.idToken$.subscribe((token: string | null) => {})
 }

  auth: Auth = inject(Auth);
  user$ = user(this.auth);
  userSubscription: Subscription;
  authState$ = authState(this.auth);
  authStateSubscription: Subscription;
  idToken$ = idToken(this.auth);
  idTokenSubscription: Subscription;
 

  ngOnDestroy() {
      this.userSubscription.unsubscribe();
      this.authStateSubscription.unsubscribe();
      this.idTokenSubscription.unsubscribe();
  }

}