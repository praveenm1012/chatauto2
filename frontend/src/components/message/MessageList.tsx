import type { Message } from '../../types/message.types';

interface MessageListProps {
  items: Message[];
  onSelect?: (item: Message) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString();
  } catch {
    return dateStr;
  }
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

export default function MessageList({
  items,
  onSelect,
  onDelete,
  isLoading = false,
}: MessageListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <svg
          className="animate-spin h-8 w-8 text-blue-500 mb-3"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        <p className="text-gray-500 text-sm">Loading messages...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <svg
          className="h-12 w-12 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <p className="text-gray-500 font-medium">No messages yet</p>
        <p className="text-gray-400 text-sm mt-1">Messages in this chat will appear here.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {items.map((message) => (
        <div
          key={message.id}
          className="p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Sender
                </span>
                <span className="text-xs text-gray-500 font-mono truncate max-w-xs">
                  {message.senderId}
                </span>
              </div>

              <p className="text-gray-900 text-sm leading-relaxed break-words">
                {message.content}
              </p>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                <span>
                  <span className="font-medium text-gray-500">ID:</span>{' '}
                  <span className="font-mono">{truncate(message.id, 20)}</span>
                </span>
                {message.chatId && (
                  <span>
                    <span className="font-medium text-gray-500">Chat:</span>{' '}
                    <span className="font-mono">{truncate(message.chatId, 20)}</span>
                  </span>
                )}
                <span>
                  <span className="font-medium text-gray-500">Sent:</span>{' '}
                  {formatDate(message.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {onSelect && (
                <button
                  onClick={() => onSelect(message)}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                >
                  View
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(message.id)}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
