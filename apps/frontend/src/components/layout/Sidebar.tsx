import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Icon from '../common/Icon';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'All Issues', path: '/issues', icon: 'assignment' },
  { label: 'My Issues', path: '/issues/mine', icon: 'person' },
  { label: 'Create Issue', path: '/issues/create', icon: 'add' },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-gray-200 lg:bg-white lg:h-screen lg:fixed lg:top-0 lg:left-0 lg:overflow-y-auto">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-200">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Icon name="assignment" className="text-xl text-white" />
        </div>
        <span className="text-lg font-semibold text-gray-900">Issue Tracker</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.path === '/issues'
              ? location.pathname === '/issues'
              : location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon name={item.icon} className="text-xl" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
            title="Logout"
          >
            <Icon name="logout" className="text-xl" />
          </button>
        </div>
      </div>
    </aside>
  );
}
