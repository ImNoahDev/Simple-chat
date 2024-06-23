import React, { useState, useEffect } from 'react';
import WebSocketClient from './WebSocketClient';

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    // Create a WebSocket connection when component mounts
    const ws = new WebSocketClient('ws://localhost:3001');

    // Event listener for when the WebSocket connection is open
    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    // Event listener for incoming messages
    ws.onmessage = (message) => {
      console.log('Received:', message);

      // Update state with the received message
      setMessages(prevMessages => [...prevMessages, message]);
    };

    // Set the WebSocket instance to state
    setSocket(ws);

    // Clean-up function to close WebSocket connection
    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (messageInput.trim() !== '') {
      const newMessage = {
        text: messageInput.trim(),
        timestamp: new Date().toLocaleString(),
      };

      // Send message to the WebSocket server
      socket.send(JSON.stringify(newMessage));
      console.log('Sent:', newMessage);

      // Update state with the sent message
      setMessages(prevMessages => [...prevMessages, newMessage]);

      // Clear message input field
      setMessageInput('');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className="flex flex-col items-start">
              <div className="bg-blue-500 text-white py-2 px-4 rounded-lg max-w-xs">
                <p className="break-all">{msg.text}</p>
                <span className="text-xs text-gray-400">{msg.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center bg-gray-200 p-4">
        <input
          type="text"
          className="flex-1 border rounded-lg py-2 px-4 mr-2"
          placeholder="Type your message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          onClick={sendMessage} // Ensure this is correctly bound
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
