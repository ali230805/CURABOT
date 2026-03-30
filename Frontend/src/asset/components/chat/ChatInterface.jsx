import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createPrediction } from '../../services/api';
import MessageBubble from './MessageBubble';
import SymptomSuggestions from './SymptomSuggestions';
import { FaPaperPlane, FaRobot } from 'react-icons/fa';
import './chat.css';

const ChatInterface = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(Date.now().toString());
  const messagesEndRef = useRef(null);
  const [collectedSymptoms, setCollectedSymptoms] = useState([]);

  useEffect(() => {
    // Initial bot message
    setMessages([
      {
        id: 1,
        content: "Hello! I'm CURABOT, your AI health assistant. Please describe your symptoms, and I'll help you understand possible conditions.",
        isBot: true,
        timestamp: new Date(),
      },
    ]);

    if (socket) {
      socket.on('receive-message', (message) => {
        setMessages((prev) => [...prev, { ...message, id: Date.now() }]);
        
        // If bot response includes a prediction result, navigate to results
        if (message.prediction) {
          navigate('/prediction-result', { state: { prediction: message.prediction } });
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('receive-message');
      }
    };
  }, [socket, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: input,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Emit to server via socket
    socket.emit('send-message', {
      userId: user.id,
      message: input,
      sessionId,
    });

    // Also send to prediction API
    try {
      const response = await createPrediction({
        symptoms: collectedSymptoms,
        rawUserInput: input,
        sessionId,
      });
      
      // If we have a prediction, we'll handle it when socket emits
      // But we can also store the prediction in state
      if (response.data) {
        // Optionally navigate to results page
      }
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSymptomSelect = (symptom) => {
    setCollectedSymptoms((prev) => [...prev, symptom]);
    setInput(symptom.name);
    handleSendMessage();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <FaRobot className="chat-header-icon" />
        <h3>CURABOT Health Assistant</h3>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {loading && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-suggestions">
        <SymptomSuggestions onSelect={handleSymptomSelect} />
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your symptoms here..."
          className="chat-input"
        />
        <button onClick={handleSendMessage} className="chat-send-btn" disabled={loading}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;