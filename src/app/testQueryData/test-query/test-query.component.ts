import { Component, inject } from '@angular/core';
import { UsersService } from '../services/users.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Firestore, addDoc, collection, doc, limit, onSnapshot, query, setDoc } from '@angular/fire/firestore';
import { Users } from '../models/users.model';
import { User } from '@angular/fire/auth';



@Component({
  selector: 'app-test-query',
  templateUrl: './test-query.component.html',
  styleUrl: './test-query.component.scss'
})
export class TestQueryComponent {

  firestore: Firestore = inject(Firestore);
  users$ = this.userService.allUsers$;
  
  searchControl = new FormControl('');
  usersList: User[] = [];

  /**
     * formControls Input
     */
  
  userForm = new FormGroup({
  firstname: new FormControl(''),
  lastname: new FormControl(''),
  photoURL: new FormControl(''),
  })



  constructor(private userService: UsersService){

    /**
     * Userabfrage über onSnapshot --> return des Arrays funktioniert nicht im Service
     *                             --> deshalb in componente direkt abgerufen    
     */
    const q = query(collection(this.firestore, 'users'), limit(50))
    const unsub = onSnapshot(q, (doc) => {
      this.usersList = [];
      doc.forEach((element: any) => {
        this.usersList.push({ ...element.data(), id: element.id }) //add id to JSON
      });
    });
  }


  async submitForm(){

      const newProfil = new Users(this.userForm.value);
      console.warn(newProfil)
      
      await setDoc(this.getUsersRef(), {...newProfil, id: this.getUsersRef().id})
            
  }


  getUsersRef(){
    return doc(collection(this.firestore, 'users'))
  }


  openChat(otherUser: User){

  }
 

}


