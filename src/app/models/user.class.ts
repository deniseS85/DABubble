export class User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    profileImg: string;
    

    constructor(obj?: any) {
        this.id = obj && obj.id ? obj.id : '';
        this.firstName = obj && obj.firstName ? obj.firstName : '';
        this.lastName = obj && obj.lastName ? obj.lastName : '';
        this.email = obj && obj.email ? obj.email : '';
        this.password = obj && obj.password ? obj.password : '';
        this.profileImg = obj && obj.profileImg ? obj.profileImg : ''
         
    }

    public toJson() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            password: this.password,
            profileImg: this.profileImg
        };
    }

    setUserObject(obj:any, id:string) {
        return new User({
            id: id || "",
            firstName: obj.firstName || "",
            lastName: obj.lastName || "",
            email: obj.email || "",
            password: obj.password || "",
            profileImg: obj.profileImg || ""
        });
    } 
}