import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import MessageList from '../components/message/MessageList';
import * as api from '../api/message.api';
import type { Message } from '../types/message.types';

export default function MessagePage() {
  const { id: chatId } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getMessages(chatId);
      setMessages(data.messages);
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError('Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  const loadMore = useCallback(async () => {
    if (!chatId || !nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const data = await api.getMessages(chatId, nextCursor);
      setMessages(prev => [...prev, ...data.messages]);
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError('Failed to load more messages.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [chatId, nextCursor, isLoadingMore]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            {chatId && (
              <p className="text-sm text-gray-500 mt-1">Chat ID: {chatId}</p>
            )}
          </div>
          <button
            onClick={fetchMessages}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Refreshing...
              </>
            ) : (
              'Refresh'
            )}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchMessages}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <MessageList
            items={messages}
            isLoading={isLoading}
          />
        </div>

        {nextCursor && !isLoading && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoadingMore ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Loading more...
                </>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
