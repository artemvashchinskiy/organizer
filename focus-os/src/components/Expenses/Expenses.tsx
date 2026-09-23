import { useMemo, useState } from "react";
import type { Expense, ExpenseCategory } from "../../types/expense";
import "./Expenses.scss";

interface ExpensesProps {
    expenses: Expense[];
    onAdd: (amount: number, category: ExpenseCategory, description: string, date: string) => void;
    onUpdate: (id:number,amount:number,category:ExpenseCategory,description:string,date:string) => void;
    onMove: (id:number,direction:-1|1) => void;
    onDelete: (id: number) => void;
}

const categories: ExpenseCategory[] = ["Food", "Transport", "Housing", "Health", "Leisure", "Shopping", "Other"];

function Expenses({ expenses, onAdd, onUpdate, onMove, onDelete }: ExpensesProps) {
    const today = new Date().toISOString().slice(0, 10);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<ExpenseCategory>("Food");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(today);
    const [editingId,setEditingId] = useState<number | null>(null);
    const [editingAmount,setEditingAmount] = useState("");
    const [editingCategory,setEditingCategory] = useState<ExpenseCategory>("Food");
    const [editingDescription,setEditingDescription] = useState("");
    const [editingDate,setEditingDate] = useState(today);

    const todayTotal = useMemo(() => expenses.filter(expense => expense.date === today).reduce((sum, expense) => sum + expense.amount, 0), [expenses, today]);
    const monthPrefix = today.slice(0, 7);
    const monthTotal = useMemo(() => expenses.filter(expense => expense.date.startsWith(monthPrefix)).reduce((sum, expense) => sum + expense.amount, 0), [expenses, monthPrefix]);

    function addExpense() {
        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) return;
        onAdd(numericAmount, category, description.trim(), date);
        setAmount("");
        setDescription("");
        setDate(today);
    }

    function startEdit(expense:Expense){
        setEditingId(expense.id);
        setEditingAmount(String(expense.amount));
        setEditingCategory(expense.category);
        setEditingDescription(expense.description);
        setEditingDate(expense.date);
    }

    function saveEdit(){
        if(editingId === null) return;
        const numericAmount = Number(editingAmount);
        if(!Number.isFinite(numericAmount) || numericAmount <= 0) return;
        onUpdate(editingId,numericAmount,editingCategory,editingDescription,editingDate);
        setEditingId(null);
    }

    return (
        <section className="expenses">
            <div className="expenses-header">
                <div><h3>Expenses</h3><p>One chronological list. No monthly departments.</p></div>
            </div>

            <div className="expenses-summary">
                <div><span>Today</span><strong>{todayTotal.toFixed(2)}</strong></div>
                <div><span>This month</span><strong>{monthTotal.toFixed(2)}</strong></div>
            </div>

            <div className="expenses-form">
                <input type="number" min="0" step="0.01" value={amount} onChange={event => setAmount(event.target.value)} placeholder="Amount" aria-label="Expense amount" />
                <select value={category} onChange={event => setCategory(event.target.value as ExpenseCategory)} aria-label="Expense category">
                    {categories.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
                <input type="text" value={description} onChange={event => setDescription(event.target.value)} placeholder="Description" aria-label="Expense description" />
                <input type="date" value={date} onChange={event => setDate(event.target.value)} aria-label="Expense date" />
                <button type="button" onClick={addExpense} disabled={!Number.isFinite(Number(amount)) || Number(amount) <= 0}>Add</button>
            </div>

            <div className="expenses-list">
                {expenses.length === 0 ? <div className="expenses-empty">No expenses yet</div> : expenses.map((expense,index) => (
                    <div className="expense-row" key={expense.id}>
                        {editingId === expense.id ? (
                            <div className="expense-edit-form">
                                <input type="number" min="0" step="0.01" value={editingAmount} onChange={event=>setEditingAmount(event.target.value)} aria-label="Edit expense amount" />
                                <select value={editingCategory} onChange={event=>setEditingCategory(event.target.value as ExpenseCategory)} aria-label="Edit expense category">
                                    {categories.map(item => <option key={item} value={item}>{item}</option>)}
                                </select>
                                <input type="text" value={editingDescription} onChange={event=>setEditingDescription(event.target.value)} placeholder="Description" aria-label="Edit expense description" />
                                <input type="date" value={editingDate} onChange={event=>setEditingDate(event.target.value)} aria-label="Edit expense date" />
                                <div className="expense-edit-buttons">
                                    <button type="button" onClick={saveEdit}>Save</button>
                                    <button type="button" onClick={()=>setEditingId(null)}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="expense-main">
                                    <strong>{expense.amount.toFixed(2)}</strong>
                                    <div>
                                        <span className="expense-description">{expense.description || "No description"}</span>
                                        <span className="expense-meta">{expense.category} · {expense.date}</span>
                                    </div>
                                </div>
                                <div className="expense-actions" aria-label="Expense actions">
                                    <button type="button" onClick={()=>onMove(expense.id,-1)} disabled={index === 0} aria-label="Move expense up" title="Move up">↑</button>
                                    <button type="button" onClick={()=>onMove(expense.id,1)} disabled={index === expenses.length - 1} aria-label="Move expense down" title="Move down">↓</button>
                                    <button type="button" onClick={()=>startEdit(expense)} aria-label="Edit expense" title="Edit">✎</button>
                                    <button type="button" onClick={() => onDelete(expense.id)} aria-label="Delete expense" title="Delete">×</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Expenses;
