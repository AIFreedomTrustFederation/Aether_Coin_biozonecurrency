import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface WebSocketState {
  connected: boolean;
  messages: any[];
  error: string | null;
}

interface WebSocketContextType {
  state: WebSocketState;
  sendMessage: (message: any) => void;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  state: {
    connected: false,
    messages: [],
    error: null
  },
  sendMessage: () => {},
  connect: () => {},
  disconnect: () => {}
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    messages: [],
    error: null
  });

  const socketRef = useRef<WebSocket | null>(null);

  const connect = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connection established');
        setState(prev => ({ ...prev, connected: true, error: null }));
        
        // Send initial subscription message
        socket.send('subscribe');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, data]
          }));
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          setState(prev => ({
            ...prev,
            error: 'Error parsing message from server'
          }));
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({
          ...prev,
          error: 'WebSocket connection error'
        }));
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
        setState(prev => ({ ...prev, connected: false }));
      };

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setState(prev => ({
        ...prev,
        error: `Error connecting to WebSocket: ${error instanceof Error ? error.message : String(error)}`
      }));
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  const sendMessage = (message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(typeof message === 'string' ? message : JSON.stringify(message));
    } else {
      setState(prev => ({
        ...prev,
        error: 'WebSocket is not connected'
      }));
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ state, sendMessage, connect, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;