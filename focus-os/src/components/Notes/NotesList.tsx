import type { Note } from "../../types/note";
import NoteCard from "./NoteCard";

interface NotesListProps {
    notes:Note[];
    onDelete:(id:number)=>void;
    onMove:(id:number,direction:-1|1)=>void;
    onEdit:(note:Note)=>void;
    onTick:(id:number, seconds:number)=>void;
    onComplete:(id:number)=>void;
    touch:()=>void;
    onStart:(id:number,remaining:number)=>void;
    onPause:(id:number)=>void;
}

function NotesList({ notes,onDelete,onMove,onEdit,onTick,onComplete,touch,onStart,onPause }:NotesListProps){
    return(
        <aside className="notes-list">
            <div className="header">Notes</div>
            {notes.length === 0 ?
                <div className="small">No notes yet</div>
                :
                notes.map(note =>
                    <NoteCard
                        key={note.id}
                        note={note}
                        onDelete={onDelete}
                        onMove={onMove}
                        onEdit={onEdit}
                        onTick={onTick}
                        onComplete={onComplete}
                        touch={touch}
                        onStart={onStart}
                        onPause={onPause}
                    />
                )
            }
        </aside>
    )
}

export default NotesList;
