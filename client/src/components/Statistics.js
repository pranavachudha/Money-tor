function Statistics({expenses}) {
    console.log(expenses);

    return (
        <>
            <p>This is the Statistics page.</p>
            {expenses.map((expense) => {
                return <p>{JSON.stringify(expense)}</p>;
            })}
        </>
    )   
}

export default Statistics;