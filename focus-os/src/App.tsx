import { useEffect, useState } from "react";

import useAuth from "./hooks/useAuth";
import useLocalStorage from "./hooks/useLocalStorage";

import Calendar from "./components/Calendar/Calendar";
import NotePanel from "./components/Notes/NotePanel";
import NotesList from "./components/Notes/NotesList";

import LoginModal from "./components/Auth/LoginModal";
import RegisterModal from "./components/Auth/RegisterModal";
import LockScreen from "./components/Auth/LockScreen";

import type { Note } from "./types/note";

import "./styles/app.scss";



function App(){



    const {

        user,

        loading,

        isLocked,

        lockUntil,

        login,

        logout: authLogout,

        register,

        unlock,

        touch

    } = useAuth();






    const [selectedDate, setSelectedDate] = useState<string | null>(null);


    const [showRegister,setShowRegister] = useState(false);

    const [panelOpen, setPanelOpen] = useState(false);



    const [editingNote, setEditingNote] = useState<Note | null>(null);

    const [notes,setNotes] = useLocalStorage<Note[]>(


        user

        ?

        `calendar-notes-${user.id}`

        :

        "calendar-empty",


        []
    
    );








    

    useEffect(()=>{

        setNotes(prev=>

            prev.map(note=>{

                if(

                    !note.running ||

                    !note.endAt

                ){

                    return note;

                }

                const left = Math.max(

                    0,

                    Math.floor(

                        (note.endAt-Date.now())/1000

                    )

                );

                return {

                    ...note,

                    remaining:left,

                    completed:left===0,

                    running:left>0,

                    finishedAt:
                        left===0
                            ? note.finishedAt ?? Date.now()
                            : note.finishedAt,

                    notified:
                        left===0
                            ? false
                            : note.notified,

                    startedAt:
                        left===0
                            ? undefined
                            : note.startedAt,

                    endAt:
                        left===0
                            ? undefined
                            : note.endAt
                };

            })

        );

    },[]);


    useEffect(() => {

        const unfinishedAlert = notes.some(
            note =>
                note.completed &&
                !note.notified
        );

        let interval: number | undefined;

        function startFlash() {

            if (interval) return;

            let red = false;

            interval = window.setInterval(() => {

                document.title = red
                    ? "🔴 TIMER FINISHED"
                    : "🟡 React Calendar Timer";

                red = !red;

            }, 800);

        }

        function stopFlash() {

            if (interval) {
                clearInterval(interval);
                interval = undefined;
            }

            document.title = "React Calendar Timer";

        }

        function handleVisibilityChange() {

            if (document.hidden) {

                if (unfinishedAlert) {
                    startFlash();
                }

            } else {

                stopFlash();

                setNotes(prev =>
                    prev.map(note =>
                        note.completed && !note.notified
                            ? {
                                ...note,
                                notified: true
                            }
                            : note
                    )
                );

            }

        }

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        // If the timer finished while the tab was already hidden,
        // begin flashing immediately.
        if (document.hidden && unfinishedAlert) {
            startFlash();
        }

        return () => {

            stopFlash();

            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );

        };

    }, [notes, setNotes]);





    function handleLogout(){


        // clear current UI state

        setNotes([]);


        setPanelOpen(false);

        setEditingNote(null);

        setSelectedDate(null);



        // remove authentication session

        authLogout();


    }









    function saveNote(note:Note){

        touch();

        setNotes(prev=>{

            const exists = prev.some(
                n=>n.id===note.id
            );


            if(!exists){

                return [
                    ...prev,
                    note
                ];

            }


            return prev.map(n=>

                n.id===note.id

                ?

                note

                :

                n

            );

        });

    }









    function deleteNote(id:number){

        touch();

        setNotes(prev=>

            prev.filter(

                note=>note.id!==id

            )

        );

    }









