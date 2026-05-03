import React, { useEffect, useMemo, useState } from 'react';
import { supportService } from '../../features/support/supportService';

const STATUS_OPTIONS = [
  { value: '', label: 'All status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_review', label: 'In review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'All categories' },
  { value: 'contact_support', label: 'Contact support' },
  { value: 'report_bug', label: 'Bug reports' },
  { value: 'schedule_meeting', label: 'Meetings' },
];

const formatDate = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString();
};

const normalizeCounts = (counts = []) => counts.reduce((acc, item) => {
  if (item?._id) acc[item._id] = item.count || 0;
  return acc;
}, {});

const statusTone = (status) => {
  const map = {
    pending: { bg: 'var(--color-warning-bg)', color: 'var(--color-yellow-500)', border: 'rgba(245,158,11,0.35)' },
    in_review: { bg: 'var(--color-info-bg)', color: 'var(--color-cyan-400)', border: 'rgba(34,211,238,0.35)' },
    resolved: { bg: 'var(--color-success-bg)', color: 'var(--color-green-500)', border: 'rgba(34,197,94,0.35)' },
    closed: { bg: 'var(--color-bg-input)', color: 'var(--color-text-muted)', border: 'var(--color-border)' },
  };
  return map[status] || map.pending;
};

const SupportCenter = () => {
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState({ total: 0, statusCounts: [], categoryCounts: [] });
  const [selectedId, setSelectedId] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadRequests = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await supportService.getAdminRequests({ page: 1, limit: 25, status, category });
        if (cancelled) return;
        const items = Array.isArray(data?.items) ? data.items : [];
        setRequests(items);
        setMeta({
          total: data?.total || 0,
          statusCounts: Array.isArray(data?.statusCounts) ? data.statusCounts : [],
          categoryCounts: Array.isArray(data?.categoryCounts) ? data.categoryCounts : [],
        });
        setSelectedId((current) => (items.some((item) => item._id === current) ? current : items[0]?._id || ''));
      } catch (err) {
        if (cancelled) return;
        setRequests([]);
        setSelectedId('');
        setError(err?.message || 'Unable to load support requests.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadRequests();

    return () => {
      cancelled = true;
    };
  }, [status, category]);

  const selectedRequest = useMemo(
    () => requests.find((item) => item._id === selectedId) || requests[0] || null,
    [requests, selectedId],
  );

  const statusCounts = useMemo(() => normalizeCounts(meta.statusCounts), [meta.statusCounts]);
  const categoryCounts = useMemo(() => normalizeCounts(meta.categoryCounts), [meta.categoryCounts]);

  const refreshRequests = async () => {
    const data = await supportService.getAdminRequests({ page: 1, limit: 25, status, category });
    const items = Array.isArray(data?.items) ? data.items : [];
    setRequests(items);
    setMeta({
      total: data?.total || 0,
      statusCounts: Array.isArray(data?.statusCounts) ? data.statusCounts : [],
      categoryCounts: Array.isArray(data?.categoryCounts) ? data.categoryCounts : [],
    });
    setSelectedId((current) => (items.some((item) => item._id === current) ? current : items[0]?._id || ''));
  };

  const handleStatusAction = async (requestId, nextStatus) => {
    setActionError('');
    setUpdatingStatus(nextStatus);
    try {
      const updated = await supportService.updateAdminRequestStatus(requestId, nextStatus);
      setRequests((current) => current.map((item) => (item._id === requestId ? updated : item)));
      await refreshRequests();
      setSelectedId(updated._id);
    } catch (err) {
      setActionError(err?.message || 'Unable to update the support request.');
    } finally {
      setUpdatingStatus('');
    }
  };

  const statCards = [
    { label: 'Total tickets', value: meta.total, tone: 'cyan' },
    { label: 'Pending', value: statusCounts.pending || 0, tone: 'amber' },
    { label: 'In review', value: statusCounts.in_review || 0, tone: 'cyan' },
    { label: 'Resolved', value: statusCounts.resolved || 0, tone: 'green' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="glass-panel rounded-2xl p-6 md:p-7 border shadow-custom" style={{ borderColor: 'var(--color-border)', background: 'linear-gradient(135deg, var(--color-bg-card), var(--color-bg-secondary))' }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] font-bold mb-2" style={{ color: 'var(--color-cyan-400)' }}>
              Backoffice help desk
            </p>
            <h1 className="font-heading text-3xl font-bold mb-2" style={{ color: 'var(--color-text-heading)' }}>
              Support Center
            </h1>
            <p className="max-w-3xl" style={{ color: 'var(--color-text-muted)' }}>
              Review frontoffice contact forms, bug reports, and meeting requests from one operational queue.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SelectControl label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
            <SelectControl label="Category" value={category} onChange={setCategory} options={CATEGORY_OPTIONS} />
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--color-error-bg)', color: 'var(--color-red-500)', border: '1px solid rgba(239,68,68,0.35)' }}>
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)] gap-6">
        <div className="glass-panel rounded-2xl border shadow-custom overflow-hidden" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}>
          <div className="p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-heading text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>Request queue</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Newest requests are listed first.</p>
          </div>
          <div className="max-h-[720px] overflow-auto custom-scrollbar p-4 space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => <RequestSkeleton key={index} />)
            ) : requests.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="font-semibold" style={{ color: 'var(--color-text-heading)' }}>No support requests found</p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Try a broader status or category filter.</p>
              </div>
            ) : requests.map((request) => (
              <RequestRow
                key={request._id}
                request={request}
                active={selectedRequest?._id === request._id}
                onClick={() => setSelectedId(request._id)}
              />
            ))}
          </div>
        </div>

        <RequestDetails
          request={selectedRequest}
          categoryCounts={categoryCounts}
          actionError={actionError}
          updatingStatus={updatingStatus}
          onStatusAction={handleStatusAction}
        />
      </div>
    </div>
  );
};

