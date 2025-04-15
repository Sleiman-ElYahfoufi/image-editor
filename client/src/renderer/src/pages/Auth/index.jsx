import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useForm from '../../hooks/useForm'
import { request } from '../../utils/request'
import { setLoading } from '../../state/redux/users/slice' 
import { useDispatch, useSelector } from 'react-redux'
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
  Alert,
  Spinner
} from 'reactstrap'

const Auth = () => {
  const navigate = useNavigate()
  const loading = useSelector((global) => global.users.loading)
  const dispatch = useDispatch()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, handleFormChange] = useForm({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [alertMessage, setAlertMessage] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertColor, setAlertColor] = useState('danger')

  const showTimedAlert = (message, color = 'danger') => {
    setAlertMessage(message)
    setAlertColor(color)
    setShowAlert(true)

    setTimeout(() => {
      setShowAlert(false)
    }, 2000)
  }

  const getLoginDetails = async () => {
    try {
      const response = await fetch('https://ipapi.co/json')
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting IP:', error)
      return null
    }
  }

  const trackLoginDetails = async (userId) => {
    try {
      const { latitude, longitude, ip } = await getLoginDetails()
      const response = await request({
        body: {
          user_id: userId,
          ip_address: ip,
          latitude: latitude,
          longitude: longitude
        },
        method: 'POST',
        route: 'user/add-details',
        auth: true
      })

      return response
    } catch (error) {
      console.error('Error tracking login:', error)
      return { error: 'Failed to track login details' }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    dispatch(setLoading(true))

    if (!isLogin && formData.password !== formData.confirmPassword) {
      showTimedAlert("Passwords don't match")
      dispatch(setLoading(false))
      return
    }

    const { confirmPassword, ...submitData } = formData
    
    // For login, we only need username and password
    const loginData = isLogin ? 
      { username: submitData.username, password: submitData.password } : 
      submitData

    try {
      const response = await request({
        body: loginData,
        method: 'POST',
        route: isLogin ? 'guest/login' : 'guest/signup'
      })

      if (response.error) {
        console.log("response",response)
        showTimedAlert(response.message)
        dispatch(setLoading(false))
      } else {
        if (response.success === false) {
          showTimedAlert(Object.values(response.payload)[0][0])
          dispatch(setLoading(false))
        } else {
          if (isLogin) {
            localStorage.setItem('token', response.payload.user.token)
            localStorage.setItem('userId', response.payload.user.id)          
            await trackLoginDetails(response.payload.user.id)

            showTimedAlert('Authentication successful!', 'success')
            dispatch(setLoading(false))

            navigate("/gallery");
          } else {
            showTimedAlert('Account created successfully!', 'success')
            dispatch(setLoading(false))

            setIsLogin(true)
          }
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
      showTimedAlert('Authentication failed. Please try again.')
      dispatch(setLoading(false))
    }
  }

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
                    className={`text-center ${isLogin ? 'selection-color fw-bold text-white' : 'text-white'} border-0 cursor-pointer`}
                    onClick={() => setIsLogin(true)}
                    disabled={loading}
                  >
                    Login
                  </NavLink>
                </NavItem>
                <NavItem className="flex-fill">
                  <NavLink
                    className={`text-center ${!isLogin ? 'selection-color fw-bold text-white' : 'text-white'} border-0 cursor-pointer`}
                    onClick={() => setIsLogin(false)}
                    disabled={loading}
                  >
                    Create an account
                  </NavLink>
                </NavItem>
              </Nav>

              <h3 className="text-center text-white mb-4">
                {isLogin ? 'Login' : 'Create an account'}
              </h3>

              <Form onSubmit={handleSubmit}>
                <FormGroup className="mb-3">
                  <Label for="username" className="text-white">
                    Username
                  </Label>
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleFormChange}
                    required
                    className="input-color border-0 text-white"
                    disabled={loading}
                  />
                </FormGroup>

                {!isLogin && (
                  <FormGroup className="mb-3">
                    <Label for="email" className="text-white">
                      Email address
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="user@example.com"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      className="input-color border-0 text-white"
                      disabled={loading}
                    />
                  </FormGroup>
                )}

                <FormGroup className="mb-3">
                  <Label for="password" className="text-white">
                    Password
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleFormChange}
                    required
                    className="input-color border-0 text-white"
                    disabled={loading}
                  />
                </FormGroup>

                {!isLogin && (
                  <FormGroup className="mb-4">
                    <Label for="confirmPassword" className="text-white">
                      Confirm Password
                    </Label>
                    <Input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                      required
                      className="input-color border-0 text-white"
                      disabled={loading}
                    />
                  </FormGroup>
                )}

                <Button
                  block
                  size="lg"
                  type="submit"
                  className="mt-2 btn-color border-0"
                  disabled={loading}
                >
                  {loading ? (
                    <span>
                      <Spinner size="sm" color="light" className="me-2" />
                      {isLogin ? 'Logging in...' : 'Creating Account...'}
                    </span>
                  ) : isLogin ? (
                    'Login'
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Auth