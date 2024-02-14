import { Component, Injectable, inject } from '@angular/core';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { getDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ReactionsService {

  constructor() { }

  firestore: Firestore = inject(Firestore);

  chatMessageRef: any;
  channelMessageRef: any;
  threadMessageRef: any;


  /**
   * 
   * @param channelID channelID if its an Message in the channel
   * @param channelMessageID ID of the Message in the channel if its message in channel
   * @param threadMessageID 
   * @param chatID 
   * @param chatMessageID 
   * @param event 
   * @param message 
   * @param userName 
   */
  async handleReaction(
    channelID: string,
    channelMessageID: string,
    threadMessageID: string,
    chatID: string,
    chatMessageID: string,
    event: any,
    message: any,
    userName: string,
    typ: string
  ) {
    const reaction = event.emoji.native;
    const reactCollectionRef = this.getRef(typ, channelID, channelMessageID, threadMessageID)
    let allEmojis: any[] = [];
    let allReactions: any[] = [];

    message.react.forEach((reac: any) => {
      allEmojis.push(reac.emoji);
      allReactions.push(reac)
    });

    if (this.reactionAllreadyThere(allEmojis, reaction)) {

      // finde index des Emojis im Array
      const emojiIndex = allEmojis.indexOf(reaction);
      const existingEmoji = allReactions[emojiIndex];
      // Wenn activeUser schon bestehendes Emoji geklickt hat
      if (existingEmoji.user.includes(userName)) {
        // lösche den activen User, da er den Emoji löscht
        existingEmoji.user = this.deleteUserFromReaction(existingEmoji, userName);
        // aktualisiere die User dieses Emojis
        message.react[emojiIndex].user = existingEmoji.user;
        
        //wenn Menge der User die den Emoji geklickt haben null ist, lösche den Emoji aus DB
        if (existingEmoji.user.length == 0) {
          const index = message.react.indexOf(existingEmoji);
          message.react.splice(index, 1);
        }
      
        this.updateReactions(message, reactCollectionRef)  

      } else if (!existingEmoji.user.includes(userName)) {
        existingEmoji.user.push(userName);

        message.react[emojiIndex].user = existingEmoji.user

        await updateDoc(reactCollectionRef, {
          react: message.react
        });

      }

    } else {
      this.addNewEmojiReaction(message, reactCollectionRef, reaction, userName)
    }
  }


  getRef(typ: string, channelID: string, messageID: string, answerID: string){
    if(typ == "threadReaction"){
      return doc(this.firestore, "channels", channelID, "messages", messageID, 'answers', answerID);
    } else if ( typ == "messageReaction"){
      return doc(this.firestore, "channels", channelID, "messages", messageID);
    } else if ( typ == "chatReaction"){
      return doc(this.firestore, "chats", channelID, "messages", messageID);
    } else {
      return doc(this.firestore, "channels", channelID, "messages", messageID, 'answers', answerID)
    }
  }


  /**
   * 
   * @param allEmojis 
   * @param reaction 
   * @returns 
   */
  reactionAllreadyThere(allEmojis: any, reaction: any) {
    return allEmojis.includes(reaction)
  }

  
  /**
   * 
   * @param existingEmoji 
   * @param userName 
   * @returns 
   */
  deleteUserFromReaction(existingEmoji: any, userName: string) {
    return existingEmoji.user.filter((e: any) => e !== userName)
  }


  /**
   * HIER NOCHMAL ANPASSEN [selectedEMOJIS] raus
   * @param answer 
   * @param reactCollectionRef 
   */
  async addNewEmojiReaction(answer: any, reactCollectionRef: any, reaction: any, userName: string) {

    const react = {
      emoji: reaction,
      user: [userName]
    }
    
    answer.react.push(react);
    this.updateReactions(answer, reactCollectionRef)
  }


  /**
   * 
   * @param answer 
   * @param reactCollectionRef 
   */
  async updateReactions(message: any, reactCollectionRef: any) {

    console.warn(reactCollectionRef, message.react)

    await updateDoc(reactCollectionRef, {
      react: message.react
    });
  }

}
