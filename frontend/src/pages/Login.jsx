import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  // Auth actions come from context so the rest of the app sees session changes.
  const { login, signup, loading } = useAuth();
  // Mode switches between existing-user login and new-user signup.
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  // One form object stores all login/signup inputs.
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Member'
  });

  // Update the matching form field when any input changes.
  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  // Submit either login or signup depending on the current mode.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await signup(form);
      }
    } catch (err) {
      // Prefer detailed validation errors from the backend when available.
      const validationErrors = err.response?.data?.errors;
      const details = Array.isArray(validationErrors)
        ? validationErrors.map((item) => item.message).join(', ')
        : '';

      setError(details || err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {/* App title and short purpose statement. */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-950">Team Task Manager</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to manage projects, assign tasks, and track delivery.
          </p>
        </div>

        {/* Toggle between login and signup form variants. */}
        <div className="mb-4 grid grid-cols-2 rounded-md bg-slate-100 p-1">
          {['login', 'signup'].map((item) => (
            <button
              key={item}
              type="button"
              className={`rounded-md px-3 py-2 text-sm font-medium ${mode === item ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'}`}
              onClick={() => setMode(item)}
            >
              {item === 'login' ? 'Login' : 'Signup'}
            </button>
          ))}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Signup needs name and role; login only needs email/password. */}
          {mode === 'signup' && (
            <>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Name</span>
                <input className="field" name="name" value={form.name} onChange={updateForm} required />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Role</span>
                <select className="field" name="role" value={form.role} onChange={updateForm}>
                  <option>Member</option>
                  <option>Admin</option>
                </select>
              </label>
            </>
          )}

          {/* Email and password are required for both modes. */}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input className="field" type="email" name="email" value={form.email} onChange={updateForm} required />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
            <input
              className="field"
              type="password"
              name="password"
              value={form.password}
              onChange={updateForm}
              minLength={8}
              required
            />
            {mode === 'signup' && (
              <span className="mt-1 block text-xs text-slate-500">Use at least 8 characters.</span>
            )}
          </label>

          {/* Show backend or validation errors directly below the form inputs. */}
          {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
      </section>
    </main>
  );
}
