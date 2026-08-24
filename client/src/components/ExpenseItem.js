function ExpenseItem({ expense, onDelete, onEdit }) {
  return (
    <div className="expense-item">
      <div>
        <div className="expense-category">{expense.category}</div>
        <div className="expense-description">{expense.description}</div>
        <div className="expense-date">
          {new Date(expense.date).toLocaleDateString()}
        </div>
      </div>
      <div className="expense-actions">
        <span className="expense-amount">₹{expense.amount}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(expense._id)}
          >
            Delete
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => onEdit(expense)}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExpenseItem;