import { useEffect, useState } from "react";


interface TimerProps {

    remaining:number;

    running:boolean;

    endAt?:number;

    onTick:(seconds:number)=>void;

    onComplete:()=>void;

    onStart?:()=>void;

    onPause?:()=>void;

}



function Timer({

    remaining,

    running,

    endAt,

    onTick,

    onComplete,

    onStart,

    onPause

}:TimerProps){



    const [time,setTime] = useState(
        remaining
    );





    useEffect(()=>{

        if(!running || !endAt){

            setTime(remaining);

            return;

        }


        let completed = false;


        const update = ()=>{

            const seconds = Math.max(

                0,

                Math.ceil(

                    (endAt - Date.now()) / 1000

                )

            );


            setTime(seconds);


            onTick(seconds);


            if(seconds === 0 && !completed){

                completed = true;

                onComplete();

            }

        };


        update();


        const interval = setInterval(update,1000);


        return ()=>{

            completed = true;

            clearInterval(interval);

        };

    },[
        running,
        endAt,
        remaining,
        onTick,
        onComplete
    ]);









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


                        onStart?.();


                    }}


                    disabled={running || time<=0}


                >

                    Start


                </button>









                <button


                    onClick={()=>{


                        onPause?.();


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