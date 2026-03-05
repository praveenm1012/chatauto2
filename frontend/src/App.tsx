import { Link } from 'react-router-dom';
import AppRouter from './router';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">chatauto2</h1>
            <div className="flex space-x-4">
              <Link
                to="/auth"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Auth
              </Link>
              <Link
                to="/chats"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Chat
              </Link>
              {/* Message link requires a real chat ID – navigate from the chat list instead */}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AppRouter />
      </main>
    </div>
  );
}

export default App;
