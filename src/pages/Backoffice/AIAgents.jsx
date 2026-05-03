import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { aiAgentsService } from '../../services/aiAgentsService';

const JsonPreview = ({ data }) => (
  <pre
    className="mt-4 p-4 rounded-xl text-xs overflow-auto max-h-[320px]"
    style={{
      background: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border)',
      color: 'var(--color-text-secondary)',
    }}
  >
    {JSON.stringify(data, null, 2)}
  </pre>
);

const AgentCard = ({ title, subtitle, onRun, loading, error, data, actions }) => (
  <div
    className="glass-panel rounded-2xl p-5 shadow-custom border transition-all duration-300 hover:-translate-y-0.5"
    style={{
      borderColor: 'var(--color-border)',
      background: 'var(--color-bg-card)',
      boxShadow: 'var(--shadow-custom)',
    }}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--color-text-heading)' }}>
          {title}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {subtitle}
        </p>
      </div>
      <button
        type="button"
        onClick={onRun}
        disabled={loading}
        className="btn-primary inline-flex shrink-0 items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-60"
        style={{
          minHeight: '36px',
          minWidth: '92px',
        }}
      >
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: loading ? 'var(--color-yellow-500)' : 'currentColor' }} />
        {loading ? 'Running' : 'Run'}
      </button>
    </div>

    {actions}

    {error && (
      <div
        className="mt-4 p-3 rounded-lg text-sm"
        style={{ background: 'var(--color-error-bg)', color: 'var(--color-red-500)', border: '1px solid rgba(239,68,68,0.35)' }}
      >
        {error}
      </div>
    )}

    {data ? (
      <div className="mt-4">
        <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>
          Donnees brutes (debug)
        </p>
        <JsonPreview data={data} />
      </div>
    ) : null}
  </div>
);

const Badge = ({ text, tone = 'info' }) => {
  const map = {
    info: { bg: 'var(--color-info-bg)', color: 'var(--color-cyan-400)', border: 'rgba(34,211,238,0.35)' },
    low: { bg: 'var(--color-success-bg)', color: 'var(--color-green-500)', border: 'rgba(34,197,94,0.35)' },
    medium: { bg: 'var(--color-warning-bg)', color: 'var(--color-yellow-500)', border: 'rgba(245,158,11,0.35)' },
    high: { bg: 'var(--color-error-bg)', color: 'var(--color-red-500)', border: 'rgba(239,68,68,0.4)' },
  };
  const style = map[tone] || map.info;
  return (
    <span
      className="px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wide"
      style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
    >
      {text}
    </span>
  );
};

