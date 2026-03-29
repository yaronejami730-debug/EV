import { useState, FormEvent } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

type View = 'signin' | 'signup' | 'forgot';

const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Email ou mot de passe incorrect.',
  'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter.',
  'User already registered': 'Un compte existe déjà avec cet email.',
  'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères.',
  'Unable to validate email address: invalid format': 'Format d\'email invalide.',
};

function friendlyError(msg: string): string {
  for (const [key, val] of Object.entries(ERROR_MESSAGES)) {
    if (msg.includes(key)) return val;
  }
  return msg;
}

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [view, setView] = useState<View>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  // Sign in
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');

  // Sign up
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm] = useState('');

  // Forgot password
  const [fpEmail, setFpEmail] = useState('');

  function reset() {
    setError('');
    setSuccess('');
    setLoading(false);
  }

  function switchView(v: View) {
    reset();
    setView(v);
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!siEmail || !siPassword) { setError('Remplissez tous les champs.'); return; }
    setLoading(true);
    try {
      await signIn(siEmail, siPassword);
      onClose();
    } catch (err: unknown) {
      setError(friendlyError((err as Error).message));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!suName.trim() || !suEmail || !suPassword) { setError('Remplissez tous les champs.'); return; }
    if (suPassword.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    if (suPassword !== suConfirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true);
    try {
      await signUp(suEmail, suPassword, suName.trim());
      setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
    } catch (err: unknown) {
      setError(friendlyError((err as Error).message));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!fpEmail) { setError('Entrez votre email.'); return; }
    setLoading(true);
    try {
      await resetPassword(fpEmail);
      setSuccess('Email envoyé ! Vérifiez votre boîte mail pour réinitialiser votre mot de passe.');
    } catch (err: unknown) {
      setError(friendlyError((err as Error).message));
    } finally {
      setLoading(false);
    }
  }

  const titles: Record<View, string> = {
    signin: 'Connexion',
    signup: 'Créer un compte',
    forgot: 'Mot de passe oublié',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-box auth-modal"
        initial={{ y: 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 32, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="auth-modal-header-left">
            {view !== 'signin' && (
              <button className="auth-back-btn" onClick={() => switchView('signin')}>
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <div className="auth-logo">leboncoin</div>
              <h2 className="modal-title">{titles[view]}</h2>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">

          {/* Tabs sign in / sign up */}
          {view !== 'forgot' && (
            <div className="auth-tabs">
              <button
                className={`auth-tab ${view === 'signin' ? 'active' : ''}`}
                onClick={() => switchView('signin')}
              >
                Se connecter
              </button>
              <button
                className={`auth-tab ${view === 'signup' ? 'active' : ''}`}
                onClick={() => switchView('signup')}
              >
                Créer un compte
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* ── Sign In ── */}
            {view === 'signin' && (
              <motion.form
                key="signin"
                className="auth-form"
                onSubmit={handleSignIn}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
              >
                <div className="auth-field">
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="auth-icon" />
                    <input
                      type="email"
                      placeholder="Adresse email"
                      value={siEmail}
                      onChange={e => setSiEmail(e.target.value)}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-icon" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Mot de passe"
                      value={siPassword}
                      onChange={e => setSiPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button type="button" className="auth-toggle-pwd" onClick={() => setShowPwd(p => !p)}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="button" className="auth-forgot-link" onClick={() => switchView('forgot')}>
                  Mot de passe oublié ?
                </button>

                {error && <AuthError msg={error} />}
                {success && <AuthSuccess msg={success} />}

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : 'Se connecter'}
                </button>

                <div className="auth-divider"><span>ou</span></div>

                <button type="button" className="auth-social-btn google" onClick={() => {}}>
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continuer avec Google
                </button>
              </motion.form>
            )}

            {/* ── Sign Up ── */}
            {view === 'signup' && (
              <motion.form
                key="signup"
                className="auth-form"
                onSubmit={handleSignUp}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
              >
                <div className="auth-field">
                  <div className="auth-input-wrapper">
                    <User size={16} className="auth-icon" />
                    <input
                      type="text"
                      placeholder="Nom complet"
                      value={suName}
                      onChange={e => setSuName(e.target.value)}
                      autoComplete="name"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="auth-icon" />
                    <input
                      type="email"
                      placeholder="Adresse email"
                      value={suEmail}
                      onChange={e => setSuEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-icon" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Mot de passe (min. 6 caractères)"
                      value={suPassword}
                      onChange={e => setSuPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button type="button" className="auth-toggle-pwd" onClick={() => setShowPwd(p => !p)}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <PasswordStrength password={suPassword} />
                </div>

                <div className="auth-field">
                  <div className={`auth-input-wrapper ${suConfirm && suConfirm !== suPassword ? 'error' : ''}`}>
                    <Lock size={16} className="auth-icon" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Confirmer le mot de passe"
                      value={suConfirm}
                      onChange={e => setSuConfirm(e.target.value)}
                      autoComplete="new-password"
                    />
                    {suConfirm && suConfirm === suPassword && (
                      <CheckCircle size={16} color="#22C55E" style={{ flexShrink: 0 }} />
                    )}
                  </div>
                </div>

                {error && <AuthError msg={error} />}
                {success && <AuthSuccess msg={success} />}

                {!success && (
                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? <span className="auth-spinner" /> : 'Créer mon compte'}
                  </button>
                )}

                <p className="auth-terms">
                  En créant un compte, vous acceptez nos{' '}
                  <a href="#">Conditions générales d'utilisation</a> et notre{' '}
                  <a href="#">Politique de confidentialité</a>.
                </p>
              </motion.form>
            )}

            {/* ── Forgot Password ── */}
            {view === 'forgot' && (
              <motion.form
                key="forgot"
                className="auth-form"
                onSubmit={handleForgot}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="auth-forgot-desc">
                  Entrez votre adresse email. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>

                <div className="auth-field">
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="auth-icon" />
                    <input
                      type="email"
                      placeholder="Adresse email"
                      value={fpEmail}
                      onChange={e => setFpEmail(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                {error && <AuthError msg={error} />}
                {success && <AuthSuccess msg={success} />}

                {!success && (
                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? <span className="auth-spinner" /> : 'Envoyer le lien'}
                  </button>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────
function AuthError({ msg }: { msg: string }) {
  return (
    <div className="auth-alert auth-alert-error">
      <AlertCircle size={15} />
      <span>{msg}</span>
    </div>
  );
}

function AuthSuccess({ msg }: { msg: string }) {
  return (
    <div className="auth-alert auth-alert-success">
      <CheckCircle size={15} />
      <span>{msg}</span>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#16A34A'];

  return (
    <div className="pwd-strength">
      <div className="pwd-bars">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="pwd-bar" style={{ background: i <= score ? colors[score] : '#E5E7EB' }} />
        ))}
      </div>
      <span style={{ color: colors[score], fontSize: 11, fontWeight: 700 }}>{labels[score]}</span>
    </div>
  );
}
