function Statistics({expenses}) {
    const date = new Date();
    const monthName = date.toLocaleString('en-US', { month: 'long' });
    const currentMonth = date.getMonth() + 1;
    const currentMonthData = expenses.filter((expense) => {
        const dateString = expense.date;
        const expense_date = new Date(dateString);

        const expense_month = expense_date.getMonth() + 1;
    
        if (currentMonth === expense_month) {
            return expense;
        }
    })

    let expenditure = 0
    currentMonthData.map((expense) => {
        expenditure += expense.amount;
    });








    return (
        <>
            <div className="container mt-4">
                <h1>{monthName}</h1>
                <div className="row ge-5 mt-3">
                    <div className="col-6 ">
                        <div className="card p-3">
                            <h4 className="card-title fw-bold">Expenses</h4>
                            <p className="card-text fs-5"><span className="text-danger">INR</span> {expenditure}</p>
                        </div>
                    </div>

                    <div className="col-6 ">
                        <div className="card p-3 ">
                            <h4 className="card-title fw-bold">Top Category</h4>
                            <p className="card-text fs-5"><span className="text-primary">Category with Highest Expense</span></p>
                        </div>
                    </div>
                   
                </div>
                
            </div>

        {/* {expenses.map((expense) => {
            return <span>{JSON.stringify(expense)}</span>
        })}    */}
        </>

    )   
}

export default Statistics;