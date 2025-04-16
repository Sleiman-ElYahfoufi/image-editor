import React, { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Card, CardBody, Input, Button, Form } from 'reactstrap'
import { io } from 'socket.io-client'

const Chat = () => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  
  const messagesEndRef = useRef(null)
  
  const getUserInfo = () => {
    const userId = localStorage.getItem('userId')
    
    if (!userId) return { userId: null, username: 'Anonymous' }
    
    return { 
      userId: String(userId),
    }
  }
  
  useEffect(() => {
    const { userId } = getUserInfo()
    console.log("Setting current user ID:", userId, typeof userId);
    setCurrentUserId(userId)
  }, [])
  
  useEffect(() => {
    const socketUrl = 'http://localhost:3001'
    const newSocket = io(socketUrl)
    setSocket(newSocket)
    
    newSocket.on('connect', () => {
      console.log('Connected to chat server')
      setLoading(false)
      
      const { userId } = getUserInfo()
      console.log("Updating current user ID on connect:", userId, typeof userId);
      setCurrentUserId(userId)
    })
    
    newSocket.on('chat_history', (history) => {
      console.log("Received chat history:", history);
      const normalizedHistory = history.map(msg => ({
        ...msg,
        userId: String(msg.userId)
      }));
      setMessages(normalizedHistory);
    })
    
    newSocket.on('new_message', (msg) => {
      console.log("Received new message:", msg);
      const normalizedMsg = {
        ...msg,
        userId: String(msg.userId)
      };
      setMessages((prevMessages) => [...prevMessages, normalizedMsg]);
    })
    
    return () => {
      newSocket.disconnect()
    }
  }, [])
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!message.trim() || !socket) return
    
    const { userId } = getUserInfo()
    
    socket.emit('send_message', {
      userId,
      text: message.trim()
    })
    
    setMessage('')
  }
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  const isMyMessage = (msgUserId) => {
    const msgId = String(msgUserId);
    const myId = String(currentUserId);
    
    console.log(`Comparing message ID: "${msgId}" (${typeof msgId}) with current ID: "${myId}" (${typeof myId})`);
    
    return msgId === myId;
  }
  
  if (loading) {
    return (
      <div>
        <Container className="mt-5 text-center text-white">
          <h3>Loading chat...</h3>
        </Container>
      </div>
    )
  }
  
  return (
    <div>
      <Container fluid className="mt-3">
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="shadow border-0 container-bg">
              <CardBody className="p-3">
                <h4 className="text-white mb-3">Group Chat</h4>
                <div 
                  className="chat-messages p-3" 
                  style={{ 
                    height: '60vh', 
                    overflowY: 'auto',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '0.5rem'
                  }}
                >
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`mb-3 ${isMyMessage(msg.userId) ? 'text-end' : ''}`}
                      >
                        <div
                          className={`d-inline-block p-2 rounded ${
                            isMyMessage(msg.userId)
                              ? 'bg-primary text-white'
                              : 'bg-secondary bg-opacity-25 text-white'
                          }`}
                          style={{ maxWidth: '70%', textAlign: 'left' }}
                        >
                          <div className="message-header d-flex justify-content-between align-items-center mb-1">
                            <strong className="me-2">{msg.username}</strong>
                            <small className="text-white-50">{formatTime(msg.timestamp)}</small>
                          </div>
                          <div className="message-text">{msg.text}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-white-50 py-5">
                      <p>No messages yet. Be the first to say hello!</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <Form onSubmit={handleSubmit} className="mt-3">
                  <div className="d-flex">
                    <Input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="input-color border-0 text-white me-2"
                    />
                    <Button 
                      color="primary" 
                      type="submit" 
                      className="btn-color border-0"
                      disabled={!message.trim()}
                    >
                      Send
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Chat