import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import MessageBubble from './MessageBubble';
import { sendChatQuestion } from '../../services/api';
import './chat-page.css';

const INITIAL_MESSAGE = {
  id: 'welcome-message',
  content:
    'Ask a health-related question and CURABOT will provide general guidance. For emergencies or severe symptoms, contact a medical professional immediately.',
  isBot: true,
  timestamp: new Date().toISOString(),
};

const ChatPage = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const hasMessages = useMemo(() => messages.length > 1, [messages.length]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      const validationMessage = 'Please enter a health-related question.';
      setError(validationMessage);
      toast.error(validationMessage);
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      content: trimmedQuestion,
      isBot: false,
      timestamp: new Date().toISOString(),
    };

    setQuestion('');
    setError('');
    setMessages((prev) => [...prev, userMessage]);
    setIsSubmitting(true);

    try {
      const response = await sendChatQuestion(trimmedQuestion);
      const botMessage = {
        id: `bot-${Date.now()}`,
        content: response.data.answer,
        isBot: true,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        'Unable to get a response right now. Please try again.';

      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="chat-page">
      <section className="chat-page__panel">
        <div className="chat-page__hero">
          <p className="chat-page__eyebrow">AI Health Assistant</p>
          <h1>Chat with CURABOT</h1>
          <p className="chat-page__subtitle">
            Get general health guidance with a clean request-response flow built for future expansion.
          </p>
        </div>

        <div className="chat-page__messages" aria-live="polite">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isSubmitting && (
            <div className="chat-page__loading-card">
              <span className="chat-page__loading-dot"></span>
              <span>Thinking through your question...</span>
            </div>
          )}

          {!hasMessages && !isSubmitting && (
            <div className="chat-page__empty-state">
              Try asking about symptoms, prevention, self-care, or when to seek medical help.
            </div>
          )}
        </div>

        <form className="chat-page__composer" onSubmit={handleSubmit}>
          <label className="chat-page__label" htmlFor="health-question">
            Your question
          </label>
          <textarea
            id="health-question"
            className="chat-page__textarea"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Example: I have had a sore throat and mild fever for two days. What should I watch for?"
            rows={5}
            maxLength={2000}
            disabled={isSubmitting}
          />

          <div className="chat-page__composer-footer">
            <span className="chat-page__hint">{question.trim().length}/2000 characters</span>
            <button className="chat-page__submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Question'}
            </button>
          </div>

          {error ? <p className="chat-page__error">{error}</p> : null}
        </form>
      </section>
    </main>
  );
};

export default ChatPage;
