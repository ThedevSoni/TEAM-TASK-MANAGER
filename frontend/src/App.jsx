import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Project from './pages/Project';

function Shell() {
  // Auth status decides whether to show the app or login screen.
  const { isAuthenticated } = useAuth();
  // Use the URL hash as a tiny client-side router.
  const [page, setPage] = useState(() => window.location.hash.replace('#', '') || 'dashboard');

  // Keep the selected page in sync with browser back/forward hash changes.
  useEffect(() => {
    const onHashChange = () => setPage(window.location.hash.replace('#', '') || 'dashboard');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Update both the URL hash and local page state when navigating.
  const navigate = (nextPage) => {
    window.location.hash = nextPage;
    setPage(nextPage);
  };

  // Unauthenticated users can only see the login/signup form.
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar currentPage={page} onNavigate={navigate} />
      {/* Main authenticated page area. */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {page === 'projects' ? <Project /> : <Dashboard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    // AuthProvider makes login state available to the whole React app.
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
