import type { Note } from "../../types/note";
import Timer from "../Timer/Timer";

interface NoteCardProps {
    note:Note;
    onDelete:(id:number)=>void;
    onMove:(id:number,direction:-1|1)=>void;
    onTick:(id:number, seconds:number)=>void;
    onComplete:(id:number)=>void;
    touch:()=>void;
    onEdit:(note:Note)=>void;
    onStart:(id:number,remaining:number)=>void;
    onPause:(id:number)=>void;
}

function NoteCard({ note,onDelete,onMove,onTick,onComplete,touch,onEdit,onStart,onPause }:NoteCardProps){
    return(
        <div className={`note-card ${note.completed ? "done" : ""} ${note.duplicate ? "duplicate" : ""}`}>
            <div className="note-card-header">
                <div className="note-card-actions" aria-label="Note actions">
                    <button type="button" onClick={()=>onMove(note.id,-1)} aria-label="Move note up" title="Move up">↑</button>
                    <button type="button" onClick={()=>onMove(note.id,1)} aria-label="Move note down" title="Move down">↓</button>
                    <button type="button" onClick={()=>onEdit(note)} aria-label="Edit note" title="Edit">✎</button>
                    <button type="button" onClick={()=>{ touch(); onDelete(note.id); }} aria-label="Delete note" title="Delete">✕</button>
                </div>
                <b className="note-card-title">{note.text}</b>
            </div>

            <div className="small">Date: {" "}{note.date}</div>

            {note.duplicate && (
                <div className="duplicate-warning" style={{background: note.duplicateColor ?? "#fff7cc"}}>
                    Imported {note.date}<br/>
                    ⚠ Duplicate pair #{note.duplicateNumber}<br />
                    {note.duplicateType==="imported" ? "Imported" : "Original"}
                </div>
            )}

            <div className="timer-preview">
                {!note.completed &&
                    <Timer
                        remaining={note.remaining}
                        running={note.running}
                        endAt={note.endAt}
                        onTick={(seconds)=>onTick(note.id,seconds)}
                        onComplete={()=>onComplete(note.id)}
                        onStart={()=>onStart(note.id,note.remaining)}
                        onPause={()=>onPause(note.id)}
                    />
                }
                {note.completed && <div className="completed">Completed ✓</div>}
            </div>
        </div>
    )
}

export default NoteCard;