const SelectControl = ({ label, value, onChange, options }) => (
  <label className="flex flex-col gap-1 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
    {label}
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="form-select min-w-40"
      style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
    >
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>
);

const StatCard = ({ label, value, tone }) => {
  const colors = {
    cyan: 'var(--color-cyan-400)',
    amber: 'var(--color-yellow-500)',
    green: 'var(--color-green-500)',
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border shadow-custom" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}>
      <p className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <p className="font-heading text-3xl font-bold" style={{ color: colors[tone] || 'var(--color-text-heading)' }}>{Number(value || 0).toLocaleString()}</p>
    </div>
  );
};

const RequestRow = ({ request, active, onClick }) => {
  const tone = statusTone(request.status);
  const categoryLabel = String(request.category || 'support').replaceAll('_', ' ');
  const initial = String(request.userName || request.userEmail || '?').trim().charAt(0).toUpperCase() || '?';
  const categoryAccent = request.category === 'report_bug'
    ? 'var(--color-red-500)'
    : request.category === 'schedule_meeting'
      ? 'var(--color-cyan-400)'
      : 'var(--color-green-500)';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full min-w-0 overflow-hidden text-left rounded-2xl p-5 transition duration-200 hover:-translate-y-0.5"
      style={{
        background: active
          ? 'linear-gradient(135deg, rgba(34,211,238,0.12), var(--color-bg-elevated))'
          : 'linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-card))',
        border: active ? '1px solid var(--color-cyan-400)' : '1px solid var(--color-border)',
        boxShadow: active ? '0 18px 45px rgba(34, 211, 238, 0.14)' : 'var(--shadow-custom)',
      }}
    >
      <div className="absolute inset-y-3 left-3 w-1.5 rounded-full" style={{ background: categoryAccent }} />
      <div className="flex min-w-0 gap-4 pl-5 pr-2">
        <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-heading text-lg font-bold" style={{ background: `${categoryAccent}22`, color: categoryAccent, border: `1px solid ${categoryAccent}55` }}>
          {initial}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span
                className="px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide"
                style={{ background: tone.bg, color: tone.color, border: `1px solid ${tone.border}` }}
              >
                {String(request.status || 'pending').replaceAll('_', ' ')}
              </span>
              <span
                className="max-w-full break-words px-2 py-1 rounded-md text-[11px] font-semibold capitalize"
                style={{ color: categoryAccent, background: `${categoryAccent}14`, border: `1px solid ${categoryAccent}38` }}
              >
                {categoryLabel}
              </span>
            </div>
            <span className="min-w-0 max-w-full break-words text-xs font-semibold" style={{ color: 'var(--color-cyan-400)' }}>
              {request.referenceNumber || 'SUP-NEW'}
            </span>
          </div>

          <div className="min-w-0 max-w-full overflow-hidden rounded-xl px-1">
            <p className="max-w-full whitespace-normal break-all font-semibold" style={{ color: 'var(--color-text-heading)' }}>
              {request.subject || 'Untitled request'}
            </p>
            <p className="mt-2 max-w-full whitespace-pre-wrap break-all text-sm leading-6" style={{ color: 'var(--color-text-muted)' }}>
              {request.description || 'No description provided.'}
            </p>
          </div>

          <div
            className="mx-1 flex flex-col gap-1 border-t pt-3 text-xs sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            <span className="min-w-0 max-w-full break-all font-medium">{request.userName || request.userEmail || 'Unknown user'}</span>
            <span className="shrink-0">{formatDate(request.createdAt)}</span>
          </div>
        </div>
      </div>
    </button>
  );
};

