export class Users{

    firstname: string;
    lastname: string;
    // email: string;
    photoURL: string;
    id: string;


    //? --> wenn es ein obj gibt, dann konstruiere daraus, sonst leerer string
    // like obj ? obj.firstname : '';
    constructor(obj?: any){         

        this.firstname = obj ? obj.firstname : '';
        this.lastname = obj ? obj.lastname : '';
        // this.email = obj ? obj.email : '';
        this.photoURL = obj ? obj.photoURL : '';
        this.id = obj ? obj.id : '';
    }

    toJSON(){
        return {
            firstname: this.firstname,
            lastname: this.lastname,
            // email: this.email,
            profilPicture: this.photoURL,
            id: this.id
        }
    }    
}
