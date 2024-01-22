import { Component, inject } from '@angular/core';
import { UsersService } from '../services/users.service';
import { FormControl } from '@angular/forms';
import { Firestore, collection, doc, onSnapshot, query, setDoc} from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { ChatsService } from '../services/chats.service';
import { reload, user } from '@angular/fire/auth';



@Component({
  selector: 'app-test-query',
  templateUrl: './test-query.component.html',
  styleUrl: './test-query.component.scss'
})
export class TestQueryComponent {

  firestore: Firestore = inject(Firestore);
  users$ = this.userService.allUsers$;
  
  searchControl = new FormControl('');
  usersList: any[] = [];
  chats$: any = [];
  messages: any = [];
  selectedChat?: any;
  chatSelected: boolean = false;
  messageControl = new FormControl();
  messageControlPartner = new FormControl();
  
  // angelegt zum Testen des Chats
  currentUser = this.chatService.user

  constructor(private userService: UsersService, private chatService: ChatsService){


    /**
     * hier die echtzeitdaten aller Chats holen und die in ein Array pushen, um alle abrufen zu können
     */
    const c = query(this.getChatRef());
    const unsubscribe = onSnapshot(c, (doc) => {
      this.chats$ = [];
      doc.forEach((chat: any) => {
        this.chats$.push(chat.data())
      })
    })



    /**
     * Userabfrage über onSnapshot --> return des Arrays funktioniert nicht im Service
     *                             --> deshalb in componente direkt abgerufen    
     */
    const q = query(this.getUsersRef())
    const unsub = onSnapshot(q, (doc) => {
      this.usersList = [];
      doc.forEach((element: any) => {
        this.usersList.push(element.data()) //add id to JSON
        console.warn(this.usersList)
      });
    });
  }

  getChatRef(){
    return collection(this.firestore, "chats")
  }


  getUsersRef(){
    return collection(this.firestore, 'users')
  }

  getMessageRef(chatID: string){
    return collection(this.firestore, "chats", chatID, 'messages')
  }


  createChat(otherUser: User){
    this.chatService.createChat(otherUser);    
  }


  selectChat(chat:any){
    this.selectedChat = chat;
    this.chatSelected = true;
    console.log(this.selectedChat)
    this.activateMessageUpdates(chat.id)
  }

  sendMessage(chatID: string, userID: string){

    const idChat = chatID;
    const idUser = userID;
    const message = this.messageControl.value;

    this.messageControl.setValue('')

    this.addToChat(idChat, idUser, message)
  }

  sendMessagePartner(chatID: string, userID: string){
    const idChat = chatID;
    const idUser = userID;
    const message = this.messageControlPartner.value;

    this.messageControlPartner.setValue('')
  }


  addToChat(chatID: string, userID: String, messageText: string){
    const ref = doc(this.getMessageRef(chatID));

    setDoc(ref, {
      idSender: userID,
      messageText: messageText
    });
  }

  activateMessageUpdates(id: string){
    const chat = query(this.getMessageRef(id));
    const unsub = onSnapshot(chat, (doc) => {
      this.messages = [];
      doc.forEach((message: any) => {
        this.messages.push(message.data())
      })
    })
  }

}


