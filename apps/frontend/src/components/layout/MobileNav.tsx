import { Link, useLocation } from 'react-router-dom';
import Icon from '../common/Icon';

const navItems = [
  { label: 'Home', path: '/dashboard', icon: 'dashboard' },
  { label: 'Issues', path: '/issues', icon: 'assignment' },
  { label: 'Create', path: '/issues/create', icon: 'add_circle' },
  { label: 'Mine', path: '/issues/mine', icon: 'person' },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive =
            item.path === '/issues'
              ? location.pathname === '/issues'
              : location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon name={item.icon} className="text-2xl" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
