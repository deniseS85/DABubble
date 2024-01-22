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