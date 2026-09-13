import ExpenseItem from './ExpenseItem';

function ExpenseList({ expenses, onDelete, onEdit }) {
  if (expenses.length === 0) {
    return <p className="empty-state">No expenses yet. Add one above!</p>;
  }

  console.log(expenses)
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  return (
    <div>
      <p className="section-title">Your Expenses</p>
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense._id}
          expense={expense}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
      <div className="total-bar mb-2">
        Total: <span>₹{total}</span>
      </div>
    </div>
  );
}

export default ExpenseList;