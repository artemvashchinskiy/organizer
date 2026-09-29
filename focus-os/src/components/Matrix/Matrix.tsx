import { useState } from "react";
import type { EisenhowerQuadrant, EisenhowerTask } from "../../types/eisenhower";
import "./Matrix.scss";

interface MatrixProps {
    tasks: EisenhowerTask[];
    onAdd: (text: string, quadrant: EisenhowerQuadrant) => void;
    onToggle: (id: number) => void;
    onUpdate: (id:number,text:string) => void;
    onMove: (id:number,direction:-1|1) => void;
    onDelete: (id: number) => void;
}

const quadrants: {
    id: EisenhowerQuadrant;
    title: string;
    hint: string;
}[] = [
    { id: "urgent-important", title: "Do first", hint: "Urgent + important" },
    { id: "not-urgent-important", title: "Schedule", hint: "Important, not urgent" },
    { id: "urgent-not-important", title: "Delegate", hint: "Urgent, not important" },
    { id: "not-urgent-not-important", title: "Eliminate", hint: "Not urgent + not important" },
];

function Matrix({ tasks, onAdd, onToggle, onUpdate, onMove, onDelete }: MatrixProps) {
    const [draft, setDraft] = useState("");
    const [selectedQuadrant, setSelectedQuadrant] = useState<EisenhowerQuadrant>("urgent-important");
    const [editingId,setEditingId] = useState<number | null>(null);
    const [editingText,setEditingText] = useState("");

    function addTask() {
        const text = draft.trim();
        if (!text) return;
        onAdd(text, selectedQuadrant);
        setDraft("");
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") addTask();
    }

    function startEdit(task:EisenhowerTask){
        setEditingId(task.id);
        setEditingText(task.text);
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
        <section className="matrix">
            <div className="matrix-header">
                <div>
                    <h3>Matrix</h3>
                    <p>Decide what deserves your attention.</p>
                </div>
            </div>

            <div className="matrix-form">
                <input value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={handleKeyDown} placeholder="Add a task..." aria-label="Matrix task" />
                <select value={selectedQuadrant} onChange={event => setSelectedQuadrant(event.target.value as EisenhowerQuadrant)} aria-label="Matrix quadrant">
                    {quadrants.map(quadrant => <option key={quadrant.id} value={quadrant.id}>{quadrant.title}</option>)}
                </select>
                <button type="button" onClick={addTask} disabled={!draft.trim()}>Add</button>
            </div>

            <div className="matrix-grid">
                {quadrants.map(quadrant => {
                    const quadrantTasks = tasks.filter(task => task.quadrant === quadrant.id);
                    return (
                        <div className={`matrix-quadrant matrix-${quadrant.id}`} key={quadrant.id}>
                            <div className="matrix-quadrant-header">
                                <div>
                                    <strong>{quadrant.title}</strong>
                                    <span>{quadrant.hint}</span>
                                </div>
                                <span className="matrix-count">{quadrantTasks.length}</span>
                            </div>

                            <div className="matrix-tasks">
                                {quadrantTasks.length === 0 ? (
                                    <div className="matrix-empty">Nothing here</div>
                                ) : quadrantTasks.map((task,index) => (
                                    <div className={`matrix-task ${task.completed ? "completed" : ""}`} key={task.id}>
                                        {editingId === task.id ? (
                                            <div className="matrix-edit-row">
                                                <input
                                                    value={editingText}
                                                    onChange={event=>setEditingText(event.target.value)}
                                                    onKeyDown={event=>{ if(event.key === "Enter") saveEdit(); }}
                                                    autoFocus
                                                    aria-label="Edit matrix task"
                                                />
                                                <button type="button" onClick={saveEdit}>Save</button>
                                                <button type="button" onClick={()=>setEditingId(null)}>Cancel</button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="matrix-task-text">{task.text}</span>
                                                <div className="matrix-task-actions" aria-label="Task actions">
                                                    <button type="button" className="matrix-check" onClick={() => onToggle(task.id)} aria-label={task.completed ? "Mark incomplete" : "Mark complete"} title={task.completed ? "Mark incomplete" : "Mark complete"}>
                                                        <span className="matrix-checkbox">{task.completed ? "✓" : ""}</span>
                                                    </button>
                                                    <button type="button" onClick={()=>onMove(task.id,-1)} disabled={index === 0} aria-label="Move task up" title="Move up">↑</button>
                                                    <button type="button" onClick={()=>onMove(task.id,1)} disabled={index === quadrantTasks.length - 1} aria-label="Move task down" title="Move down">↓</button>
                                                    <button type="button" onClick={()=>startEdit(task)} aria-label="Edit task" title="Edit">✎</button>
                                                    <button type="button" onClick={() => onDelete(task.id)} aria-label="Delete task" title="Delete">×</button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default Matrix;