function updateTimer(
    id:number,
    seconds:number
){

    setNotes(prev=>

        prev.map(note=>

            note.id === id

            ?

            {
                ...note,
                remaining:seconds
            }

            :

            note

        )

    );

}

    function startTimer(

        id:number,

        remaining:number

    ){

        touch();

        const now = Date.now();

        const end = now + remaining * 1000;

        setNotes(prev=>

            prev.map(note=>

                note.id===id

                ?

                {
                    ...note,

                    running:true,

                    startedAt:now,

                    endAt:end,

                    completed:false,

                    notified:false,

                    finishedAt:undefined
                }

                :

                note

            )

        );

    }


    function pauseTimer(id:number){

        touch();

        setNotes(prev=>

            prev.map(note=>{

                if(note.id!==id)
                    return note;

                const remaining = note.endAt

                    ?

                    Math.max(

                        0,

                        Math.floor(

                            (note.endAt-Date.now())/1000

                        )

                    )

                    :

                    note.remaining;

                return{

                    ...note,

                    remaining,

                    running:false,

                    startedAt:undefined,

                    endAt:undefined

                };

            })

        );

    }






function completeNote(id:number){

    touch();

 


    setNotes(prev=>

        prev.map(note=>

            note.id===id

            ?

            {
                ...note,
                remaining:0,
                completed:true,
                running:false,
                startedAt:undefined,
                endAt:undefined,
                finishedAt:Date.now(),
                notified:false
            }

            :

            note

        )

    );

}


    if(loading){

        return (

            <div className="auth-screen">

                Loading...

            </div>

        );

    }

    // LOCKED

    if(isLocked){


        return (

            <LockScreen

                lockUntil={lockUntil}

                onUnlock={unlock}

            />

        );


    }









    // NOT AUTHENTICATED

    if(!user){



        if(showRegister){


            return (


                <RegisterModal


                    onRegister={async(

                        username,

                        password

                    )=>{


                        const success = await register(

                            username,

                            password

                        );



                        if(success){

                            setShowRegister(false);

                        }



                        return success;


                    }}




                    onLogin={()=>{


                        setShowRegister(false);


                    }}



                />


            );


        }








        return (



            <LoginModal


                onLogin={login}



                onRegister={()=>{


                    setShowRegister(true);


                }}


            />


        );


    }


    const visibleNotes =

        selectedDate

        ?

        notes.filter(
            note=>note.date===selectedDate
        )

        :

        notes;


    return(


        <div className="app">





            <div className="topbar">





                <button

                    className="back"

                    onClick={handleLogout}

                >

                    ◀


                </button>







                <div className="title">


                    React Calendar Timer


                </div>








                <div className="spacer"/>






            </div>









            <div className="body layout">







                <div className="calendar-area">







                    <Calendar


                        notes={notes}



                    onSelectDate={(date)=>{

                        touch();

                        setSelectedDate(date);

                        setEditingNote(null);

                        setPanelOpen(true);

                    }}



                    />


                    {
                        selectedDate &&

                        <button

                            className="show-all-notes"

                            onClick={()=>{

                                setSelectedDate(null); 

                            }}

                        >

                            Show all notes

                        </button>

                    }






                    {
                        panelOpen &&

                        

                        <NotePanel

                            key={editingNote?.id ?? "new"}

                            date={editingNote?.date ?? selectedDate!}

                            note={editingNote}


                            onSave={(note)=>{


                                saveNote(note);

                                setEditingNote(null);

                                setPanelOpen(false);


                            }}



                            onClose={()=>{


                                setEditingNote(null);
                                setPanelOpen(false);


                            }}

                        />


                    }







                </div>









            <NotesList

                notes={visibleNotes}

                onDelete={deleteNote}

                    onEdit={(note)=>{

                    touch();

                    setEditingNote(note);

                    setSelectedDate(note.date);

                    setPanelOpen(true);

                }}

                onTick={updateTimer}

                onComplete={completeNote}

                touch={touch}
                
                onStart={startTimer}

                onPause={pauseTimer}

            />







            </div>



        </div>


    )

}



export default App;