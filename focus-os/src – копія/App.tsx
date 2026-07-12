import { useState } from "react";
import useLocalStorage from "./hooks/useLocalStorage";
import Calendar from "./components/Calendar/Calendar";
import NotePanel from "./components/Notes/NotePanel";
import NotesList from "./components/Notes/NotesList";
import type { Note } from "./types/note";
import "./styles/app.scss";


function App(){


    const [notes,setNotes] = useLocalStorage<Note[]>(

        "calendar-notes",

        []

    );



    const [selectedDate,setSelectedDate] = useState<string | null>(null);






    function saveNote(note:Note){


        setNotes(prev=>[

            ...prev,

            note

        ]);

    }







    function deleteNote(id:number){


        setNotes(prev=>

            prev.filter(

                note=>note.id !== id

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







    function completeNote(id:number){


        setNotes(prev=>


            prev.map(note=>


                note.id === id


                ?

                {

                    ...note,

                    remaining:0,

                    completed:true

                }


                :


                note


            )

        );


    }








    return(


        <div className="app">



            <div className="topbar">



                <button className="back">

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


                            setSelectedDate(date);


                        }}



                    />







                    {
                        selectedDate &&




                        <NotePanel



                            date={selectedDate}



                            onSave={(note)=>{



                                saveNote(note);



                                setSelectedDate(null);



                            }}




                            onClose={()=>{



                                setSelectedDate(null);



                            }}




                        />

                    }






                </div>









                <NotesList



                    notes={notes}



                    onDelete={deleteNote}



                    onTick={updateTimer}



                    onComplete={completeNote}



                />






            </div>



        </div>


    )

}



export default App;