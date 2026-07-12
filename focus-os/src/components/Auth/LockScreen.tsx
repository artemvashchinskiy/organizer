import { useEffect, useState } from "react";


interface LockScreenProps {


    lockUntil?:number | null;


    onUnlock?:(
        password:string
    )=>Promise<boolean>;


}



function LockScreen({

    lockUntil = null,

    onUnlock

}:LockScreenProps){



    const [remaining,setRemaining] = useState(0);


    const [password,setPassword] = useState("");

    const [error,setError] = useState("");








    useEffect(()=>{


        if(lockUntil == null)
            return;




        const lockUntilTime = lockUntil;

        function update(){


            const diff = lockUntilTime - Date.now();



            setRemaining(

                Math.max(

                    0,

                    diff

                )

            );

        }




        update();




        const timer = setInterval(

            update,

            1000

        );





        return ()=>clearInterval(timer);



    },[lockUntil]);









    function formatTime(ms:number){


        const totalSeconds = Math.floor(

            ms / 1000

        );



        const hours = Math.floor(

            totalSeconds / 3600

        );



        const minutes = Math.floor(

            (totalSeconds % 3600) / 60

        );



        const seconds =

            totalSeconds % 60;





        return (

            `${String(hours).padStart(2,"0")}:` +

            `${String(minutes).padStart(2,"0")}:` +

            `${String(seconds).padStart(2,"0")}`

        );

    }









    async function handleUnlock(){



        if(!onUnlock)
            return;




        const success = await onUnlock(

            password

        );




        if(!success){


            setError(

                "Incorrect password"

            );


        }


    }









    return(



        <div className="auth-screen">





            <div className="auth-card">





                <h2>

                    App Locked

                </h2>







                {

                    remaining > 0 &&



                    <div className="lock-time">


                        Try again in:


                        <br/>


                        <b>

                            {formatTime(remaining)}

                        </b>


                    </div>


                }








                {

                    remaining === 0 && onUnlock &&



                    <>


                        <input


                            type="password"


                            placeholder="Enter password"



                            value={password}



                            onChange={(e)=>

                                setPassword(

                                    e.target.value

                                )

                            }


                        />







                        {

                            error &&


                            <div className="auth-error">

                                {error}

                            </div>


                        }







                        <button


                            onClick={handleUnlock}


                        >

                            Unlock


                        </button>



                    </>


                }






            </div>



        </div>


    )

}



export default LockScreen;