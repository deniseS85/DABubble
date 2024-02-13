export interface Message {

  messageUserID: string;
  date: Date;
  messagetext: string;
  messageID: string;
  highlightedText?: string;
  user?: {
    firstname: string;
    lastname: string;
    profileImg: string;
  };
  channelID: string;

}
