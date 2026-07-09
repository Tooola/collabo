import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Languages, Sun, Moon, ShieldCheck, Users, Code, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const { t, language, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Gest<span className="text-indigo-500">Pro</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Languages className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link
              to="/register"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all"
            >
              {t('landing', 'cta')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
        >
          {t('landing', 'heroTitle')}
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10"
        >
          {t('landing', 'heroSubtitle')}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-indigo-600 rounded-2xl shadow-xl hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all duration-300"
          >
            {t('landing', 'cta')}
          </Link>
        </motion.div>
      </section>

      {/* Features Hierarchy Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold">{t('landing', 'featuresTitle')}</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Admin */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 shadow-lg"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="text-xl font-bold mb-3">{t('landing', 'featAdminTitle')}</h4>
              <p className="text-slate-600 dark:text-slate-400">{t('landing', 'featAdminDesc')}</p>
            </motion.div>
            {/* Lead */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 shadow-lg"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="text-xl font-bold mb-3">{t('landing', 'featLeadTitle')}</h4>
              <p className="text-slate-600 dark:text-slate-400">{t('landing', 'featLeadDesc')}</p>
            </motion.div>
            {/* Dev */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 shadow-lg"
            >
              <div className="w-14 h-14 rounded-2xl bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center mb-6">
                <Code className="w-8 h-8 text-pink-600 dark:text-pink-400" />
              </div>
              <h4 className="text-xl font-bold mb-3">{t('landing', 'featDevTitle')}</h4>
              <p className="text-slate-600 dark:text-slate-400">{t('landing', 'featDevDesc')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-3xl font-bold mb-16">{t('landing', 'pricingTitle')}</h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col h-full">
            <h4 className="text-xl font-semibold text-slate-500 dark:text-slate-400">{t('landing', 'priceFree')}</h4>
            <div className="my-4 text-4xl font-extrabold">$0</div>
            <ul className="text-left space-y-3 mt-8 flex-1">
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0"/> 1 Project</li>
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0"/> 3 Users</li>
            </ul>
          </div>
          <div className="p-8 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 transform scale-105 flex flex-col h-full">
            <h4 className="text-xl font-semibold text-indigo-200">{t('landing', 'pricePro')}</h4>
            <div className="my-4 text-4xl font-extrabold">$29<span className="text-lg font-normal">/mo</span></div>
            <ul className="text-left space-y-3 mt-8 flex-1">
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0"/> Unlimited Projects</li>
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0"/> 15 Users</li>
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0"/> Priority Support</li>
            </ul>
          </div>
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col h-full">
            <h4 className="text-xl font-semibold text-slate-500 dark:text-slate-400">{t('landing', 'priceEnterprise')}</h4>
            <div className="my-4 text-4xl font-extrabold">$99<span className="text-lg font-normal">/mo</span></div>
            <ul className="text-left space-y-3 mt-8 flex-1">
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0"/> Unlimited Everything</li>
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0"/> Advanced Roles</li>
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0"/> 24/7 Support</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold mb-10 text-center">{t('landing', 'faqTitle')}</h3>
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <h4 className="text-lg font-bold mb-2">{t('landing', 'faq1Q')}</h4>
              <p className="text-slate-600 dark:text-slate-400">{t('landing', 'faq1A')}</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <h4 className="text-lg font-bold mb-2">{t('landing', 'faq2Q')}</h4>
              <p className="text-slate-600 dark:text-slate-400">{t('landing', 'faq2A')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        {t('landing', 'footerText')}
      </footer>
    </div>
  );
}
