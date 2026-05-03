import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentPage, onNavigate }) {
  // Read current user information and logout action from auth context.
  const { user, logout } = useAuth();

  // Navigation options shown in the header.
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'projects', label: 'Projects' }
  ];

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand button always returns to the dashboard. */}
        <button
          type="button"
          className="text-left text-lg font-semibold text-slate-950"
          onClick={() => onNavigate('dashboard')}
        >
          Team Task Manager
        </button>

        {/* Page navigation buttons highlight the active page. */}
        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`btn ${currentPage === item.id ? 'bg-slate-900 text-white' : 'btn-secondary'}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Current user summary and logout action. */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
