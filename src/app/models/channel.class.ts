export class Channel {
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
    

    constructor(obj?: any) {
        this.channelID = obj && obj.channelID ? obj.channelID : '';
        this.description = obj && obj.description ? obj.description : '';
        this.channelname = obj && obj.channelname ? obj.channelname : '';
        this.channelUsersID = obj && obj.channelUsersID ? obj.channelUsersID : '';
        this.channelUsers = obj && obj.channelUsers ? obj.channelUsers : '';
        this.channelCreator = obj && obj.channelCreator ? obj.channelCreator : '';
         
    }

    public toJson() {
        return {
            channelID: this.channelID,
            description: this.description,
            channelname: this.channelname,
            channelUsersID: this.channelUsersID,
            channelUsers: this.channelUsers,
            channelCreator: this.channelCreator
        };
    }

    setUserObject(obj:any, id:string) {
        return new Channel({
            channelID: obj.channelID || "",
            description: obj.description || "",
            channelname: obj.channelname || "",
            channelUsersID: obj.channelUsersID || "",
            channelUsers: obj.channelUsers || "",
            channelCreator: obj.channelCreator || ""
        });
    } 
}