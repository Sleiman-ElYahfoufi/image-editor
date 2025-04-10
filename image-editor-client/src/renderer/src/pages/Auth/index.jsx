import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useForm from "../../hooks/useForm";
import { request } from "../../utils/request";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  CardBody, 
  Button, 
  Form,
  FormGroup,
  Label,
  Input,
  Nav, 
  NavItem, 
  NavLink,
  Alert
} from "reactstrap";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, handleFormChange] = useForm({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertColor, setAlertColor] = useState("danger");

  const showTimedAlert = (message, color = "danger") => {
    setAlertMessage(message);
    setAlertColor(color);
    setShowAlert(true);
    
    setTimeout(() => {
      setShowAlert(false);
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      showTimedAlert("Passwords don't match");
      return;
    }
    
    const { confirmPassword, ...submitData } = formData;
    
    try {
      const response = await request({
        body: submitData,
        method: "POST",
        route: isLogin ? "guest/login" : "guest/signup",
      });

      if (response.error) {
        showTimedAlert(response.error);
      } else {
        if(response.success==false){
           showTimedAlert(Object.values(response.payload)[0][0]);
        }else{
          if (isLogin) {
            localStorage.setItem("token", response.payload.user.token);
            await trackLoginDetails(response.payload.user.id);
  
            showTimedAlert("Authentication successful!", "success");
          //  navigate("/dashboard");
          } else {
            showTimedAlert("Authentication successful!", "success");
            setIsLogin(true);
          }
    }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      showTimedAlert("Authentication failed. Please try again.");
    }
  };

  const getLoginDetails = async () => {
    try {
      const response = await fetch('https://ipapi.co/json');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting IP:', error);
      return null;
    }
  };


  const trackLoginDetails = async (userId) => {
    try {
      
      const { latitude, longitude, ip } = await getLoginDetails();
      const response = await request({
        body: {
          user_id: userId,
          ip_address: ip ,
          latitude: latitude ,
          longitude: longitude
        },
        method: "POST",
        route: "user/add-details",
        auth :true
      });
      
      return response;
    } catch (error) {
      console.error('Error tracking login:', error);
      return { error: 'Failed to track login details' };
    }
  };


  return (
    <Container fluid>
      <Row className="justify-content-center align-items-center vh-100">
        <Col md={6} lg={4}>
          <Card className="shadow border-0 container-bg">
            <CardBody className="p-4">
            <Alert
                color={alertColor} 
                isOpen={showAlert} 
                toggle={() => setShowAlert(false)}
                className="mb-3"
              >
                {alertMessage}
              </Alert>
              <Nav tabs className="mb-4 border-bottom-0 d-flex">
                <NavItem className="flex-fill">
                  <NavLink
                    className={`text-center ${isLogin ? "selection-color fw-bold text-white" : "text-white"} border-0 cursor-pointer`}
                    onClick={() => setIsLogin(true)}
                  >
                    Login
                  </NavLink>
                </NavItem>
                <NavItem className="flex-fill">
                  <NavLink
                    className={`text-center ${!isLogin ? "selection-color fw-bold text-white" : "text-white" } border-0 cursor-pointer`}
                    onClick={() => setIsLogin(false)}
                  >
                    Create an account
                  </NavLink>
                </NavItem>
              </Nav>
              
              <h3 className="text-center text-white mb-4">
                {isLogin ? "Login" : "Create an account"}
              </h3>
              
              <Form onSubmit={handleSubmit}>
                <FormGroup className="mb-3">
                  <Label for="email" className="text-white">Email address</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                  className="input-color border-0 text-white"
                  />
                </FormGroup>

                <FormGroup className="mb-3">
                  <Label for="password" className="text-white">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleFormChange}
                    required
                    className="input-color border-0 text-white"

                  />
                </FormGroup>

                {!isLogin && (
                  <FormGroup className="mb-4">
                    <Label for="confirmPassword" className="text-white">Confirm Password</Label>
                    <Input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                      required
                      className="input-color border-0  text-white"
                      />
                  </FormGroup>
                )}

                <Button
                  block
                  size="lg"
                  type="submit"
                  className="mt-2 btn-color border-0"
                >
                  {isLogin ? "Login" : "Create Account"}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Auth;