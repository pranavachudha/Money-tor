import ExpenseItem from "./ExpenseItem";

function ExpenseList({expenses, onDelete}) {
    if (expenses.length === 0) {
        return <p className="text-center text-muted">No Expenses yet. Add one Above!</p>
    }

    const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

    return (
        <div>
            <h4 className="mb-3">Your Expenses</h4>
            {expenses.map((expense) => {
                return <ExpenseItem
                    key={expense._id}
                    expense={expense}
                    onDelete={onDelete}
                />
            })}
            <div className="text-end mt-3">
                <h5>Total: <span className="text-danger">INR{total}</span></h5>
            </div>
        </div>
    )
}

export default ExpenseList;