const AIAgents = () => {
  const { t } = useTranslation();

  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsActivityDays, setAnalyticsActivityDays] = useState(7);
  const [analyticsCommunityDays, setAnalyticsCommunityDays] = useState(30);

  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securityData, setSecurityData] = useState(null);
  const [securityMinSeverity, setSecurityMinSeverity] = useState('low');
  const [securityLimit, setSecurityLimit] = useState(120);

  const [i18nLoading, setI18nLoading] = useState(false);
  const [i18nError, setI18nError] = useState('');
  const [i18nData, setI18nData] = useState(null);
  const [i18nLimit, setI18nLimit] = useState(150);
  const [i18nMinConfidence, setI18nMinConfidence] = useState(0);

  const runAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const data = await aiAgentsService.getAnalyticsInsights({
        activityDays: analyticsActivityDays,
        communityDays: analyticsCommunityDays,
      });
      setAnalyticsData(data);
    } catch (err) {
      setAnalyticsError(err?.message || 'Failed to run analytics agent.');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const runSecurity = async () => {
    setSecurityLoading(true);
    setSecurityError('');
    try {
      const data = await aiAgentsService.getSecurityScan({
        minSeverity: securityMinSeverity,
        limit: securityLimit,
      });
      setSecurityData(data);
    } catch (err) {
      setSecurityError(err?.message || 'Failed to run security scan.');
    } finally {
      setSecurityLoading(false);
    }
  };

  const runI18n = async () => {
    setI18nLoading(true);
    setI18nError('');
    try {
      const data = await aiAgentsService.getI18nScan({
        limit: i18nLimit,
        minConfidence: i18nMinConfidence,
      });
      setI18nData(data);
    } catch (err) {
      setI18nError(err?.message || 'Failed to run i18n scan.');
    } finally {
      setI18nLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div
        className="glass-panel rounded-2xl p-6 md:p-7 border shadow-custom"
        style={{
          borderColor: 'var(--color-border)',
          background: 'linear-gradient(135deg, var(--color-bg-card), var(--color-bg-secondary))',
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] font-bold mb-2" style={{ color: 'var(--color-cyan-400)' }}>
              Backoffice automation
            </p>
            <h1 className="font-heading text-3xl font-bold mb-2" style={{ color: 'var(--color-text-heading)' }}>
              {t('admin.aiAgents.title')}
            </h1>
            <p className="max-w-3xl" style={{ color: 'var(--color-text-muted)' }}>{t('admin.aiAgents.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge text="Real-time insights" tone="info" />
            <Badge text="Security-first" tone="medium" />
            <Badge text="i18n intelligence" tone="low" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
            { label: 'Agents disponibles', value: '3' },
            { label: 'Execution live', value: 'ON' },
            { label: 'Copilot IA', value: 'Disabled' },
            { label: 'Etat global', value: 'watch' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl px-3 py-2 border"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }}
            >
              <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{item.label}</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-heading)' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AgentCard
          title={t('admin.aiAgents.analyticsTitle')}
          subtitle={t('admin.aiAgents.analyticsSubtitle')}
          onRun={runAnalytics}
          loading={analyticsLoading}
          error={analyticsError}
          data={analyticsData}
          actions={analyticsData ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Active days</label>
                <input type="number" min={1} max={30} value={analyticsActivityDays} onChange={(e) => setAnalyticsActivityDays(Number(e.target.value || 7))} className="w-16 px-2 py-1 rounded-md text-xs" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
                <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Community days</label>
                <input type="number" min={1} max={90} value={analyticsCommunityDays} onChange={(e) => setAnalyticsCommunityDays(Number(e.target.value || 30))} className="w-16 px-2 py-1 rounded-md text-xs" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
              </div>
              <div className="flex items-center gap-2">
                <Badge text={`Run: ${analyticsData.runId || 'n/a'}`} tone="info" />
                <Badge text={`${analyticsData.durationMs || 0} ms`} tone="info" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Engagement</p>
                <p className="font-bold" style={{ color: 'var(--color-text-heading)' }}>{analyticsData?.metrics?.users?.engagementRate ?? 0}%</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Solve Rate</p>
                <p className="font-bold" style={{ color: 'var(--color-text-heading)' }}>{analyticsData?.metrics?.challenges?.solveRate ?? 0}%</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Battle Completion</p>
                <p className="font-bold" style={{ color: 'var(--color-text-heading)' }}>{analyticsData?.metrics?.battles?.battleCompletionRate ?? 0}%</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Community Posts 30d</p>
                <p className="font-bold" style={{ color: 'var(--color-text-heading)' }}>{analyticsData?.metrics?.community?.postsLast30Days ?? 0}</p>
              </div>
              </div>
            </div>
          ) : null}
        />

        <AgentCard
          title={t('admin.aiAgents.securityTitle')}
          subtitle={t('admin.aiAgents.securitySubtitle')}
          onRun={runSecurity}
          loading={securityLoading}
          error={securityError}
          data={securityData}
          actions={securityData ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Min severity</label>
                <select value={securityMinSeverity} onChange={(e) => setSecurityMinSeverity(e.target.value)} className="px-2 py-1 rounded-md text-xs" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
                <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Limit</label>
                <input type="number" min={1} max={500} value={securityLimit} onChange={(e) => setSecurityLimit(Number(e.target.value || 120))} className="w-20 px-2 py-1 rounded-md text-xs" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
              </div>
              <div className="flex items-center gap-2">
                <Badge text={`Risk: ${securityData.riskLevel || 'low'}`} tone={String(securityData.riskLevel || '').toLowerCase()} />
                <Badge text={`Findings: ${securityData.findingsCount || 0}`} tone="info" />
                <Badge text={`Files: ${securityData.filesScanned || 0}`} tone="info" />
                <Badge text={`${securityData.durationMs || 0} ms`} tone="info" />
              </div>
              <div className="max-h-[220px] overflow-auto pr-1 space-y-2">
                {(securityData.findings || []).slice(0, 8).map((f, idx) => (
                  <div key={`${f.file}-${idx}`} className="p-3 rounded-lg" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Badge text={f.severity} tone={String(f.severity).toLowerCase()} />
                      <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{f.category}</span>
                    </div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--color-text-heading)' }}>{f.message}</p>
                    <p className="text-[11px] mt-1 break-all" style={{ color: 'var(--color-text-muted)' }}>{f.file}{f.line ? `:${f.line}` : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        />

        <AgentCard
          title={t('admin.aiAgents.i18nTitle')}
          subtitle={t('admin.aiAgents.i18nSubtitle')}
          onRun={runI18n}
          loading={i18nLoading}
          error={i18nError}
          data={i18nData}
          actions={(
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {t('admin.aiAgents.i18nLimit')}
                </label>
                <input
                  type="number"
                  min={10}
                  max={1000}
                  value={i18nLimit}
                  onChange={(e) => setI18nLimit(Math.max(10, Math.min(1000, Number(e.target.value || 150))))}
                  className="w-28 px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'var(--color-bg-input)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
                <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Min confidence</label>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.05}
                  value={i18nMinConfidence}
                  onChange={(e) => setI18nMinConfidence(Math.max(0, Math.min(1, Number(e.target.value || 0))))}
                  className="w-20 px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'var(--color-bg-input)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
              {i18nData ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge text={`Findings: ${i18nData.totalFindings || 0}`} tone="info" />
                    <Badge text={`Files: ${i18nData.filesScanned || 0}`} tone="info" />
                    <Badge text={`${i18nData.durationMs || 0} ms`} tone="info" />
                  </div>
                  <div className="max-h-[220px] overflow-auto space-y-2 pr-1">
                    {(i18nData.topFiles || []).slice(0, 8).map((entry) => (
                      <div
                        key={entry.file}
                        className="p-2 rounded-lg text-xs break-all"
                        style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                      >
                        <span className="font-semibold" style={{ color: 'var(--color-text-heading)' }}>{entry.count}</span> - {entry.file}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default AIAgents;

