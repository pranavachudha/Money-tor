import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

function Profile() {
    const user = JSON.parse(localStorage.getItem('user'));
    return (
        <div className='container'>
            <div className='row'>
                <div className='card col-3'>
                    <ButtonGroup vertical>
                    <Button>Button</Button>
                    <Button>Button</Button>

                    <DropdownButton
                        as={ButtonGroup}
                        title="Dropdown"
                        id="bg-vertical-dropdown-1"
                    >
                        <Dropdown.Item eventKey="1">Dropdown link</Dropdown.Item>
                        <Dropdown.Item eventKey="2">Dropdown link</Dropdown.Item>
                    </DropdownButton>

                    <Button>Button</Button>
                    <Button>Button</Button>

                    <DropdownButton
                        as={ButtonGroup}
                        title="Dropdown"
                        id="bg-vertical-dropdown-2"
                    >
                        <Dropdown.Item eventKey="1">Dropdown link</Dropdown.Item>
                        <Dropdown.Item eventKey="2">Dropdown link</Dropdown.Item>
                    </DropdownButton>

                    <DropdownButton
                        as={ButtonGroup}
                        title="Dropdown"
                        id="bg-vertical-dropdown-3"
                    >
                        <Dropdown.Item eventKey="1">Dropdown link</Dropdown.Item>
                        <Dropdown.Item eventKey="2">Dropdown link</Dropdown.Item>
                    </DropdownButton>
                    </ButtonGroup>
                </div>
                <div className='card col-9'><p>hello</p></div>
            </div>
            

            
        </div>
    );

}

export default Profile;