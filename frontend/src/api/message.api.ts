import apiClient from './client';
import type { MessageListResponse } from '../types/message.types';

export async function getMessages(
  chatId: string,
  cursor?: string
): Promise<MessageListResponse> {
  const params: Record<string, string> = {};
  if (cursor) {
    params.cursor = cursor;
  }
  const response = await apiClient.get<MessageListResponse>(
    `/chats/${chatId}/messages`,
    { params }
  );
  return response.data;
}
