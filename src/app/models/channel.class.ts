
export class Channel {
    channelID: string;
    channelDescription: string;
    channelname: string;       
    channelUsers: any[];              
    channelCreator: string;
    

    constructor(obj?: any) {
        this.channelID = obj && obj.channelID ? obj.channelID : '';
        this.channelDescription = obj && obj.channelDescription ? obj.channelDescription : '';
        this.channelname = obj && obj.channelname ? obj.channelname : '';
        this.channelUsers = obj && obj.channelUsers ? obj.channelUsers : [];
        this.channelCreator = obj && obj.channelCreator ? obj.channelCreator : '';
         
    }

    public toJson() {
        return {
            channelID: this.channelID,
            description: this.channelDescription,
            channelname: this.channelname,
            channelUsers: this.channelUsers,
            channelCreator: this.channelCreator,
        };
    }

    setUserObject(obj:any, id:string) {
        return new Channel({
            channelID: obj.channelID || "",
            channelDescription: obj.channelDescription || "",
            channelname: obj.channelname || "",
            channelUsers: obj.channelUsers || "",
            channelCreator: obj.channelCreator || "",
        });
    } 
}