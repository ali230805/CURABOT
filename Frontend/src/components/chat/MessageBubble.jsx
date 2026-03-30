import React from 'react';
import { format } from 'date-fns';
import { FaRobot, FaUser } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './chat.css';

const MessageBubble = ({ message }) => {
  const { content, isBot, timestamp } = message;

  return (
    <div className={`message ${isBot ? 'bot' : 'user'}`}>
      <div className="message-avatar">
        {isBot ? <FaRobot /> : <FaUser />}
      </div>
      <div className="message-content-wrapper">
        <div className="message-content">
          {isBot ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          ) : (
            content
          )}
        </div>
        <div className="message-time">
          {format(new Date(timestamp), 'hh:mm a')}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
