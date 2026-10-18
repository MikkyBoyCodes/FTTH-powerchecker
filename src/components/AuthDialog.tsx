import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';

type Props = {
  onClose: () => void;
  onToast: (message: string) => void;
};

const AuthDialog = ({ onClose, onToast }: Props) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp } = useAuth();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
        onToast('Signed in successfully.');
      } else {
        const active = await signUp(email.trim(), password, displayName.trim() || email.trim());
        onToast(
          active
            ? 'Account created and signed in. You can now post jobs.'
            : 'Account created. Check your email to confirm, then sign in.'
        );
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="install-guide-backdrop" role="presentation" onClick={onClose}>
      <section
        className="auth-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="install-guide-close icon-button"
          aria-label="Close account dialog"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <div className="install-guide-symbol">
          <Logo size="md" alt="" />
        </div>
        <p className="eyebrow">FIBERLINKGUARD / ACCOUNT</p>
        <h2 id="auth-title">{mode === 'signin' ? 'Sign in to post jobs' : 'Create an account'}</h2>
        <p className="auth-sub">
          Anyone can browse job listings. Sign in to post, edit or remove your own listings.
        </p>

        {!isSupabaseConfigured ? (
          <div className="auth-unconfigured">
            <strong>Backend not connected</strong>
            <span>
              Add your Supabase keys to <code>.env</code> and run <code>supabase/schema.sql</code>,
              then restart the server. See the README for steps.
            </span>
          </div>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            {mode === 'signup' && (
              <div>
                <label className="field-label" htmlFor="auth-name">
                  Display name
                </label>
                <input
                  id="auth-name"
                  className="text-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Otega Field Services"
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label className="field-label" htmlFor="auth-email">
                Email
              </label>
              <input
                id="auth-email"
                className="text-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="auth-password">
                Password
              </label>
              <input
                id="auth-password"
                className="text-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button className="primary-button full-button" type="submit" disabled={busy}>
              {busy ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>

            <button
              type="button"
              className="auth-switch"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
            >
              {mode === 'signin'
                ? 'New here? Create an account'
                : 'Already have an account? Sign in'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

export default AuthDialog;
