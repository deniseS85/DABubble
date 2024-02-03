
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, limit, onSnapshot, query, setDoc, updateDoc } from '@angular/fire/firestore';

import { Observable, from, of } from 'rxjs';
import { User } from '../../models/user.class';


@Injectable({
  providedIn: 'root'
})
export class UsersService {

  firestore: Firestore = inject(Firestore);
  

  constructor() {
  
  }

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
