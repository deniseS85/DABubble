import { Injectable, inject } from '@angular/core';
import { Firestore } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
    firestore: Firestore = inject(Firestore);
    private userFirstName: string = '';
    private userLastName: string = '';
    private userImg: string = '';
    private userDataSubject = new BehaviorSubject<any>({});
    userData$ = this.userDataSubject.asObservable();

    constructor(private authservice: AuthService) {}

    setUserData(updatedData: any): void {
        const currentData = this.userDataSubject.value;
        const newData = { ...currentData, ...updatedData };
        this.userDataSubject.next(newData);
    }

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


    getUserEmail(): string {
        let user = this.authservice.auth.currentUser;
        return user ? user.email || '' : '';
    }

    saveUserData(): void {
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
