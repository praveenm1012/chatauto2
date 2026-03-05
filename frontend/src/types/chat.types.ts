export interface Chat {
  id: string;
  type: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateChatDto {
  type: string;
  name?: string;
  userIds?: string[];
}

export interface UpdateChatDto {
  type?: string;
  name?: string;
}

export interface ChatMember {
  id: string;
  chatId: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateChatMemberDto {
  chatId: string;
  userId: string;
}

export interface UpdateChatMemberDto {
  chatId?: string;
  userId?: string;
}
