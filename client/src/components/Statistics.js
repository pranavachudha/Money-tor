function Statistics({expenses}) {
    const date = new Date();
    const monthName = date.toLocaleString('en-US', { month: 'long' });
    const currentMonth = date.getMonth() + 1;
    const lastMonth = currentMonth - 1;


    const currentMonthData = expenses.filter((expense) => {
        const dateString = expense.date;
        const expense_date = new Date(dateString);

        const expense_month = expense_date.getMonth() + 1;
    
        if (currentMonth === expense_month) {
            return true;
        }

        return false;
    })

    const lastMonthData = expenses.filter((expense) => {
        const dateString = expense.date;
        const expense_date = new Date(dateString);

        const expense_month = expense_date.getMonth() + 1;
    
        if (lastMonth === expense_month) {
            return true;
        }

        return false;
    })

    const lastMonthExpenditure = lastMonthData.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const expenditure = currentMonthData.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const hasData = currentMonthData.length > 0;

    const percentageChange = lastMonthExpenditure === 0 
        ? 100 
        : ((expenditure - lastMonthExpenditure) / lastMonthExpenditure) * 100;
    const percentageChangeRounded = percentageChange.toFixed(1);

    const cumCategory = {};

    for (let i = 0; i < currentMonthData.length; i++) {
        cumCategory[currentMonthData[i].category] = (cumCategory[currentMonthData[i].category] || 0) + currentMonthData[i].amount;
    }

    const max = Math.max(...Object.values(cumCategory))
    const topCategory = Object.keys(cumCategory).filter(k => cumCategory[k] === max);
    

    return (
        <>
        {!hasData ? (
            <div className="container mt-4"> <p className="text-muted">No expenses this month yet.</p></div>
           
        ): (
            <div className="container mt-4">
                <h1>{monthName} Summary</h1>
                <div className="row g-5">
                    <div className="col-12 ">
                        <div className="card p-3 mt-2">
                            <div className="d-flex justify-content-between mb-2">
                                <h5 className="mb-0">Total Expenditure</h5>
                                <h5 className="mb-0"><span className="text-primary">INR </span>{expenditure}</h5>
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                                <h5 className="mb-0">Previous Month Expenditure</h5>
                                <h5 className="mb-0"><span className="text-primary">INR </span>{lastMonthExpenditure}</h5>
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                                <h5 className="mb-0">Percentage Change</h5>
                                <h5 className={percentageChangeRounded >= 0? "text-danger mb-0" : "text-success mb-0"}>
                                    {percentageChange > 0 ? "▲" : "▼"} {Math.abs(percentageChangeRounded)} %
                                </h5>
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                                <h5 className="mb-0">Number of Transactions</h5>
                                <h5 className="mb-0">{currentMonthData.length}</h5>
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                                <h5 className="mb-0">Top Category</h5>
                                <h5 className="mb-0">{topCategory}</h5>
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                                <h5 className="mb-0">Top Category Expense</h5>
                                <h5 className="mb-0"><span className="text-primary">INR </span>{max}</h5>
                            </div>
                        </div>
                    </div>

                   
                </div>
                
                <h1 className="mt-5">Categories</h1>
                <div className="row">
                    <div className="col-12">
                        <div className="card p-3 mt-2">
                            {
                                Object.entries(cumCategory).map(([k, v]) => {
                                    return (
                                        <div key={k} className="d-flex justify-content-between mb-2">
                                            <h5 className="mb-0">{k}</h5>
                                            <h5 className="mb-0"><span className="text-primary">INR </span>{v}</h5>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>)
        }
        </>

    )   
}

export default Statistics;