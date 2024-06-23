class WebSocketClient {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.socket.onopen = () => console.log('Connected to WebSocket');
    this.socket.onclose = () => console.log('Disconnected from WebSocket');
    this.socket.onerror = (error) => console.error('WebSocket Error:', error);
    this.socket.onmessage = (event) => this.handleMessage(event);
    this.onmessageCallback = null; // Initialize callback
  }

  send(data) {
    this.socket.send(JSON.stringify(data));
  }

  close() {
    this.socket.close();
  }

  handleMessage(event) {
    const message = JSON.parse(event.data);
    console.log('Received:', message);
    if (this.onmessageCallback) {
      this.onmessageCallback(message);
    }
  }

  onmessage(callback) {
    this.onmessageCallback = callback;
  }
}

export default WebSocketClient;
