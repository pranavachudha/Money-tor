import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

function Profile() {
    const user = JSON.parse(localStorage.getItem('user'));
    return (
        <div className='container'>
            <div className='row g-2'>
                <div className='col-3'>
                    <div className='card p-3 mt-3'>
                        <ButtonGroup vertical >
                            <Button className='mb-2'>Account Details</Button>
                            <Button className='mb-2'>Investment</Button>
                            <Button className='mb-2'>Debts</Button>
                            <Button className='mb-2'>Button</Button>
                        </ButtonGroup>
                    </div>
                </div>

                <div className="col-9">
                    <div className='card p-3 mt-3'>
                        <h2 className="ms-2 mb-3">Account Details</h2>
                        <div className="card p-3">
                            <div className='d-flex justify-content-between'>
                                <h4 className='d-inline'>User Details</h4>
                                <button className='btn btn-outline-danger btn-sm d-inline pe-3 ps-3'>Edit</button>
                            </div>
                            <p className="mt-1 mb-2 text-muted">User Name: {user?.name}</p>
                            <p className="text-muted mb-2">Mail Id: {user?.email}</p>
                            <p className="text-muted mb-2">Gross Monthly Income: 0</p>
                            <p className="text-muted mb-1">Budget allocation: 0</p>
                            
                            
                        </div>
                        {/* <div className="card p-3 mt-2">
                            <h4>Investment Details</h4>
                            <p className="mt-1 mb-2 text-muted">User Name: {user?.name}</p>
                            <p className="text-muted">Mail Id: {user?.email}</p>
                        </div> */}

                    </div>
                </div>
            </div>
        </div>
    );

}

export default Profile;