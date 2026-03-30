import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaClockRotateLeft } from 'react-icons/fa6';
import { fetchChatHistory } from '../../services/api';
import './history-page.css';

const HistoryPage = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 0, total: 0 });

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);

      try {
        const response = await fetchChatHistory(page, 8);
        setHistoryItems(response.data);
        setPagination(response.pagination);
      } catch (error) {
        const message =
          error.response?.data?.message || 'Unable to load your chat history right now.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [page]);

  return (
    <main className="history-page">
      <section className="history-page__panel">
        <div className="history-page__header">
          <div className="history-page__title-wrap">
            <span className="history-page__icon">
              <FaClockRotateLeft />
            </span>
            <div>
              <p className="history-page__eyebrow">Past Conversations</p>
              <h1>Chat History</h1>
            </div>
          </div>
          <p className="history-page__subtitle">
            Review earlier questions and CURABOT responses in one place.
          </p>
        </div>

        {loading ? (
          <div className="history-page__state-card">Loading your history...</div>
        ) : historyItems.length === 0 ? (
          <div className="history-page__state-card">
            No chat history yet. Ask CURABOT a health question to start building your timeline.
          </div>
        ) : (
          <>
            <div className="history-page__list">
              {historyItems.map((item) => (
                <article key={item._id} className="history-page__card">
                  <div className="history-page__meta">
                    <span>{format(new Date(item.createdAt), 'PPP')}</span>
                    <span>{format(new Date(item.createdAt), 'p')}</span>
                  </div>

                  <div className="history-page__block">
                    <p className="history-page__label">You asked</p>
                    <p className="history-page__question">{item.question}</p>
                  </div>

                  <div className="history-page__block">
                    <p className="history-page__label">CURABOT replied</p>
                    <div className="history-page__answer markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.answer}</ReactMarkdown>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {pagination.pages > 1 ? (
              <div className="history-page__pagination">
                <button
                  type="button"
                  onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((currentPage) => Math.min(currentPage + 1, pagination.pages))
                  }
                  disabled={page === pagination.pages}
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
};

export default HistoryPage;
