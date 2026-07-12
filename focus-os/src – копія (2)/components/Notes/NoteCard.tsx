import type { Note } from "../../types/note";
import Timer from "../Timer/Timer";


interface NoteCardProps {

    note:Note;

    onDelete:(id:number)=>void;

    onTick:(id:number, seconds:number)=>void;

    onComplete:(id:number)=>void;

}



function NoteCard({

    note,

    onDelete,

    onTick,

    onComplete

}:NoteCardProps){



    return(

        <div 

            className={
                `
                note-card
                ${note.completed ? "done":""}
                `
            }

        >



            <div className="note-card-header">


                <b>

                    {note.text}

                </b>



                <button

                    onClick={()=>
                        onDelete(note.id)
                    }

                >

                    ✕

                </button>


            </div>





            <div className="small">

                Date:

                {" "}

                {note.date}

            </div>





            {
                !note.completed &&


                <Timer

                    remaining={note.remaining}



                    onTick={(seconds)=>{

                        onTick(

                            note.id,

                            seconds

                        );

                    }}



                    onComplete={()=>{

                        onComplete(

                            note.id

                        );

                    }}

                />

            }





            {
                note.completed &&


                <div className="completed">

                    Completed ✓

                </div>

            }



        </div>

    )

}


export default NoteCard;