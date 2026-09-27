export type ExpenseCategory =
    | "Food"
    | "Transport"
    | "Housing"
    | "Health"
    | "Leisure"
    | "Shopping"
    | "Other";

export interface Expense {
    id: number;
    amount: number;
    category: ExpenseCategory;
    description: string;
    date: string;
    createdAt: number;
}
