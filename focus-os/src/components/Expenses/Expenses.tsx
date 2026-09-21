import { useMemo, useState } from "react";
import type { Expense, ExpenseCategory } from "../../types/expense";
import "./Expenses.scss";

interface ExpensesProps {
    expenses: Expense[];
    onAdd: (amount: number, category: ExpenseCategory, description: string, date: string) => void;
    onDelete: (id: number) => void;
}

const categories: ExpenseCategory[] = ["Food", "Transport", "Housing", "Health", "Leisure", "Shopping", "Other"];

function Expenses({ expenses, onAdd, onDelete }: ExpensesProps) {
    const today = new Date().toISOString().slice(0, 10);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<ExpenseCategory>("Food");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(today);

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
                {expenses.length === 0 ? <div className="expenses-empty">No expenses yet</div> : expenses.map(expense => (
                    <div className="expense-row" key={expense.id}>
                        <div className="expense-main">
                            <strong>{expense.amount.toFixed(2)}</strong>
                            <div>
                                <span className="expense-description">{expense.description || "No description"}</span>
                                <span className="expense-meta">{expense.category} · {expense.date}</span>
                            </div>
                        </div>
                        <button type="button" className="expense-delete" onClick={() => onDelete(expense.id)} aria-label="Delete expense">×</button>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Expenses;
