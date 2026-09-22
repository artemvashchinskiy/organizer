import type { EisenhowerQuadrant, EisenhowerTask } from "../../types/eisenhower";
import type { Expense, ExpenseCategory } from "../../types/expense";
import type { FreeNote } from "../../types/freeNote";
import Matrix from "../Matrix/Matrix";
import Expenses from "../Expenses/Expenses";
import FreeNotes from "../FreeNotes/FreeNotes";
import "./WorkspaceSidebar.scss";

type WorkspaceView = "notes" | "matrix" | "expenses";

interface WorkspaceSidebarProps {
    open:boolean;
    view:WorkspaceView;
    onOpen:()=>void;
    onClose:()=>void;
    onViewChange:(view:WorkspaceView)=>void;
    freeNotes:FreeNote[];
    onAddFreeNote:(text:string)=>void;
    onUpdateFreeNote:(id:number,text:string)=>void;
    onDeleteFreeNote:(id:number)=>void;
    matrixTasks:EisenhowerTask[];
    onAddMatrixTask:(text:string,quadrant:EisenhowerQuadrant)=>void;
    onToggleMatrixTask:(id:number)=>void;
    onDeleteMatrixTask:(id:number)=>void;
    expenses:Expense[];
    onAddExpense:(amount:number,category:ExpenseCategory,description:string,date:string)=>void;
    onDeleteExpense:(id:number)=>void;
}

function WorkspaceSidebar({
    open,view,onOpen,onClose,onViewChange,
    freeNotes,onAddFreeNote,onUpdateFreeNote,onDeleteFreeNote,
    matrixTasks,onAddMatrixTask,onToggleMatrixTask,onDeleteMatrixTask,
    expenses,onAddExpense,onDeleteExpense
}:WorkspaceSidebarProps){
    return (
        <>
            {open && <div className="workspace-sidebar-overlay" onClick={onClose} />}
            <aside className={`workspace-sidebar ${open ? "open" : ""}`}>
                <div className="workspace-sidebar-handle" onClick={open ? onClose : onOpen} role="button" tabIndex={0} aria-label={open ? "Close workspace" : "Open workspace"}>
                    {open ? "❮" : "☰"}
                </div>

                <div className="workspace-sidebar-header">
                    <strong>FOCUS OS</strong>
                    <button type="button" className="workspace-close" onClick={onClose} aria-label="Close workspace">✕</button>
                </div>

                <nav className="workspace-nav">
                    <button type="button" className={view === "notes" ? "active" : ""} onClick={()=>onViewChange("notes")}>📝 Notes</button>
                    <button type="button" className={view === "matrix" ? "active" : ""} onClick={()=>onViewChange("matrix")}>☐ Matrix</button>
                    <button type="button" className={view === "expenses" ? "active" : ""} onClick={()=>onViewChange("expenses")}>€ Expenses</button>
                </nav>

                <div className="workspace-sidebar-content">
                    {view === "notes" && <FreeNotes notes={freeNotes} onAdd={onAddFreeNote} onUpdate={onUpdateFreeNote} onDelete={onDeleteFreeNote} />}
                    {view === "matrix" && <Matrix tasks={matrixTasks} onAdd={onAddMatrixTask} onToggle={onToggleMatrixTask} onDelete={onDeleteMatrixTask} />}
                    {view === "expenses" && <Expenses expenses={expenses} onAdd={onAddExpense} onDelete={onDeleteExpense} />}
                </div>
            </aside>
        </>
    );
}

export type { WorkspaceView };
export default WorkspaceSidebar;
