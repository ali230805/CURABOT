import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import MessageBubble from './MessageBubble';
import { sendChatQuestion } from '../../services/api';
import './chat-page.css';

const INITIAL_MESSAGE = {
  id: 'welcome-message',
  content:
    'Hello! I am CURABOT, your AI health assistant. Describe your symptoms or use one of the quick prompts below, and I will provide general guidance.',
  isBot: true,
  timestamp: new Date().toISOString(),
};

const QUICK_PROMPTS = [
  { label: 'Headache', prompt: 'I have a headache and mild fatigue. What should I watch for?' },
  { label: 'Fever', prompt: 'I have had a fever since yesterday. When should I seek medical help?' },
  { label: 'Cough', prompt: 'I have a dry cough and sore throat. What are common next steps?' },
  { label: 'Body Pain', prompt: 'I have body pain with weakness. What could be causing it?' },
  { label: 'Cold', prompt: 'I think I have a cold. What self-care steps should I take?' },
  { label: 'Dizziness', prompt: 'I feel dizzy on and off today. What symptoms should I monitor?' },
];

const ChatPage = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSubmitting]);

  const submitQuestion = async (rawQuestion) => {
    const trimmedQuestion = rawQuestion.trim();

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitQuestion(question);
  };

  const hasMessages = messages.length > 1;

  return (
    <main className="chat-page">
      <section className="chat-page__panel">
        <div className="chat-page__hero">
          <div>
            <p className="chat-page__eyebrow">Symptom Input Page</p>
            <h1>Health Assessment</h1>
            <p className="chat-page__subtitle">
              Describe symptoms, ask a health question, or tap a quick prompt to begin the CURABOT
              conversation flow.
            </p>
          </div>

          <div className="chat-page__hero-note">
            <strong>General guidance only</strong>
            <span>For emergencies or rapidly worsening symptoms, contact a medical professional immediately.</span>
          </div>
        </div>

        <div className="chat-page__quick-prompts">
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item.label}
              type="button"
              className="chat-page__prompt"
              onClick={() => submitQuestion(item.prompt)}
              disabled={isSubmitting}
            >
              {item.label}
            </button>
          ))}
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
              Try a symptom prompt above or ask about self-care, prevention, or when to seek help.
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="chat-page__composer" onSubmit={handleSubmit}>
          <label className="chat-page__label" htmlFor="health-question">
            Share your symptoms
          </label>
          <textarea
            id="health-question"
            className="chat-page__textarea"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Example: I have had a sore throat and mild fever for two days. What should I watch for?"
            rows={4}
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
