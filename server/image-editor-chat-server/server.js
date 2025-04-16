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
  },
});



const dbConfig = {
  host: "localhost",
  user: "root", 
  password: "", 
  database: "image_editor_db", 
};


const pool = mysql.createPool(dbConfig);


async function getMessages(limit = 50) {
  try {
    const connection = await pool.getConnection();

    
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

    connection.release();

    
    return rows.reverse();
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}


async function saveMessage(userId, message) {
  try {
    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      `
      INSERT INTO chat_messages (user_id, message, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
    `,
      [userId, message]
    );

    connection.release();

    return result.insertId;
  } catch (error) {
    console.error("Error saving message:", error);
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
    console.error("Error getting username:", error);
    return "Unknown";
  }
}


io.on("connection", async (socket) => {
  console.log(`User connected: ${socket.id}`);

  
  const messages = await getMessages();
  socket.emit("chat_history", messages);

  
  socket.on("send_message", async (messageData) => {
    try {
      
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
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});


app.get("/", (req, res) => {
  res.send("Chat server is running");
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
});
