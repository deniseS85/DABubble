import { Injectable, inject } from '@angular/core';
import { DocumentData, DocumentSnapshot, Firestore, collection, doc, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '../models/user.class';

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
    collectionUserRef = collection(this.firestore, 'users');
   /*  private isUserMemberSubject = new BehaviorSubject<boolean | undefined>(undefined); */

    constructor(private authservice: AuthService, private route: ActivatedRoute) {}

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

    async getAllUsers(): Promise<any[]> {
        const querySnapshot = await getDocs(this.collectionUserRef);
        const users: any[] = [];
        querySnapshot.forEach((doc) => {
          users.push(doc.data());
        });
        return users;
    }

    getUserById(users: User[], userId: string): User | undefined {
        return users.find(user => user.id === userId);
    }

   /*  setIsUserMember(status: boolean): void {
        this.isUserMemberSubject.next(status);
    }
    
    getIsUserMember(): BehaviorSubject<boolean | undefined> {
        return this.isUserMemberSubject;
    }

    */


}