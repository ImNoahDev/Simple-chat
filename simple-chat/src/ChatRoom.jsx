import React, { useState, useEffect } from 'react';
import WebSocketClient from './WebSocketClient';

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocketClient('ws://localhost:3001');

    ws.onmessage((incomingMessage) => {
      console.log('Received:', incomingMessage);
      setMessages(prevMessages => [...prevMessages, incomingMessage]);
    });

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      const message = {
        text: newMessage,
        timestamp: Date.now(),
      };

      socket.send(message);
      console.log('Sent:', message);

      // Update state with sent message immediately (optimistic update)
      setMessages(prevMessages => [...prevMessages, message]);

      // Clear message input
      setNewMessage('');
    }
  };

  return (
    <div className="w-96 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="h-80 p-4 bg-gray-200 flex flex-col justify-end overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className="mb-2">
            <div className="text-sm text-gray-600">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
            <div className="p-2 bg-blue-200 text-gray-800 rounded-lg">
              {message.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-100 flex items-center">
        <input
          type="text"
          className="flex-1 px-2 py-1 rounded-lg border-gray-300 focus:outline-none focus:ring focus:border-blue-300"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <button
          className="ml-2 px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatRoom;
