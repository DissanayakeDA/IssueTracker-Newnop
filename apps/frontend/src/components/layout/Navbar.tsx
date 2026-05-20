import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Button from '../common/Button';
import Icon from '../common/Icon';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Icon name="assignment" className="text-xl text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Issue Tracker</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link to="/issues" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              All Issues
            </Link>
            <Link to="/issues/mine" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              My Issues
            </Link>
            <Link to="/issues/create" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              New Issue
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              {user?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
