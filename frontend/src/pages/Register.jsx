import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { UserPlus, AlertCircle, Eye, EyeOff, Sun, Moon, Globe, Shield, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

export default function Register() {
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, verifyOtp } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { toggleLanguage, t, language } = useLanguage();
  const navigate = useNavigate();

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    if (password.length < 8) {
      setError(t('profile', 'errLength') || 'Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const res = await api('POST', '/register', { name, email, password, role: 'admin' });
      if (res.ok) {
        // Automatically login to trigger OTP and save token
        const loginResult = await login(email, password, 'admin');
        if (loginResult.requireOtp) {
          setStep('otp');
        } else if (loginResult.success) {
          navigate('/dashboard');
        } else {
          setError(loginResult.error || 'Erreur lors de la connexion automatique');
        }
      } else {
        setError(res.data?.error || res.data?.message || 'Erreur lors de la création du compte');
      }
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
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
    const result = await verifyOtp(email, password, 'admin', otp);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Code OTP incorrect');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4 pointer-events-none" />

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
            {t('register', 'subtitle')}
          </p>
        </div>

        {/* Right: Card */}
        <div className="rounded-2xl p-8 shadow-2xl border border-white/10 bg-white/5 backdrop-blur-2xl relative overflow-hidden">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

          <div className="relative z-10">
            {step === 'form' && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-1">{t('register', 'title')}</h2>
                </div>

                {error && (
                  <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmitForm} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">{t('register', 'name')}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">{t('register', 'email')}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">{t('register', 'password')}</label>
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
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><UserPlus className="w-4 h-4" />{t('register', 'createAccount')}</>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link to="/login" className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                    {t('register', 'backToLogin')}
                  </Link>
                </div>
              </>
            )}

            {step === 'otp' && (
              <>
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
                    className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
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
          </div>
        </div>
      </div>
    </div>
  );
}
