import { Component, inject } from '@angular/core';
import { ChannelService } from '../../../services/channel.service';
import { Firestore, Unsubscribe, doc, onSnapshot, query } from '@angular/fire/firestore';
import { ChannelDataService } from '../../../services/channel-data.service';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-chat-container',
  templateUrl: './chat-container.component.html',
  styleUrl: './chat-container.component.scss'
})
export class ChatContainerComponent {

  allUsers: any[] = [];
  allAnswers: any[] = [];
  unsubUser: Unsubscribe | undefined;
  
  message = {
    messageUserName:'Klemens',
    messageUserProfileImg: '',
    messagetext: 'hallo',
    messageUserID: '',
    messageid: '',
    timestamp: '12:11',
    date: '2021-11-32',
    isEmojiOpen: false,
    react: [
      {emoji: '',
        user: 'Klemens'}
    ],
    answerInfo: {
            counter: 0,
            lastAnswerTime: ""
          },
    activeUser: true,
  }

  firestore: Firestore = inject(Firestore);
  
  constructor(
    private channelService: ChannelService,
    private channelDataService: ChannelDataService,
  ){

  }



  // async loadMessagesOfThishat() {
  //   const queryAllAnswers = await query(this.channelService.getMessageRef(this.channelDataService.channelID));
  //   onSnapshot(queryAllAnswers, async (querySnapshot) => {
  //     this.allAnswers = [];

  //     for (const doc of querySnapshot.docs) {
  //       const messageData = doc.data();
  //       const userData = await this.loadUserData(messageData['messageUserID']);

  //       if (userData) {
  //         const message = {
  //           ...messageData,
  //           ...userData,
  //         };
  //         this.allMessages.push(message);
  //         this.loadAnswers(messageData['messageID'], doc);
  //       }
  //       this.sortMessagesByTimeStamp();
  //     }
  //   });
  //   this.updateMessagesWithUserData();
  // }


  async loadUserData(messageUserID: string): Promise<any> {
    const user = this.allUsers.find(u => u.id === messageUserID);

    if (user) {
      const userDocRef = doc(this.firestore, 'users', messageUserID);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const updatedUser = doc.data();
          Object.assign(user, updatedUser);
          this.channelService.userDataSubject.next({ ...user });
        }
      });

      const userData = await Promise.resolve({
        firstname: user.firstname,
        lastname: user.lastname,
        profileImg: user.profileImg,
        isOnline: user.isOnline,
        unsubscribe: unsubscribe
      });

      return userData;
    } else {
      return null;
    }
  }


   /**
   * Retrieves all user information from the database.
   * Subscribes to changes in the user data and updates the local allUsers array accordingly.
   * 
   * @returns {void}
   */
   getAllUserInfo(): void {
    this.unsubUser = onSnapshot(this.channelService.getUsersRef(), (list) => {
      this.allUsers = [];
      list.forEach(singleUser => {
        let user = new User(singleUser.data());
        user.id = singleUser.id;
        this.allUsers.push(user);
      });
    });
  }


  toggleEmoji(id: string){

  }

  handleReaction($event: any, message: any){

  }

  editAnswer(id: string){

  }


}