const RequestDetails = ({ request, categoryCounts, actionError, updatingStatus, onStatusAction }) => (
  <aside className="glass-panel rounded-2xl border shadow-custom p-5 min-h-[420px]" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}>
    <h2 className="font-heading text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>Ticket details</h2>
    {!request ? (
      <p className="text-sm mt-4" style={{ color: 'var(--color-text-muted)' }}>Select a request to see its full context.</p>
    ) : (
      <div className="mt-5 space-y-5">
        <TicketActions
          request={request}
          actionError={actionError}
          updatingStatus={updatingStatus}
          onStatusAction={onStatusAction}
        />
        <div>
          <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-muted)' }}>Subject</p>
          <p className="font-semibold mt-1" style={{ color: 'var(--color-text-heading)' }}>{request.subject}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DetailChip label="Reference" value={request.referenceNumber || 'SUP-NEW'} />
          <DetailChip label="Priority" value={request.priority || 'normal'} />
          <DetailChip label="Category" value={String(request.category || '').replaceAll('_', ' ')} />
          <DetailChip label="Created" value={formatDate(request.createdAt)} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--color-text-muted)' }}>Requester</p>
          <div className="rounded-xl p-3" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
            <p className="font-semibold" style={{ color: 'var(--color-text-heading)' }}>{request.userName || 'Unknown user'}</p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{request.userEmail || 'No email attached'}</p>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--color-text-muted)' }}>Description</p>
          <p className="rounded-xl p-3 text-sm leading-6 whitespace-pre-wrap" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
            {request.description || 'No description provided.'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--color-text-muted)' }}>Category volume</p>
          <div className="space-y-2">
            {CATEGORY_OPTIONS.filter((item) => item.value).map((item) => (
              <div key={item.value} className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                <span className="font-semibold" style={{ color: 'var(--color-text-heading)' }}>{categoryCounts[item.value] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </aside>
);

const ACTIONS = [
  { status: 'in_review', label: 'Start review' },
  { status: 'resolved', label: 'Mark resolved' },
  { status: 'closed', label: 'Close ticket' },
  { status: 'pending', label: 'Reopen' },
];

const TicketActions = ({ request, actionError, updatingStatus, onStatusAction }) => {
  const visibleActions = ACTIONS.filter((action) => action.status !== request.status);

  return (
    <div className="rounded-xl p-3" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-muted)' }}>Actions</p>
        <span className="text-xs font-semibold capitalize" style={{ color: statusTone(request.status).color }}>
          {String(request.status || 'pending').replaceAll('_', ' ')}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {visibleActions.map((action) => (
          <button
            key={action.status}
            type="button"
            disabled={Boolean(updatingStatus)}
            onClick={() => onStatusAction(request._id, action.status)}
            className="rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              color: 'var(--color-text-heading)',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            {updatingStatus === action.status ? 'Updating...' : action.label}
          </button>
        ))}
      </div>
      {actionError ? (
        <p className="text-xs mt-3" style={{ color: 'var(--color-red-500)' }}>{actionError}</p>
      ) : null}
    </div>
  );
};

const DetailChip = ({ label, value }) => (
  <div className="rounded-xl p-3" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
    <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
    <p className="text-sm font-semibold capitalize truncate" style={{ color: 'var(--color-text-heading)' }}>{value}</p>
  </div>
);

const RequestSkeleton = () => (
  <div className="rounded-xl p-4" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
    <div className="h-4 w-32 rounded mb-3" style={{ background: 'var(--color-bg-input)' }} />
    <div className="h-5 w-2/3 rounded mb-2" style={{ background: 'var(--color-bg-input)' }} />
    <div className="h-4 w-full rounded" style={{ background: 'var(--color-bg-input)' }} />
  </div>
);

export default SupportCenter;
