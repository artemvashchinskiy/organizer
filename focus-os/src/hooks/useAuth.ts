import { useEffect, useState } from "react";

import type { User } from "../types/user";

import {
    hashPassword,
    verifyPassword
} from "../utils/crypto";



interface Session {

    userId:string;

    lastActivity:number;

    failedAttempts:number;

    lockUntil:number | null;

    lockLevel:number;

}



const USERS_KEY = "calendar-users";

const SESSION_KEY = "calendar-session";



const AUTO_LOCK_TIME =
    1000 * 60 * 60 * 4;



const LOCK_30_MIN =
    1000 * 60 * 30;



const LOCK_24_HOURS =
    1000 * 60 * 60 * 24;







function getUsers():User[]{


    const data =
        localStorage.getItem(
            USERS_KEY
        );


    return data
        ?
        JSON.parse(data)
        :
        [];

}





function saveUsers(users:User[]){


    localStorage.setItem(

        USERS_KEY,

        JSON.stringify(users)

    );

}





function getSession():Session|null{


    const data =
        localStorage.getItem(
            SESSION_KEY
        );


    return data
        ?
        JSON.parse(data)
        :
        null;

}





function saveSession(

    session:Session|null

){


    if(session){

        localStorage.setItem(

            SESSION_KEY,

            JSON.stringify(session)

        );

    }
    else{

        localStorage.removeItem(

            SESSION_KEY

        );

    }

}









function useAuth(){

    const [loading,setLoading] = useState(true);

    const [user,setUser] =
        useState<User|null>(null);



    const [isLocked,setIsLocked] =
        useState(false);




    const [lockUntil,setLockUntil] =
        useState<number|null>(null);









useEffect(()=>{


    const session = getSession();



    if(!session){

        setLoading(false);

        return;

    }






    const users = getUsers();




    const currentUser = users.find(

        u=>u.id===session.userId

    );





    if(!currentUser){

        setLoading(false);

        return;

    }







    if(

        session.lockUntil &&

        session.lockUntil > Date.now()

    ){


        setIsLocked(true);


        setLockUntil(

            session.lockUntil

        );


        setLoading(false);


        return;


    }








    if(

        Date.now()

        -

        session.lastActivity

        >

        AUTO_LOCK_TIME

    ){


        setIsLocked(true);


        setLoading(false);


        return;


    }







    setUser(currentUser);


    setLoading(false);






    // ============================
    // Auto-lock while app is open
    // ============================

    const interval = setInterval(()=>{


        const activeSession = getSession();


        if(!activeSession)
            return;



        if(

            Date.now()

            -

            activeSession.lastActivity

            >

            AUTO_LOCK_TIME

        ){


            setUser(null);


            setIsLocked(true);


            setLockUntil(null);


            clearInterval(interval);


        }


    },60000);





    return ()=>{

        clearInterval(interval);

    };


},[]);









    async function register(

        username:string,

        password:string

    ){



        const users =
            getUsers();





        if(

            users.some(

                u=>u.username===username

            )

        ){

            return false;

        }






        const passwordHash =
            await hashPassword(

                password

            );





        const newUser:User={


            id:
            crypto.randomUUID(),


            username,


            passwordHash,


            createdAt:
            Date.now(),


            lastActive:
            Date.now()


        };






        saveUsers([

            ...users,

            newUser

        ]);






        setUser(newUser);





        saveSession({


            userId:newUser.id,


            lastActivity:Date.now(),


            failedAttempts:0,


            lockUntil:null,


            lockLevel:0


        });





        return true;


    }









    async function login(

        username:string,

        password:string

    ){



        const users =
            getUsers();





        const found =
            users.find(

                u=>u.username===username

            );





        if(!found)

            return false;







        let session =
            getSession();







        if(

            session?.lockUntil &&

            session.lockUntil > Date.now()

        ){


            setIsLocked(true);

            setLockUntil(
                session.lockUntil
            );


            return false;


        }









        const success =
            await verifyPassword(

                password,

                found.passwordHash

            );







        if(!success){



            if(!session){

                session={

                    userId:found.id,

                    lastActivity:Date.now(),

                    failedAttempts:0,

                    lockUntil:null,

                    lockLevel:0

                };

            }






            session.failedAttempts++;







            if(session.failedAttempts >=3){



                session.failedAttempts=0;



                session.lockLevel++;






                const lockTime =

                    session.lockLevel===1

                    ?

                    LOCK_30_MIN

                    :

                    LOCK_24_HOURS;






                session.lockUntil =
                    Date.now()
                    +
                    lockTime;





                setIsLocked(true);


                setLockUntil(
                    session.lockUntil
                );



            }






            saveSession(session);



            return false;


        }









        setUser(found);



        saveSession({


            userId:found.id,


            lastActivity:Date.now(),


            failedAttempts:0,


            lockUntil:null,


            lockLevel:0


        });





        return true;


    }









    async function unlock(

        password:string

    ){



        const session =
            getSession();



        if(!session)

            return false;






        const users =
            getUsers();




        const currentUser =
            users.find(

                u=>u.id===session.userId

            );





        if(!currentUser)

            return false;






        const ok =
            await verifyPassword(

                password,

                currentUser.passwordHash

            );






        if(!ok)

            return false;








        setIsLocked(false);


        setLockUntil(null);


        setUser(currentUser);






        saveSession({


            userId:currentUser.id,


            lastActivity:Date.now(),


            failedAttempts:0,


            lockUntil:null,


            lockLevel:0


        });






        return true;


    }









    function logout(){



        setUser(null);


        saveSession(null);


    }









    function touch(){



        const session =
            getSession();



        if(!session)

            return;




        saveSession({


            ...session,


            lastActivity:Date.now()


        });


    }









    return {

        user,

        loading,

        isLocked,

        lockUntil,

        login,

        register,

        unlock,

        logout,

        touch

    };

}



export default useAuth;