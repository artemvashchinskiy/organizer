import { useState } from "react";
import type { FreeNote } from "../../types/freeNote";
import "./FreeNotes.scss";

interface FreeNotesProps {
    notes: FreeNote[];
    onAdd: (text:string) => void;
    onUpdate: (id:number,text:string) => void;
    onDelete: (id:number) => void;
    onMove: (id:number,direction:-1|1) => void;
}

function FreeNotes({ notes, onAdd, onUpdate, onDelete, onMove }: FreeNotesProps){
    const [draft,setDraft] = useState("");
    const [editingId,setEditingId] = useState<number | null>(null);
    const [editingText,setEditingText] = useState("");

    function add(){
        const value = draft.trim();
        if(!value) return;
        onAdd(value);
        setDraft("");
    }

    function startEdit(note:FreeNote){
        setEditingId(note.id);
        setEditingText(note.text);
    }

    function saveEdit(){
        if(editingId === null) return;
        const value = editingText.trim();
        if(!value) return;
        onUpdate(editingId,value);
        setEditingId(null);
        setEditingText("");
    }

    return (
        <section className="free-notes">
            <div className="free-notes-header">
                <div>
                    <h3>Notes</h3>
                    <p>Regular notes not attached to the calendar.</p>
                </div>
            </div>

            <div className="free-notes-form">
                <textarea
                    value={draft}
                    onChange={event=>setDraft(event.target.value)}
                    onKeyDown={event=>{
                        if((event.ctrlKey || event.metaKey) && event.key === "Enter") add();
                    }}
                    placeholder="Write a note..."
                    rows={4}
                />
                <button type="button" onClick={add} disabled={!draft.trim()}>Add note</button>
            </div>

            <div className="free-notes-list">
                {notes.length === 0 ? (
                    <div className="free-notes-empty">No regular notes yet.</div>
                ) : notes.map((note,index) => (
                    <article className="free-note" key={note.id}>
                        {editingId === note.id ? (
                            <>
                                <textarea
                                    value={editingText}
                                    onChange={event=>setEditingText(event.target.value)}
                                    rows={4}
                                    autoFocus
                                />
                                <div className="free-note-actions">
                                    <button type="button" onClick={saveEdit}>Save</button>
                                    <button type="button" onClick={()=>setEditingId(null)}>Cancel</button>
                                </div>
                            </>
                        ) : (
                            <div className="workspace-record">
                                <div className="free-note-text workspace-record-text">{note.text}</div>
                                <div className="workspace-record-actions" aria-label="Note actions">
                                    <button type="button" onClick={()=>onMove(note.id,-1)} disabled={index === 0} aria-label="Move note up" title="Move up">↑</button>
                                    <button type="button" onClick={()=>onMove(note.id,1)} disabled={index === notes.length - 1} aria-label="Move note down" title="Move down">↓</button>
                                    <button type="button" onClick={()=>startEdit(note)} aria-label="Edit note" title="Edit">✎</button>
                                    <button type="button" onClick={()=>onDelete(note.id)} aria-label="Delete note" title="Delete">×</button>
                                </div>
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </section>
    );
}

export default FreeNotes;
