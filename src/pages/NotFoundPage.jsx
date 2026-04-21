import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './Frontoffice/auth/context/AuthContext';

const NotFoundPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isLoggedIn, currentUser } = useAuth();

    const role = String(currentUser?.role || '').toUpperCase();
    const isAdmin = role === 'ADMIN' || role === 'ORGANIZER';

    const primaryAction = isAdmin
        ? { label: t('notFound.goDashboard'), to: '/admin' }
        : { label: t('notFound.goChallenges'), to: '/challenges' };

    const secondaryAction = isLoggedIn
        ? { label: t('notFound.goLeaderboard'), to: '/leaderboard' }
        : { label: t('notFound.returnHome'), to: '/' };

    return (
        <main className="min-h-screen relative overflow-hidden font-body" style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
            <div className="absolute inset-0 z-0">
                <div className="absolute -top-20 -right-24 w-[420px] h-[420px] rounded-full blur-[90px] opacity-70" style={{ background: 'var(--color-orb-cyan)' }} />
                <div className="absolute -bottom-24 -left-24 w-[460px] h-[460px] rounded-full blur-[100px] opacity-60" style={{ background: 'var(--color-orb-blue)' }} />
                <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(var(--color-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-grid-line) 1px, transparent 1px)`, backgroundSize: '42px 42px', maskImage: 'radial-gradient(ellipse at center, black 42%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 42%, transparent 100%)' }} />
            </div>

            <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-10 sm:px-8 lg:px-12">
                <div className="grid w-full items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-widest" style={{ borderColor: 'var(--color-border)', color: 'var(--color-cyan-400)', background: 'rgba(34,211,238,0.08)' }}>
                            <span className="inline-block h-2 w-2 rounded-full" style={{ background: 'var(--color-cyan-400)', boxShadow: '0 0 0 6px rgba(34,211,238,0.14)' }} />
                            ROUTE NOT FOUND
                        </div>

                        <h1 className="font-heading text-6xl font-black leading-[0.88] sm:text-7xl lg:text-8xl" style={{ color: 'var(--color-text-heading)' }}>
                            {t('notFound.code')}
                        </h1>

                        <div>
                            <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: 'var(--color-text-heading)' }}>
                                {t('notFound.title')}
                            </h2>
                            <p className="mt-3 max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: 'var(--color-text-muted)' }}>
                                {t('notFound.body')}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => navigate(primaryAction.to)}
                                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5"
                                style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.95), rgba(59,130,246,0.92))', color: '#05131f', boxShadow: '0 12px 28px rgba(34,211,238,0.22)' }}
                            >
                                {primaryAction.label}
                            </button>
                            <button
                                onClick={() => navigate(secondaryAction.to)}
                                className="inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5"
                                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', background: 'rgba(15,23,42,0.32)' }}
                            >
                                {secondaryAction.label}
                            </button>
                        </div>
                    </div>

                    <div className="glass-panel relative overflow-hidden rounded-2xl border p-6 sm:p-7" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="absolute inset-0 opacity-75" style={{ background: 'linear-gradient(145deg, rgba(34,211,238,0.09), rgba(15,23,42,0.03) 38%, rgba(59,130,246,0.12))' }} />
                        <div className="relative">
                            <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--color-cyan-400)' }}>
                                Arena Navigator
                            </p>
                            <div className="mt-4 space-y-3">
                                <div className="rounded-xl border p-3" style={{ borderColor: 'var(--color-border)', background: 'rgba(15,23,42,0.38)' }}>
                                    <p className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Requested Route</p>
                                    <p className="mt-1 font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>/unknown-sector</p>
                                </div>
                                <div className="rounded-xl border p-3" style={{ borderColor: 'var(--color-border)', background: 'rgba(15,23,42,0.38)' }}>
                                    <p className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Suggested Jump</p>
                                    <p className="mt-1 font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>{primaryAction.to}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default NotFoundPage;
