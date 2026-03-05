import { useState, useEffect, useCallback } from 'react';
import ChatList from '../components/chat/ChatList';
import ChatForm from '../components/chat/ChatForm';
import * as api from '../api/chat.api';
import type { Chat, CreateChatDto } from '../types/chat.types';

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const fetchChats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.listChats();
      setChats(data);
    } catch (err) {
      setError('Failed to load chats. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleCreate = async (data: CreateChatDto) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const newChat = await api.createChat(data);
      setChats((prev) => [newChat, ...prev]);
      setShowForm(false);
    } catch (err) {
      setError('Failed to create chat. Please try again.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
          <button
            onClick={() => {
              setShowForm((prev) => !prev);
              setSelectedChat(null);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {showForm ? 'Cancel' : '+ New Chat'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {showForm && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Chat</h2>
            <ChatForm
              onSubmit={handleCreate}
              isLoading={isSubmitting}
            />
          </div>
        )}

        {selectedChat && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Selected Chat</p>
                <p className="text-blue-700">{selectedChat.name ?? '(no name)'} — <span className="italic">{selectedChat.type}</span></p>
              </div>
              <button
                onClick={() => setSelectedChat(null)}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <ChatList
            items={chats}
            onSelect={handleSelect}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
