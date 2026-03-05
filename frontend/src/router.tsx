import { Routes, Route, Navigate } from 'react-router-dom';

import AuthPage from './pages/AuthPage';

import ChatPage from './pages/ChatPage';

import MessagePage from './pages/MessagePage';


export default function AppRouter() {
  return (
    <Routes>
      
      <Route path="/auth/*" element={<AuthPage />} />
      
      <Route path="/chats/*" element={<ChatPage />} />
      
      <Route path="/chats/:id/messages/*" element={<MessagePage />} />
      
      
      <Route path="/" element={<Navigate to="/auth" replace />} />
      
    </Routes>
  );
}