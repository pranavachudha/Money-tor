import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useNavigate, Link } from 'react-router-dom';
import logo from '/home/pranav/Documents/Expense Tracker/client/src/components/logo.png'

function NavBar({ user }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate("/login");
    }
  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark">
        <Container>
          <img src={logo} alt="Logo" />
          <Navbar.Brand>Money-tor</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/statistics">Statistics</Nav.Link>
            <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
          </Nav>

          <Nav className="ms-auto align-items-center gap-3">
            <span className="welcome-text">Welcome, {user?.name}!</span>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </Nav>

        </Container>
      </Navbar>
      <br />
    </>
  );
}

export default NavBar;