const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true,
  },
});

const dbConfig = {
  host: "database",
  user: "root",
  password: "lara",
  database: "image_editor_db",
  port: 3306,

};

console.log("Database configuration:", {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  // Not logging password for security reasons
});

const pool = mysql.createPool(dbConfig);

// Function to test database connection
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Successfully connected to MySQL database!");
    
    // Test a simple query
    const [rows] = await connection.execute("SELECT 1 as test");
    console.log("✅ Test query successful:", rows);
    
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    console.error("Full error:", error);
    return false;
  }
}

// Test connection when server starts
testDatabaseConnection();

async function getMessages(limit = 50) {
  try {
    const connection = await pool.getConnection();
    console.log("Getting chat messages from database...");

    const [rows] = await connection.execute(
      `
      SELECT m.id, m.user_id as userId, u.username, m.message as text, m.created_at as timestamp
      FROM chat_messages m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC
      LIMIT ?
    `,
      [limit]
    );

    console.log(`Retrieved ${rows.length} messages from database`);
    connection.release();

    return rows.reverse();
  } catch (error) {
    console.error("❌ Database error when getting messages:", error.message);
    return [];
  }
}

async function saveMessage(userId, message) {
  try {
    const connection = await pool.getConnection();
    console.log(`Saving message from user ID ${userId}`);

    const [result] = await connection.execute(
      `
      INSERT INTO chat_messages (user_id, message, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
    `,
      [userId, message]
    );

    console.log(`Message saved with ID: ${result.insertId}`);
    connection.release();

    return result.insertId;
  } catch (error) {
    console.error("❌ Error saving message:", error.message);
    return null;
  }
}

async function getUsername(userId) {
  try {
    const connection = await pool.getConnection();

    const [rows] = await connection.execute(
      `
      SELECT username FROM users WHERE id = ?
    `,
      [userId]
    );

    connection.release();

    return rows.length > 0 ? rows[0].username : "Unknown";
  } catch (error) {
    console.error("❌ Error getting username:", error.message);
    return "Unknown";
  }
}

io.on("connection", async (socket) => {
  console.log(`User connected: ${socket.id}`);

  const messages = await getMessages();
  socket.emit("chat_history", messages);

  socket.on("send_message", async (messageData) => {
    try {
      console.log("Received new message:", {
        userId: messageData.userId,
        messageLength: messageData.text?.length || 0
      });
      
      const messageId = await saveMessage(messageData.userId, messageData.text);

      if (messageId) {
        const username = await getUsername(messageData.userId);

        const fullMessage = {
          id: messageId,
          userId: messageData.userId,
          username: username,
          text: messageData.text,
          timestamp: new Date().toISOString(),
        };

        io.emit("new_message", fullMessage);
        console.log("Message broadcast to all clients");
      }
    } catch (error) {
      console.error("❌ Error processing message:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.get("/", (req, res) => {
  res.send("Chat server is running with enhanced logging");
});

// Add a health check endpoint that also checks DB connection
app.get("/health", async (req, res) => {
  const dbConnected = await testDatabaseConnection();
  
  if (dbConnected) {
    res.status(200).json({ 
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(500).json({ 
      status: "unhealthy",
      database: "disconnected",
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Chat server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});