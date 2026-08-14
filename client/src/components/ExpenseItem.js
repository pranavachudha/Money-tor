function ExpenseItem({expense, onDelete, onEdit}) {
    return (
        <div className="card mb-2 p-3 d-flex flex-row justify-content-between align-items-center">
            <div>
                <h5 className="mb-1">{expense.category}</h5>
                <small className="text-muted">{expense.description}</small>
                <div className="text-muted">
                    {new Date(expense.date).toLocaleDateString()}
                </div>
                <div className="d-flex flex-column align-items-end gap-2">
                    <span className="fw-bold text-success">INR{expense.amount}</span>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onDelete(expense._id)}
                    >
                        Delete
                    </button>
                    <button 
                        className="btn btn-sm btn-primary"
                        onClick = {() => onEdit(expense)}>
                        Edit
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ExpenseItem;