import type { Note } from "../../types/note";
import NoteCard from "./NoteCard";


interface NotesListProps {

    notes:Note[];

    onDelete:(id:number)=>void;

    onTick:(id:number, seconds:number)=>void;

    onComplete:(id:number)=>void;

}



function NotesList({

    notes,

    onDelete,

    onTick,

    onComplete

}:NotesListProps){


    return(

        <aside className="notes-list">


            <div className="header">

                Notes

            </div>





            {
                notes.length === 0

                ?


                <div className="small">

                    No notes yet

                </div>



                :



                notes.map(note=>

                    <NoteCard


                        key={note.id}


                        note={note}


                        onDelete={onDelete}



                        onTick={onTick}



                        onComplete={onComplete}


                    />

                )

            }



        </aside>

    )

}


export default NotesList;