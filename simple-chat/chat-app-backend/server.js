const WebSocket = require('websocket').server;
const http = require('http');
const sqlite3 = require('sqlite3').verbose();

// Create or open SQLite database
const db = new sqlite3.Database(':memory:'); // In-memory database for demo

// Create messages table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    timestamp TEXT
  )`);
});

const server = http.createServer((req, res) => {
  // Handle HTTP requests if needed
});

const wsServer = new WebSocket({
  httpServer: server,
});

// Array to store active connections
const activeConnections = [];

// Function to broadcast message to all connected clients
const broadcastMessage = (message) => {
  activeConnections.forEach((connection) => {
    connection.sendUTF(JSON.stringify(message));
  });
};

wsServer.on('request', (req) => {
  const connection = req.accept(null, req.origin);

  // Add new connection to activeConnections array
  activeConnections.push(connection);

  // Function to send all messages to the newly connected client
  const sendAllMessages = () => {
    db.all(`SELECT * FROM messages`, (err, rows) => {
      if (err) {
        console.error('Error fetching messages from database:', err.message);
      } else {
        rows.forEach((row) => {
          connection.sendUTF(JSON.stringify(row));
        });
      }
    });
  };

  // Send all messages to the newly connected client
  sendAllMessages();

  // Event listener for incoming messages
  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      const dataFromClient = JSON.parse(message.utf8Data);
      
      // Store message in database
      const { text, timestamp } = dataFromClient;
      db.run(`INSERT INTO messages (text, timestamp) VALUES (?, ?)`, [text, timestamp], (err) => {
        if (err) {
          console.error('Error storing message:', err.message);
        } else {
          console.log('Message stored in database:', dataFromClient);
          // Broadcast the received message to all connected clients
          broadcastMessage(dataFromClient);
        }
      });
    }
  });

  connection.on('close', (reasonCode, description) => {
    // Remove connection from activeConnections array on close
    const index = activeConnections.indexOf(connection);
    if (index !== -1) {
      activeConnections.splice(index, 1);
    }
    // Handle connection close
  });
});

const port = 3001;
server.listen(port, () => {
  console.log(`WebSocket server listening on port ${port}`);
});
