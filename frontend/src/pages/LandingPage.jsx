import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Languages, Sun, Moon, ShieldCheck, Users, Code, CheckCircle2,
  Zap, BarChart3, Clock, Lock, Globe2, ArrowRight, Star,
  ChevronDown, ChevronUp, Rocket, TrendingUp, MessageSquare
} from 'lucide-react';
import { useState } from 'react';

const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.12 } } };

export default function LandingPage() {
  const { t, language, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [openFaq, setOpenFaq] = useState(null);

  const stats = [
    { value: '10k+', label: language === 'fr' ? 'Projets gérés' : 'Projects managed' },
    { value: '98%', label: language === 'fr' ? 'Satisfaction client' : 'Customer satisfaction' },
    { value: '3x', label: language === 'fr' ? 'Plus de productivité' : 'More productivity' },
    { value: '24/7', label: language === 'fr' ? 'Support disponible' : 'Support available' },
  ];

  const features = [
    {
      icon: ShieldCheck,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50 dark:bg-indigo-500/10',
      title: t('landing', 'featAdminTitle'),
      desc: t('landing', 'featAdminDesc'),
    },
    {
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-500/10',
      title: t('landing', 'featLeadTitle'),
      desc: t('landing', 'featLeadDesc'),
    },
    {
      icon: Code,
      color: 'text-pink-500',
      bg: 'bg-pink-50 dark:bg-pink-500/10',
      title: t('landing', 'featDevTitle'),
      desc: t('landing', 'featDevDesc'),
    },
  ];

  const perks = [
    { icon: Zap,        label: language === 'fr' ? 'Déploiement instantané' : 'Instant deployment' },
    { icon: Lock,       label: language === 'fr' ? 'Sécurité enterprise' : 'Enterprise security' },
    { icon: BarChart3,  label: language === 'fr' ? 'Analytics en temps réel' : 'Real-time analytics' },
    { icon: Globe2,     label: language === 'fr' ? 'Multi-langue' : 'Multi-language' },
    { icon: Clock,      label: language === 'fr' ? 'Historique complet' : 'Full history' },
    { icon: MessageSquare, label: language === 'fr' ? 'Notifications email' : 'Email notifications' },
  ];

  const plans = [
    {
      name: t('landing', 'priceFree'),
      price: '$0',
      period: '',
      desc: language === 'fr' ? 'Idéal pour démarrer' : 'Perfect to get started',
      features: language === 'fr'
        ? ['1 projet', '3 utilisateurs', 'Gestion des tâches', 'Support communautaire']
        : ['1 project', '3 users', 'Task management', 'Community support'],
      cta: language === 'fr' ? 'Commencer gratuitement' : 'Start for free',
      ctaLink: '/register',
      featured: false,
      badge: null,
    },
    {
      name: t('landing', 'pricePro'),
      price: '$29',
      period: '/mo',
      desc: language === 'fr' ? 'Pour les équipes en croissance' : 'For growing teams',
      features: language === 'fr'
        ? ['Projets illimités', '15 utilisateurs', 'OTP 2FA inclus', 'Rapports avancés', 'Support prioritaire', 'Invitations par e-mail']
        : ['Unlimited projects', '15 users', 'OTP 2FA included', 'Advanced reports', 'Priority support', 'Email invitations'],
      cta: language === 'fr' ? 'Choisir Pro' : 'Get Pro',
      ctaLink: '/register',
      featured: true,
      badge: language === 'fr' ? 'Le plus populaire' : 'Most popular',
    },
    {
      name: t('landing', 'priceEnterprise'),
      price: '$99',
      period: '/mo',
      desc: language === 'fr' ? 'Pour les grandes organisations' : 'For large organizations',
      features: language === 'fr'
        ? ['Tout en Pro', 'Utilisateurs illimités', 'SSO / SAML', 'Tableau de bord custom', 'SLA garanti', 'Account manager dédié']
        : ['Everything in Pro', 'Unlimited users', 'SSO / SAML', 'Custom dashboard', 'Guaranteed SLA', 'Dedicated account manager'],
      cta: language === 'fr' ? 'Nous contacter' : 'Contact us',
      ctaLink: '/register',
      featured: false,
      badge: null,
    },
  ];

  const faqs = [
    {
      q: t('landing', 'faq1Q'),
      a: t('landing', 'faq1A'),
    },
    {
      q: t('landing', 'faq2Q'),
      a: t('landing', 'faq2A'),
    },
    {
      q: language === 'fr' ? 'Comment fonctionne le système OTP ?' : 'How does the OTP system work?',
      a: language === 'fr'
        ? 'À chaque connexion, un code à 6 chiffres valable 5 minutes est envoyé sur votre e-mail. Cela garantit qu\'aucun accès non autorisé ne soit possible, même si votre mot de passe est compromis.'
        : 'At each login, a 6-digit code valid for 5 minutes is sent to your email. This ensures no unauthorized access is possible, even if your password is compromised.',
    },
    {
      q: language === 'fr' ? 'Puis-je ajouter des membres à mon équipe ?' : 'Can I add members to my team?',
      a: language === 'fr'
        ? 'Oui ! Un administrateur peut créer des comptes utilisateurs (Lead ou Dev) et leur envoyer automatiquement un e-mail de bienvenue avec leurs identifiants de connexion.'
        : 'Yes! An administrator can create user accounts (Lead or Dev) and automatically send them a welcome email with their login credentials.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">

      {/* ─── HEADER ─── */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Gest<span className="text-indigo-500">Pro</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
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
              to="/login"
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm"
            >
              {t('landing', 'loginBtn')}
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div variants={stagger} initial="initial" animate="animate" className="relative z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-8">
            <Rocket className="w-4 h-4" />
            {language === 'fr' ? 'La plateforme de gestion de projets' : 'The project management platform'}
          </motion.div>

          <motion.h2 variants={fadeUp}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight"
          >
            {t('landing', 'heroTitle')}
          </motion.h2>

          <motion.p variants={fadeUp}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10"
          >
            {t('landing', 'heroSubtitle')}
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-indigo-600 rounded-2xl shadow-xl hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              {t('landing', 'cta')} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 hover:-translate-y-0.5"
            >
              {t('landing', 'loginBtn')}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-14 bg-white dark:bg-slate-900 border-t border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            >
              <p className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-1">{s.value}</p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-500 mb-3">{language === 'fr' ? 'Fonctionnalités' : 'Features'}</p>
          <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">{t('landing', 'featuresTitle')}</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                whileHover={{ y: -6 }}
                className="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-6`}>
                  <Icon className={`w-7 h-7 ${f.color}`} />
                </div>
                <h4 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{f.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── PERKS GRID ─── */}
      <section className="py-20 bg-indigo-600 dark:bg-indigo-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h3 className="text-3xl font-extrabold text-white mb-3">
              {language === 'fr' ? 'Tout ce dont vous avez besoin' : 'Everything you need'}
            </h3>
            <p className="text-indigo-200 text-lg">{language === 'fr' ? 'Une solution complète, rien de superflu.' : 'A complete solution, nothing unnecessary.'}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {perks.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-2xl px-5 py-4 border border-white/10"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white">{p.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-500 mb-3">{language === 'fr' ? 'Tarifs' : 'Pricing'}</p>
          <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">{t('landing', 'pricingTitle')}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
            {language === 'fr' ? 'Des tarifs transparents. Pas de surprise. Changez de plan à tout moment.' : 'Transparent pricing. No surprises. Change plans anytime.'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              className={`relative rounded-3xl p-8 flex flex-col border transition-all duration-300 hover:shadow-2xl ${
                plan.featured
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-105'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400 text-amber-900 text-xs font-bold shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-current" /> {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h4 className={`text-sm font-bold uppercase tracking-widest mb-2 ${plan.featured ? 'text-indigo-200' : 'text-indigo-500'}`}>{plan.name}</h4>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-5xl font-extrabold">{plan.price}</span>
                  {plan.period && <span className={`text-lg mb-1.5 font-medium ${plan.featured ? 'text-indigo-200' : 'text-slate-400'}`}>{plan.period}</span>}
                </div>
                <p className={`text-sm ${plan.featured ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>{plan.desc}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2.5">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.featured ? 'text-indigo-200' : 'text-indigo-500'}`} />
                    <span className={`text-sm font-medium ${plan.featured ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.ctaLink}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 ${
                  plan.featured
                    ? 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20'
                }`}
              >
                {plan.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Guarantee */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === 'fr' ? '✅ Annulation à tout moment • Aucune carte de crédit requise pour l\'essai gratuit' : '✅ Cancel anytime • No credit card required for the free trial'}
          </p>
        </div>
      </section>

      {/* ─── TESTIMONIAL ─── */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-500 mb-10">{language === 'fr' ? 'Ils nous font confiance' : 'Trusted by teams'}</p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                quote: language === 'fr' ? '"GestPro a complètement transformé la façon dont notre équipe collabore. Les rôles hiérarchiques sont clairs et chacun sait ce qu\'il doit faire."' : '"GestPro completely transformed how our team collaborates. The hierarchical roles are clear and everyone knows what to do."',
                name: 'Sophie Martin',
                role: language === 'fr' ? 'Directrice Produit' : 'Product Director',
              },
              {
                quote: language === 'fr' ? '"La mise en place a pris moins d\'une heure. Le système OTP nous rassure vraiment sur la sécurité des accès."' : '"Setup took less than an hour. The OTP system really reassures us about access security."',
                name: 'Thomas Lefèvre',
                role: language === 'fr' ? 'CTO, Startup Tech' : 'CTO, Tech Startup',
              },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-left"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-current" />)}
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed italic">{item.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-500 mb-3">FAQ</p>
          <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">{t('landing', 'faqTitle')}</h3>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-6 text-left font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === i
                  ? <ChevronUp className="w-5 h-5 shrink-0 text-indigo-500" />
                  : <ChevronDown className="w-5 h-5 shrink-0 text-slate-400" />
                }
              </button>
              {openFaq === i && (
                <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA BAND ─── */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <TrendingUp className="w-12 h-12 text-indigo-200 mx-auto mb-6" />
          <h3 className="text-4xl font-extrabold text-white mb-4">
            {language === 'fr' ? 'Prêt à booster votre équipe ?' : 'Ready to supercharge your team?'}
          </h3>
          <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
            {language === 'fr' ? 'Rejoignez les équipes qui font confiance à GestPro pour gérer leurs projets.' : 'Join the teams that trust GestPro to manage their projects.'}
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 text-base"
          >
            {t('landing', 'cta')} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-10 text-center border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div className="mb-4">
          <span className="text-xl font-black text-slate-900 dark:text-white">Gest<span className="text-indigo-500">Pro</span></span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('landing', 'footerText')}</p>
      </footer>
    </div>
  );
}
