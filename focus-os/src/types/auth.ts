import type { User } from "./user";


export interface AuthState {

    user: User | null;

    isLocked: boolean;

    lockUntil: number | null;

    failedAttempts: number;

    lockLevel: number;

}





export interface AuthContext {


    user: User | null;


    isLocked: boolean;



    login:(

        username:string,

        password:string

    )=>boolean;




    register:(

        username:string,

        password:string

    )=>boolean;




    logout:()=>void;




    unlock:(

        password:string

    )=>boolean;


}