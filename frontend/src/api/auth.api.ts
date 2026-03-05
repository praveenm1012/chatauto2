import apiClient from './client';
import type { User, CreateUserDto } from '../types/auth.types';

export interface LoginResponseDto {
  accessToken: string;
}

export async function register(data: CreateUserDto): Promise<User> {
  const response = await apiClient.post<User>('/auth/register', data);
  return response.data;
}

export async function login(data: CreateUserDto): Promise<LoginResponseDto> {
  const response = await apiClient.post<LoginResponseDto>('/auth/login', data);
  return response.data;
}
