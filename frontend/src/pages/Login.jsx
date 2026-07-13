import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LogIn, AlertCircle, Shield, User, Code, Sun, Moon, Eye, EyeOff, ArrowLeft, Globe } from 'lucide-react';

const ROLES = [
  {
    id: 'admin',
    titleKey: 'adminTitle',
    subtitleKey: 'adminSubtitle',
    icon: Shield,
    accent: 'from-blue-500 to-indigo-600',
    border: 'border-blue-400/30 hover:border-blue-400/60',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-300',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  },
  {
    id: 'lead',
    titleKey: 'leadTitle',
    subtitleKey: 'leadSubtitle',
    icon: User,
    accent: 'from-amber-500 to-orange-500',
    border: 'border-amber-400/30 hover:border-amber-400/60',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-300',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
  },
  {
    id: 'dev',
    titleKey: 'devTitle',
    subtitleKey: 'devSubtitle',
    icon: Code,
    accent: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-400/30 hover:border-emerald-400/60',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-300',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
  },
];

export default function Login() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role'); // e.g. ?role=lead
  const validRoles = ['admin', 'lead', 'dev'];
  const preselected = validRoles.includes(initialRole) ? initialRole : null;

  const [step, setStep] = useState(preselected ? 'form' : 'role');
  const [selectedRole, setSelectedRole] = useState(preselected);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  // Forgot / Reset flow
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const { login, verifyOtp, forgotPassword, resetPassword } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { toggleLanguage, t, language } = useLanguage();
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setError('');
    setEmail('');
    setPassword('');
    setOtp('');
    setStep('form');
  };

  const handleBack = () => {
    setStep('role');
    setSelectedRole(null);
    setError('');
    setSuccessMsg('');
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) { setError('Veuillez saisir votre adresse e-mail'); return; }
    setError('');
    setLoading(true);
    const result = await forgotPassword(forgotEmail.trim());
    setLoading(false);
    if (result.success) {
      setSuccessMsg(t('login', 'forgotSuccess'));
    } else {
      setError(result.error || 'Une erreur est survenue');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPass.length < 8) { setError(t('login', 'resetErrLength')); return; }
    if (newPass !== confirmPass) { setError(t('login', 'resetErrMatch')); return; }
    setError('');
    setLoading(true);
    const result = await resetPassword(forgotEmail.trim(), resetCode, newPass);
    setLoading(false);
    if (result.success) {
      setSuccessMsg(t('login', 'resetSuccess'));
      // After 2 seconds go back to login form
      setTimeout(() => {
        setStep('form');
        setSuccessMsg('');
        setForgotEmail('');
        setResetCode('');
        setNewPass('');
        setConfirmPass('');
      }, 2000);
    } else {
      setError(result.error || 'Code invalide ou expiré');
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setError('');
    setLoading(true);
    const result = await login(email.trim(), password, selectedRole);
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    } else if (result.requireOtp) {
      setStep('otp');
    } else {
      setError(result.error || 'Email ou mot de passe incorrect');
    }
  };

  const handleSubmitOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Veuillez entrer le code OTP');
      return;
    }
    setError('');
    setLoading(true);
    const result = await verifyOtp(email.trim(), password, selectedRole, otp);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Code OTP incorrect');
    }
  };

  const role = selectedRole ? ROLES.find(r => r.id === selectedRole) : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 pointer-events-none" />

      {/* Top Controls */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-3">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 shadow-lg transition-all duration-200"
        >
          <Globe className="w-5 h-5" />
          <span className="text-sm font-bold uppercase">{language}</span>
        </button>
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 shadow-lg transition-all duration-200 hover:scale-110"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="relative w-full max-w-4xl grid md:grid-cols-2 gap-10 items-center z-10">

        {/* Left: Branding */}
        <div className="text-white space-y-6 hidden md:block px-4">
          <div>
            <h1 className="text-6xl font-black tracking-tight">
              Gest<span className="text-indigo-400">Pro</span>
            </h1>
            <div className="h-1 w-16 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-3" />
          </div>
          <p className="text-lg text-slate-300 max-w-sm leading-relaxed">
            {t('login', 'welcome')}
          </p>
          {role && (
            <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${role.badgeBg}`}>
              <role.icon className="w-4 h-4" />
              {t('login', role.titleKey)}
            </div>
          )}
        </div>

        {/* Right: Card */}
        <div className="rounded-2xl p-8 shadow-2xl border border-white/10 bg-white/5 backdrop-blur-2xl relative overflow-hidden">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

          <div className="relative z-10">
            {step === 'role' && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-1">👋 Hello</h2>
                  <p className="text-slate-400 text-sm">{t('login', 'chooseRole')}</p>
                </div>
                <div className="grid gap-3">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleSelectRole(r.id)}
                      className={`group flex items-center gap-4 p-4 rounded-xl border ${r.border} bg-white/5 hover:bg-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg text-left w-full`}
                    >
                      <div className={`p-3 rounded-xl ${r.iconBg} shrink-0`}>
                        <r.icon className={`w-6 h-6 ${r.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-base">{t('login', r.titleKey)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{t('login', r.subtitleKey)}</p>
                      </div>
                      <LogIn className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 'form' && (
              <>
                <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  {t('login', 'back')}
                </button>

                <div className="flex items-center gap-4 mb-8">
                  <div className={`p-3 rounded-xl ${role.iconBg} shrink-0`}>
                    <role.icon className={`w-6 h-6 ${role.iconColor}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{t('login', role.titleKey)}</h2>
                  </div>
                </div>

                {error && (
                  <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmitForm} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">{t('login', 'email')}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@test.com"
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">{t('login', 'password')}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="********"
                        className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(s => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="text-right mt-1.5">
                      <button
                        type="button"
                        onClick={() => setStep('forgot')}
                        className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        {t('login', 'forgotPassword')}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r ${role.accent} hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><LogIn className="w-4 h-4" />{t('login', 'signIn')}</>
                    )}
                  </button>
                </form>
              </>
            )}

            {step === 'otp' && (
              <>
                <button onClick={() => setStep('form')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  {t('login', 'back')}
                </button>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">{t('login', 'otpRequired')}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">{t('login', 'otpMessage')}</p>
                </div>

                {error && (
                  <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmitOtp} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">{t('login', 'otpCode')}</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      placeholder="123456"
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-center tracking-[0.5em] text-2xl font-mono focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r ${role.accent} hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><Shield className="w-4 h-4" />{t('login', 'verify')}</>
                    )}
                  </button>
                </form>
              </>
            )}

            {step === 'forgot' && (
              <>
                <button
                  onClick={() => { setStep('form'); setError(''); setSuccessMsg(''); setForgotEmail(''); }}
                  className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('login', 'back')}
                </button>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-1">{t('login', 'forgotTitle')}</h2>
                  <p className="text-sm text-slate-400">{t('login', 'forgotSubtitle')}</p>
                </div>

                {error && (
                  <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />{error}
                  </div>
                )}

                {successMsg && (
                  <div className="mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
                    <p className="font-semibold mb-1">{successMsg}</p>
                    <button
                      onClick={() => { setSuccessMsg(''); setStep('reset'); }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                    >
                      {t('login', 'resetTitle')} →
                    </button>
                  </div>
                )}

                {!successMsg && (
                  <form onSubmit={handleForgotSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">{t('login', 'forgotEmailLabel')}</label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="user@example.com"
                        autoFocus
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t('login', 'forgotSendCode')}
                    </button>
                  </form>
                )}
              </>
            )}

            {step === 'reset' && (
              <>
                <button
                  onClick={() => { setStep('forgot'); setError(''); setSuccessMsg(''); }}
                  className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('login', 'back')}
                </button>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-1">{t('login', 'resetTitle')}</h2>
                  <p className="text-sm text-slate-400">{t('login', 'resetSubtitle')}</p>
                </div>

                {error && (
                  <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />{error}
                  </div>
                )}

                {successMsg && (
                  <div className="mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
                    {successMsg}
                  </div>
                )}

                {!successMsg && (
                  <form onSubmit={handleResetSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">{t('login', 'resetCodeLabel')}</label>
                      <input
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        placeholder="123456"
                        autoFocus
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-center tracking-[0.5em] text-2xl font-mono focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">{t('login', 'resetNewPassLabel')}</label>
                      <input
                        type="password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">{t('login', 'resetConfirmPassLabel')}</label>
                      <input
                        type="password"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || resetCode.length < 6}
                      className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t('login', 'resetConfirm')}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
