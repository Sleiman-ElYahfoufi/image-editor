import React from 'react';
import { Navbar, NavbarBrand, Nav, NavItem, Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

const AppNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    
    navigate('/');
  };

  return (
    <Navbar className="container-bg mb-4" dark expand="md">
      <NavbarBrand className="ms-3 text-white">
        Photo Gallery
      </NavbarBrand>
      <Nav className="ms-auto me-3" navbar>
        <NavItem>
          <Button 
            color="danger" 
            size="sm" 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </NavItem>
      </Nav>
    </Navbar>
  );
};

export default AppNavbar;