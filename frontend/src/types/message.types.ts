export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMessageDto {
  chatId: string;
  senderId: string;
  content: string;
}

export interface UpdateMessageDto {
  id?: string;
  chatId?: string;
  senderId?: string;
  content?: string;
  createdAt?: string;
}

export interface MessageListResponse {
  messages: Message[];
  nextCursor: string | null;
}
