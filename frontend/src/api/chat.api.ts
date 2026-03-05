import apiClient from './client';
import type { Chat, CreateChatDto } from '../types/chat.types';

export async function createChat(data: CreateChatDto): Promise<Chat> {
  const response = await apiClient.post<Chat>('/chats', data);
  return response.data;
}

export async function listChats(): Promise<Chat[]> {
  const response = await apiClient.get<{ chats: Chat[] }>('/chats');
  return response.data.chats;
}
