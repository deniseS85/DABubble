export class User {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    profileImg: string;
    isOnline: boolean;

    

    constructor(obj?: any) {
        this.id = obj && obj.id ? obj.id : '';
        this.firstname = obj && obj.firstname ? obj.firstname : '';
        this.lastname = obj && obj.lastname ? obj.lastname : '';
        this.email = obj && obj.email ? obj.email : '';
        this.profileImg = obj && obj.profileImg ? obj.profileImg : '';
        this.isOnline = obj ? obj.isOnline : false;
         
    }

    public toUserJson() {
        return {
            id: this.id,
            firstname: this.firstname,
            lastname: this.lastname,
            email: this.email,
            profileImg: this.profileImg,
            isOnline: this.isOnline
        };
    }


    public toJson(user: any) {
        return {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            profileImg: user.profileImg,
            isOnline: user.isOnline
        };
    }

    setUserObject(obj:any, id:string) {
        return new User({
            id: id || "",
            firstname: obj.firstname || "",
            lastname: obj.lastname || "",
            email: obj.email || "",
            profileImg: obj.profileImg || "",
            isOnline: obj.isOnline || false
        });
    } 
}