import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { useEffect, useState } from 'react';


function Profile({user, setUser}) {
    // const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [editingForm, setEditingForm] = useState(false);
    const [updatedUserName, setUpdatedUserName] = useState(user?.name);
    const [gmi, setGMI] = useState('0');
    const [budget, setBudget] = useState('0');
    const [section, setSection] = useState('AccountDetails');

    useEffect(() => {
        const setVariables = async () => {
            try{
                const token = localStorage.getItem('token');
                const finResponse = await fetch('http://localhost:5000/api/finance',{
                    'headers' : {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const finData = await finResponse.json();
            
                setGMI(finData.gmi);
                setBudget(finData.budget);

            } catch (err) {
                console.log('Error while fetching finData: ', err);
            }
        
        }
        setVariables();
    }, []);

    const handleEdit = (e) => {
        e.preventDefault();
        setEditingForm(true);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const financeData = { name: updatedUserName, gmi: gmi, budget: budget}
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/finance',{
                'method': 'POST',
                'headers': {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                'body': JSON.stringify(financeData)
            })

            const data = await response.json();
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);

        } catch (err) {
            console.log('Error editing account details:', err);
        }
        setEditingForm(false);
        return;
    };

    const handleSections = (e) => {
        setSection(e.target.value);
    }

    const handleInvestSections = () => {
        return;
    }

    return (
        <div className='container'>
            <div className='row g-2'>
                <div className='col-3'>
                    <div className='card p-3 mt-3'>
                        <ButtonGroup vertical >
                            <Button className='mb-2'
                             value="AccountDetails"
                             onClick={handleSections}
                             >
                                Account Details
                            </Button>
                            <Button className='mb-2'
                             value="Investments"
                             onClick={handleSections}
                            >
                                Investments
                            </Button>
                            <Button className='mb-2'
                             value="Debts"
                             onClick={handleSections}>
                                Debts
                            </Button>
                            <Button className='mb-2'
                             value="Button"
                             onClick={handleSections}
                             >
                                Button
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>

                {section === 'AccountDetails' &&
                (!editingForm?
                    (<div className="col-9">
                        <div className='card p-3 mt-3'>
                            <h2 className="ms-2 mb-3">Account Details</h2>
                            <div className="card p-3">
                                <div className='d-flex justify-content-between'>
                                    <h4 className='d-inline'>User Details</h4>
                                    <button className='btn btn-outline-danger btn-sm d-inline pe-3 ps-3'
                                    onClick={handleEdit}>
                                        Edit
                                    </button>
                                </div>
                                <p className="mt-1 mb-2 text-muted">User Name: {user?.name}</p>
                                <p className="text-muted mb-2">Mail Id: {user?.email}</p>
                                <p className="text-muted mb-2">Gross Monthly Income: {gmi}</p>
                                <p className="text-muted mb-1">Budget allocation: {budget}</p>
                            </div>
                        </div>
                    </div>) 
                :
                    (
                        <div className="col-9">
                            <div className='card p-3 mt-3'>
                                <h2 className="ms-2 mb-3">Editing Account Details</h2>
                                <form onSubmit={handleSubmit} >
                                    <div className = "mb-3">
                                        <label className="form-label">User Name</label>
                                        <input
                                            type = "text"
                                            className = "form-control"
                                            placeholder = "e.g, John, Sarah"
                                            value = {updatedUserName}
                                            onChange = {(e) => setUpdatedUserName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className = "mb-3">
                                        <label className="form-label">Gross Montly Income</label>
                                        <input
                                            type = "Number"
                                            className = "form-control"
                                            placeholder = "e.g, 25000, 50000"
                                            value = {gmi}
                                            onChange = {(e) => setGMI(e.target.value)}
                                        />
                                    </div>

                                    <div className = "mb-3">
                                        <label className="form-label">Budget</label>
                                        <input
                                            type = "number"
                                            className = "form-control"
                                            value = {budget}
                                            onChange = {(e) => setBudget(e.target.value)}
                                            placeholder = "e.g, 250, 500"
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary w-100">
                                        Submit
                                    </button>
                                    
                                </form>
                            </div>
                        </div>
                    ))
                }

                 {section === 'Investments' &&
                
                    (<div className="col-9">
                        <div className='card p-3 mt-3'>
                            <h2 className="ms-2 mb-3">Investments</h2>
                            <div className="card p-3 card-light">
                                <div className='d-inline-flex p-2 bd-highlight'>
                                
                                    <Button className='me-2 p-2 btn'
                                    value="Stocks"
                                    onClick={handleInvestSections}>
                                        Stocks and ETFs
                                    </Button>
                                
                                    <Button className='me-2 p-2 btn'
                                    value="MFs"
                                    onClick={handleInvestSections}>
                                        Mutual Funds
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>) 
                }

            </div>
        </div>
    );

}

export default Profile;