import { useState } from 'react';
import type { CreateChatDto } from '../../types/chat.types';

interface ChatFormProps {
  onSubmit: (data: CreateChatDto) => Promise<void>;
  initialData?: Partial<CreateChatDto>;
  isLoading?: boolean;
}

interface FormErrors {
  type?: string;
  name?: string;
  userIds?: string;
}

export default function ChatForm({ onSubmit, initialData, isLoading }: ChatFormProps) {
  const [type, setType] = useState<string>(initialData?.type ?? 'group');
  const [name, setName] = useState<string>(initialData?.name ?? '');
  const [userIdsInput, setUserIdsInput] = useState<string>(
    initialData?.userIds?.join(', ') ?? ''
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!type.trim()) {
      newErrors.type = 'Type is required.';
    }

    if (type === 'private') {
      const ids = userIdsInput.split(',').map((s) => s.trim()).filter(Boolean);
      if (ids.length !== 1) {
        newErrors.userIds = 'Private chats require exactly one other user ID.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    const userIds = userIdsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: CreateChatDto = {
      type: type.trim(),
      ...(name.trim() ? { name: name.trim() } : {}),
      ...(userIds.length > 0 ? { userIds } : {}),
    };

    try {
      await onSubmit(payload);
      // Reset form on success
      setType('group');
      setName('');
      setUserIdsInput('');
      setErrors({});
    } catch {
      setSubmitError('Submission failed. Please check your input and try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {submitError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      {/* Type */}
      <div>
        <label htmlFor="chat-type" className="block text-sm font-medium text-gray-700 mb-1">
          Type <span className="text-red-500">*</span>
        </label>
        <select
          id="chat-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.type ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
          } disabled:opacity-50`}
        >
          <option value="group">Group</option>
          <option value="private">Private</option>
          <option value="channel">Channel</option>
        </select>
        {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
      </div>

      {/* Name */}
      <div>
        <label htmlFor="chat-name" className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <input
          id="chat-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          placeholder="e.g. Team Announcements"
          className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
          } disabled:opacity-50`}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      {/* User IDs */}
      <div>
        <label htmlFor="chat-userids" className="block text-sm font-medium text-gray-700 mb-1">
          User IDs{' '}
          <span className="text-gray-400 text-xs">
            {type === 'private' ? '(required — one ID)' : '(optional — comma-separated)'}
          </span>
        </label>
        <input
          id="chat-userids"
          type="text"
          value={userIdsInput}
          onChange={(e) => setUserIdsInput(e.target.value)}
          disabled={isLoading}
          placeholder="e.g. user-uuid-1, user-uuid-2"
          className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.userIds ? 'border-red-400 bg-red-50' : 'border-gray-300'
          } disabled:opacity-50`}
        />
        {errors.userIds && <p className="mt-1 text-xs text-red-600">{errors.userIds}</p>}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {isLoading ? 'Creating…' : 'Create Chat'}
        </button>
      </div>
    </form>
  );
}
