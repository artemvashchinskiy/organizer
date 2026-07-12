import { useEffect, useRef, useState } from "react";


interface TimerProps {

    remaining:number;

    onTick:(seconds:number)=>void;

    onComplete:()=>void;

}



function Timer({

    remaining,

    onTick,

    onComplete

}:TimerProps){



    const [time,setTime] = useState(remaining);


    const [running,setRunning] = useState(false);




    const onTickRef = useRef(onTick);

    const onCompleteRef = useRef(onComplete);





    useEffect(()=>{

        onTickRef.current = onTick;

    },[onTick]);





    useEffect(()=>{

        onCompleteRef.current = onComplete;

    },[onComplete]);








    useEffect(()=>{


        setTime(remaining);


    },[remaining]);








    useEffect(()=>{


        if(!running)
            return;



        const interval = setInterval(()=>{


            setTime(prev=>{


                const next = prev - 1;



                if(next <= 0){


                    clearInterval(interval);


                    setRunning(false);


                    onTickRef.current(0);


                    onCompleteRef.current();



                    return 0;

                }



                onTickRef.current(next);



                return next;


            });



        },1000);





        return ()=>clearInterval(interval);



    },[running]);









    function formatTime(seconds:number){


        const minutes = Math.floor(
            seconds / 60
        );



        const secs = seconds % 60;



        return (

            String(minutes)
            .padStart(2,"0")

            +

            ":"

            +

            String(secs)
            .padStart(2,"0")

        );

    }








    return(


        <div className="timer">


            <div className="timer-display">

                {formatTime(time)}

            </div>





            <div className="actions">



                <button


                    onClick={()=>{

                        setRunning(true);

                    }}



                    disabled={running || time <= 0}


                >

                    Start

                </button>







                <button


                    onClick={()=>{

                        setRunning(false);

                    }}


                    disabled={!running}


                >

                    Pause

                </button>




            </div>


        </div>


    )

}



export default Timer;