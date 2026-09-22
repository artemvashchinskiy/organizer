import { useState } from "react";
import type { EisenhowerQuadrant, EisenhowerTask } from "../../types/eisenhower";
import "./Matrix.scss";

interface MatrixProps {
    tasks: EisenhowerTask[];
    onAdd: (text: string, quadrant: EisenhowerQuadrant) => void;
    onToggle: (id: number) => void;
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

function Matrix({ tasks, onAdd, onToggle, onDelete }: MatrixProps) {
    const [draft, setDraft] = useState("");
    const [selectedQuadrant, setSelectedQuadrant] = useState<EisenhowerQuadrant>("urgent-important");

    function addTask() {
        const text = draft.trim();
        if (!text) return;
        onAdd(text, selectedQuadrant);
        setDraft("");
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") addTask();
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
                                ) : quadrantTasks.map(task => (
                                    <div className={`matrix-task ${task.completed ? "completed" : ""}`} key={task.id}>
                                        <button type="button" className="matrix-check" onClick={() => onToggle(task.id)} aria-label={task.completed ? "Mark incomplete" : "Mark complete"}>
                                            {task.completed ? "✓" : "○"}
                                        </button>
                                        <span>{task.text}</span>
                                        <button type="button" className="matrix-delete" onClick={() => onDelete(task.id)} aria-label="Delete task">×</button>
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
