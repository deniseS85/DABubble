
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, limit, onSnapshot, query, setDoc, updateDoc } from '@angular/fire/firestore';

import { Observable, from } from 'rxjs';
import { User } from '../../models/user.class';
import { Users } from '../models/users.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  firestore: Firestore = inject(Firestore);
  

  constructor() {
  
  }

  // addUser(user: Users): Observable<Users>{
  //   const ref = doc(this.getUsersRef(), 'testUsersKlemens', user.id)
  //   return from(setDoc(ref, user))
  // }


  // updateUser(user: Users): Observable<Users>{
  //   const ref = doc(this.getUsersRef(), 'testUsersKlemens', user.id)
  //   return from(updateDoc(ref, { ...user}))
  // }

  /**
   * Userabfrage mit Observables
   */
  get allUsers$(): Observable<any>{    
    const queryAll = query(this.getUsersRef(), limit(50));

    return collectionData(queryAll) as Observable<any>    
  }


  getUsersRef(){
    return collection(this.firestore, 'users')
  }

  
}
