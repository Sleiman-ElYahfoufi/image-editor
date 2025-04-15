import React from 'react';
import { Navbar, NavbarBrand, Nav, NavItem, Button } from 'reactstrap';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const AppNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <Navbar className="container-bg mb-4" dark expand="md">
      <NavbarBrand className="ms-3 text-white">
        Photo App
      </NavbarBrand>
      
      <Nav className="me-auto" navbar>
        <NavItem className="mx-2">
          <Link 
            to="/gallery" 
            className={`nav-link ${isActive('/gallery') ? 'active fw-bold selection-color' : 'text-white'}`}
          >
            Gallery
          </Link>
        </NavItem>
        <NavItem className="mx-2">
          <Link 
            to="/chat" 
            className={`nav-link ${isActive('/chat') ? 'active fw-bold selection-color' : 'text-white'}`}
          >
            Chat
          </Link>
        </NavItem>
      </Nav>
      
      <Nav className="ms-auto me-3" navbar>
        <NavItem>
          <Button 
            className='btn-color'
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