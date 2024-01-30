export interface Channel{
    channelID: string;
    description: string;
    channelname: string;
    channelUsersID: string[];           
    channelUsers: any[];               //     user{
                                       //       firstname: user.firstname,
                                       //       lastname: user.lastname,
                                       //       profilImg: user.profilImg,   * 
                                       //      }
    channelCreator: string;
}

export interface Chat {
    avatar: string;
    reactionMenu: {
      emoji: string;
      handsUp: string;
      addReaction: string;
      answer: string;
      isEmojiOpen: boolean;
      selectedEmojis: string[];
    };
    userName: string;
    chatUserID: string;
    sendingTime: string;
    messageContent: string;
    answerInfo: {
      counter: number;
      lastAnswerTime: string;
    };
    date: string;
    animationState?: 'visible' | 'hidden';
}