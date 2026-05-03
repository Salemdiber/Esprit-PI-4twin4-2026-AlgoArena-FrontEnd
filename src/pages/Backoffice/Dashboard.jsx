import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import StatCard from '../../components/StatCard';
import ActiveUsersChart from '../../components/Charts/ActiveUsersChart';
import GamesChart from '../../components/Charts/GamesChart';
import DifficultyChart from '../../components/Charts/DifficultyChart';
import SandboxMonitorCard from '../../components/SandboxMonitorCard';
import { adminStatsService } from '../../services/adminStatsService';
import {
    Badge,
    Box,
    Card,
    CardBody,
    CardHeader,
    Collapse,
    Flex,
    Icon,
    SimpleGrid,
    Text,
    Tooltip,
    VStack,
    keyframes,
} from '@chakra-ui/react';
import CodeEditor from '../../editor/components/CodeEditor';
import {
    BarChart3,
    ChevronRight,
    Clock,
    Code2,
    Copy,
    Check,
    DoorOpen,
    Eye,
    EyeOff,
    TrendingDown,
    CheckCircle2,
    XCircle,
    PauseCircle,
    AlertTriangle,
    Trophy,
    Search,
    RotateCcw,
    Download,
    Flag,
    Filter,
    ListFilter,
    Users,
    Flame,
    AlertOctagon,
} from 'lucide-react';

/* ─── Keyframes ─── */
const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ringFill = keyframes`
  from { stroke-dashoffset: var(--ring-circumference); }
  to { stroke-dashoffset: var(--ring-offset); }
`;

const shimmerSlide = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
`;

const goldPulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

/* ─── Circular Progress Ring (FIX 1 — guaranteed text fit) ─── */
const ProgressRing = ({ value, color, size = 72, strokeWidth = 4, showLabel = true }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedValue = Math.max(0, Math.min(100, value || 0));
    const offset = circumference - (clampedValue / 100) * circumference;

    // Smart font sizing: scale text to always fit inside the ring
    // Inner diameter available = size - strokeWidth*2 - padding(4px each side)
    const innerSpace = size - strokeWidth * 2 - 8;
    const fontSize = Math.max(8, Math.min(innerSpace * 0.32, 14));

    const displayText = clampedValue > 0
        ? (clampedValue === 100 ? '100%' : `${Math.round(clampedValue)}%`)
        : '—';

    return (
        <Box position="relative" w={`${size}px`} h={`${size}px`} flexShrink={0}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke="rgba(255,255,255,0.06)"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                        '--ring-circumference': circumference,
                        '--ring-offset': offset,
                        animation: `${ringFill} 1s ease-out forwards`,
                    }}
                />
            </svg>
            {showLabel && (
                <Flex
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    align="center"
                    justify="center"
                >
                    <Text
                        fontSize={`${fontSize}px`}
                        fontWeight="800"
                        color={color}
                        whiteSpace="nowrap"
                        lineHeight="1"
                    >
                        {displayText}
                    </Text>
                </Flex>
            )}
        </Box>
    );
};

/* ─── Difficulty colors ─── */
const difficultyColors = {
    Easy: '#48BB78',
    easy: '#48BB78',
    Medium: '#ECC94B',
    medium: '#ECC94B',
    Hard: '#F56565',
    hard: '#F56565',
    Expert: '#9F7AEA',
    expert: '#9F7AEA',
};

const getDiffColor = (diff) => difficultyColors[diff] || '#9F7AEA';

const FILTER_DEFAULTS = {
    difficulty: 'all',
    status: 'all',
    language: 'all',
    sortBy: 'mostSubmissions',
    search: '',
};

const normalizeLanguage = (language) => {
    const lowered = String(language || '').trim().toLowerCase();
    if (lowered === 'c++' || lowered === 'cpp') return 'cpp';
    return lowered || 'other';
};

const getLanguageVisual = (language) => {
    const normalized = normalizeLanguage(language);
    if (normalized === 'javascript') {
        return {
            label: 'JS',
            bg: 'var(--color-warning-bg)',
            text: 'var(--color-yellow-500)',
            border: 'var(--color-yellow-600)',
        };
    }
    if (normalized === 'python') {
        return {
            label: 'PY',
            bg: 'var(--color-info-bg)',
            text: 'var(--color-cyan-400)',
            border: 'var(--color-cyan-500)',
        };
    }
    if (normalized === 'java') {
        return {
            label: 'JV',
            bg: 'var(--color-warning-bg)',
            text: 'var(--color-yellow-600)',
            border: 'var(--color-yellow-500)',
        };
    }
    if (normalized === 'cpp') {
        return {
            label: 'C++',
            bg: 'var(--color-bg-secondary)',
            text: 'var(--color-purple-500)',
            border: 'var(--color-purple-500)',
        };
    }
    return {
        label: String(language || 'N/A').slice(0, 3).toUpperCase(),
        bg: 'var(--color-bg-secondary)',
        text: 'var(--color-text-muted)',
        border: 'var(--color-border)',
    };
};

/* ─── Glassmorphism Stat Card (shared between widgets) ─── */
const GlassStatCard = ({ icon: IconComponent, iconColor, iconBg, label, children, delay = 0 }) => (
    <Box
        p={4}
        minH="112px"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        borderRadius="14px"
        bg="var(--color-bg-card)"
        border="1px solid var(--color-border)"
        transition="all .2s ease"
        _hover={{
            borderColor: 'var(--color-border-hover)',
            bg: 'var(--color-bg-secondary)',
        }}
        animation={`${fadeSlideIn} 0.4s ease ${delay}s both`}
        position="relative"
        overflow="visible"
    >
        {/* Shimmer hover effect */}
        <Box
            position="absolute" inset={0}
            pointerEvents="none"
            opacity={0}
            _groupHover={{ opacity: 1 }}
            transition="opacity .3s"
        >
            <Box
                position="absolute"
                top={0} left={0} w="50%" h="100%"
                bgGradient="linear(to-r, transparent, rgba(255,255,255,0.03), transparent)"
                animation={`${shimmerSlide} 2s ease infinite`}
            />
        </Box>
        <Flex align="center" gap={2} mb={2} minW={0}>
            <Flex boxSize={7} flexShrink={0} borderRadius="full" align="center" justify="center" bg={iconBg}>
                <Icon as={IconComponent} boxSize={3.5} color={iconColor} />
            </Flex>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.04em" color="var(--color-text-muted)" fontWeight="700" noOfLines={2} lineHeight="1.25">
                {label}
            </Text>
        </Flex>
        {children}
    </Box>
);

/* ─── Copy button with feedback ─── */
const CopyButton = ({ text }) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const handleCopy = useCallback(() => {
        navigator.clipboard?.writeText(text || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [text]);

    return (
        <Flex
            as="button"
            align="center" gap={1}
            cursor="pointer"
            onClick={handleCopy}
            opacity={0.6}
            _hover={{ opacity: 1 }}
            transition="opacity .15s"
        >
            <Icon as={copied ? Check : Code2} boxSize={3} color={copied ? '#22c55e' : 'var(--color-text-muted)'} />
            <Text fontSize="10px" color={copied ? '#22c55e' : 'var(--color-text-muted)'} fontWeight="600">
                {copied ? t('admin.dashboard.copied') : t('admin.dashboard.copy')}
            </Text>
        </Flex>
    );
};

/* ─── Main Dashboard ─── */
const Dashboard = () => {
    const { t } = useTranslation();
    const [overview, setOverview] = useState(null);
    const [usersStats, setUsersStats] = useState(null);
    const [challengeStats, setChallengeStats] = useState(null);
    const [submissionStats, setSubmissionStats] = useState(null);
    const [submissionQualityStats, setSubmissionQualityStats] = useState(null);
    const [challengeSubmissionOverview, setChallengeSubmissionOverview] = useState([]);
    const [selectedChallengeId, setSelectedChallengeId] = useState(null);
    const [expandedSubmissionKey, setExpandedSubmissionKey] = useState(null);
    const [activeSubmissionTab, setActiveSubmissionTab] = useState('all');
    const [challengeFilters, setChallengeFilters] = useState(FILTER_DEFAULTS);
    const [searchInput, setSearchInput] = useState('');
    const [flaggedSubmissionKeys, setFlaggedSubmissionKeys] = useState({});
    const [sandboxStatus, setSandboxStatus] = useState(null);
    const [sandboxLoading, setSandboxLoading] = useState(true);
    const [sandboxError, setSandboxError] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        try {
            const saved = localStorage.getItem('admin_challenge_flagged_submissions');
            if (!saved) return;
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === 'object') {
                setFlaggedSubmissionKeys(parsed);
            }
        } catch {
            setFlaggedSubmissionKeys({});
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('admin_challenge_flagged_submissions', JSON.stringify(flaggedSubmissionKeys));
    }, [flaggedSubmissionKeys]);

    useEffect(() => {
        let cancelled = false;

        const loadStats = async () => {
            try {
                setLoading(true);
                setError('');
                const [
                    overviewRes,
                    usersRes,
                    challengesRes,
                    submissionsRes,
                    qualityRes,
                ] = await Promise.allSettled([
                    adminStatsService.getOverview(),
                    adminStatsService.getUsers(),
                    adminStatsService.getChallenges(),
                    adminStatsService.getSubmissions(),
                    adminStatsService.getDashboardSubmissionStats(),
                ]);

                if (cancelled) return;
                const results = [overviewRes, usersRes, challengesRes, submissionsRes, qualityRes];
                const firstError = results.find((item) => item.status === 'rejected');

                if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value);
                if (usersRes.status === 'fulfilled') setUsersStats(usersRes.value);
                if (challengesRes.status === 'fulfilled') setChallengeStats(challengesRes.value);
                if (submissionsRes.status === 'fulfilled') setSubmissionStats(submissionsRes.value);
                if (qualityRes.status === 'fulfilled') setSubmissionQualityStats(qualityRes.value);
                if (firstError) {
                    setError(firstError.reason?.message || t('admin.dashboard.loadError'));
                }
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
                setError(err?.message || t('admin.dashboard.loadError'));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        const loadChallengeOverview = async () => {
            try {
                const overviewByChallengeRes = await adminStatsService.getChallengeSubmissionOverview();
                if (cancelled) return;
                setChallengeSubmissionOverview(Array.isArray(overviewByChallengeRes) ? overviewByChallengeRes : []);
                if (Array.isArray(overviewByChallengeRes) && overviewByChallengeRes.length > 0) {
                    setSelectedChallengeId((prev) => prev || overviewByChallengeRes[0].challengeId);
                }
            } catch (err) {
                if (!cancelled) console.warn('Challenge submission overview failed:', err);
            }
        };

        loadStats();
        loadChallengeOverview();

        return () => {
            cancelled = true;
        };
    }, [t]);

    useEffect(() => {
        let cancelled = false;
        let intervalId;

        const loadSandboxStatus = async () => {
            try {
                if (!cancelled) setSandboxLoading(true);
                const status = await adminStatsService.getSandboxStatus();
                if (!cancelled) {
                    setSandboxStatus(status);
                    setSandboxError('');
                }
            } catch (err) {
                if (!cancelled) {
                    setSandboxError(err?.message || t('admin.dashboard.sandboxLoadError'));
                }
            } finally {
                if (!cancelled) setSandboxLoading(false);
            }
        };

        loadSandboxStatus();
        intervalId = setInterval(loadSandboxStatus, 10000);

        return () => {
            cancelled = true;
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    const challengeStatusData = useMemo(() => ({
        labels: [t('admin.dashboard.draft'), t('admin.dashboard.published')],
        values: [Number(challengeStats?.draftChallenges || 0), Number(challengeStats?.publishedChallenges || 0)],
    }), [challengeStats, t]);

    const submissionsByDifficulty = useMemo(() => {
        const rows = submissionStats?.byDifficulty || [];
        return {
            labels: rows.map((item) => item.difficulty),
            values: rows.map((item) => Number(item.submissions || 0)),
        };
    }, [submissionStats]);

    const qualityRows = useMemo(() => ([
        { key: 'easy', label: 'Easy' },
        { key: 'medium', label: 'Medium' },
        { key: 'hard', label: 'Hard' },
        { key: 'expert', label: 'Expert' },
    ]).map((item) => {
        const stats = submissionQualityStats?.[item.key] || { total: 0, successful: 0, failed: 0, successRate: 0, abandoned: 0 };
        return {
            ...item,
            total: Number(stats.total || 0),
            successful: Number(stats.successful || 0),
            failed: Number(stats.failed || 0),
            abandoned: Number(stats.abandoned || 0),
            successRate: Number(stats.successRate || 0),
        };
    }), [submissionQualityStats]);

    useEffect(() => {
        const handle = window.setTimeout(() => {
            setChallengeFilters((prev) => (prev.search === searchInput ? prev : { ...prev, search: searchInput }));
        }, 300);
        return () => window.clearTimeout(handle);
    }, [searchInput]);

    const availableLanguages = useMemo(() => {
        const languageSet = new Set();
        challengeSubmissionOverview.forEach((challenge) => {
            (challenge.recentSubmissions || []).forEach((submission) => {
                const normalized = normalizeLanguage(submission.language);
                if (normalized && normalized !== 'other') languageSet.add(normalized);
            });
        });
        return [...languageSet].sort((a, b) => a.localeCompare(b));
    }, [challengeSubmissionOverview]);

    const globalChallengeStats = useMemo(() => {
        const totals = challengeSubmissionOverview.reduce((acc, challenge) => {
            acc.totalSubmissions += Number(challenge.totalSubmissions || 0);
            acc.passed += Number(challenge.successfulSubmissions || 0);
            acc.failed += Number(challenge.failedSubmissions || 0);
            acc.abandoned += Number(challenge.abandonedAttempts || 0);
            return acc;
        }, { totalSubmissions: 0, passed: 0, failed: 0, abandoned: 0 });

        const highestSubmissions = [...challengeSubmissionOverview].sort(
            (a, b) => Number(b.totalSubmissions || 0) - Number(a.totalSubmissions || 0),
        )[0];
        const highestDropout = [...challengeSubmissionOverview].sort((a, b) => {
            const aDropout = Number(a.totalSubmissions || 0) > 0 ? Number(a.abandonedAttempts || 0) / Number(a.totalSubmissions || 0) : -1;
            const bDropout = Number(b.totalSubmissions || 0) > 0 ? Number(b.abandonedAttempts || 0) / Number(b.totalSubmissions || 0) : -1;
            return bDropout - aDropout;
        })[0];

        return {
            ...totals,
            overallPassRate: totals.totalSubmissions > 0 ? (totals.passed / totals.totalSubmissions) * 100 : null,
            mostAttemptedTitle: highestSubmissions?.challengeTitle || null,
            highestDropoutTitle: highestDropout?.challengeTitle || null,
        };
    }, [challengeSubmissionOverview]);

    const filteredChallenges = useMemo(() => {
        const filtered = challengeSubmissionOverview.filter((challenge) => {
            const difficulty = String(challenge.difficulty || '').toLowerCase();
            const matchesDifficulty = challengeFilters.difficulty === 'all' || difficulty === challengeFilters.difficulty;
            const matchesSearch = !challengeFilters.search
                || String(challenge.challengeTitle || '').toLowerCase().includes(challengeFilters.search.toLowerCase());
            return matchesDifficulty && matchesSearch;
        });

        filtered.sort((a, b) => {
            if (challengeFilters.sortBy === 'highestPassRate') return Number(b.successRate || 0) - Number(a.successRate || 0);
            if (challengeFilters.sortBy === 'lowestPassRate') return Number(a.successRate || 0) - Number(b.successRate || 0);
            if (challengeFilters.sortBy === 'highestAbandonment') {
                const aDropout = Number(a.totalSubmissions || 0) > 0 ? Number(a.abandonedAttempts || 0) / Number(a.totalSubmissions || 0) : -1;
                const bDropout = Number(b.totalSubmissions || 0) > 0 ? Number(b.abandonedAttempts || 0) / Number(b.totalSubmissions || 0) : -1;
                return bDropout - aDropout;
            }
            if (challengeFilters.sortBy === 'alphabetical') {
                return String(a.challengeTitle || '').localeCompare(String(b.challengeTitle || ''));
            }
            return Number(b.totalSubmissions || 0) - Number(a.totalSubmissions || 0);
        });
        return filtered;
    }, [challengeSubmissionOverview, challengeFilters]);

    const selectedChallengeOverview = useMemo(
        () => filteredChallenges.find((item) => item.challengeId === selectedChallengeId) || filteredChallenges[0] || null,
        [filteredChallenges, selectedChallengeId],
    );

    const filteredSubmissions = useMemo(() => {
        if (!selectedChallengeOverview) return [];
        return (selectedChallengeOverview.recentSubmissions || []).filter((submission) => {
            const status = String(submission.status || '').toLowerCase();
            const language = normalizeLanguage(submission.language);
            const matchesStatus = challengeFilters.status === 'all' || status === challengeFilters.status;
            const matchesLanguage = challengeFilters.language === 'all' || language === challengeFilters.language;
            return matchesStatus && matchesLanguage;
        });
    }, [selectedChallengeOverview, challengeFilters.status, challengeFilters.language]);

    const challengeSummaryExtras = useMemo(() => {
        const uniqueUsers = new Set(filteredSubmissions.map((item) => item.username || 'Unknown')).size;
        const failedCount = filteredSubmissions.filter((item) => item.status === 'failed').length;
        const failedRate = filteredSubmissions.length > 0 ? (failedCount / filteredSubmissions.length) * 100 : 0;
        const topLanguageMap = filteredSubmissions.reduce((acc, item) => {
            const language = normalizeLanguage(item.language);
            acc[language] = (acc[language] || 0) + 1;
            return acc;
        }, {});
        const topLanguage = Object.entries(topLanguageMap).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
        return { uniqueUsers, failedRate, topLanguage };
    }, [filteredSubmissions]);

    const submissionsByUser = useMemo(() => {
        const grouped = filteredSubmissions.reduce((acc, submission) => {
            const username = submission.username || 'Unknown';
            if (!acc[username]) acc[username] = [];
            acc[username].push(submission);
            return acc;
        }, {});

        return Object.entries(grouped)
            .map(([username, submissions]) => {
                const ordered = [...submissions].sort(
                    (a, b) => new Date(a.submittedAt || 0).getTime() - new Date(b.submittedAt || 0).getTime(),
                );
                const passed = ordered.filter((item) => item.status === 'success').length;
                const failed = ordered.filter((item) => item.status === 'failed').length;
                return {
                    username,
                    attempts: ordered.length,
                    passed,
                    failed,
                    abandoned: ordered.filter((item) => item.status === 'abandoned').length,
                    passRate: ordered.length > 0 ? (passed / ordered.length) * 100 : 0,
                    timeline: ordered,
                };
            })
            .sort((a, b) => b.attempts - a.attempts);
    }, [filteredSubmissions]);

    const formatRelative = (value) => {
        if (!value) return t('admin.dashboard.na');
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return t('admin.dashboard.na');
        const diff = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
        if (diff < 60) return t('admin.dashboard.secsAgo', { value: diff });
        if (diff < 3600) return t('admin.dashboard.minsAgo', { value: Math.floor(diff / 60) });
        if (diff < 86400) return t('admin.dashboard.hoursAgo', { value: Math.floor(diff / 3600) });
        return t('admin.dashboard.daysAgo', { value: Math.floor(diff / 86400) });
    };

    const getSubmissionRowKey = (challengeId, submission, index) => (
        `${challengeId}-${submission.userId || 'unknown'}-${submission.submittedAt || index}-${submission.status || 'status'}`
    );

    const getLastActivity = (challenge) => {
        const mostRecent = (challenge.recentSubmissions || [])
            .map((submission) => submission.submittedAt)
            .filter(Boolean)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
        return mostRecent || null;
    };

    const getLastActivityColor = (challenge) => {
        const value = getLastActivity(challenge);
        if (!value) return 'var(--color-text-muted)';
        const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
        if (diffSeconds < 7 * 24 * 3600) return 'var(--color-green-500)';
        if (diffSeconds < 30 * 24 * 3600) return 'var(--color-yellow-500)';
        return 'var(--color-text-muted)';
    };

    const runtimeDisplay = (executionTime) => {
        const value = Number(executionTime || 0);
        if (value <= 0) return { label: '—', color: 'var(--color-text-muted)' };
        if (value < 500) return { label: `${value}ms`, color: 'var(--color-green-500)' };
        if (value <= 2000) return { label: `${value}ms`, color: 'var(--color-yellow-500)' };
        return { label: `${value}ms`, color: 'var(--color-red-500)' };
    };

    const isAnyFilterActive = (
        challengeFilters.difficulty !== FILTER_DEFAULTS.difficulty
        || challengeFilters.status !== FILTER_DEFAULTS.status
        || challengeFilters.language !== FILTER_DEFAULTS.language
        || challengeFilters.sortBy !== FILTER_DEFAULTS.sortBy
        || challengeFilters.search !== FILTER_DEFAULTS.search
    );

    const handleResetFilters = () => {
        setChallengeFilters(FILTER_DEFAULTS);
        setSearchInput('');
        setActiveSubmissionTab('all');
    };

    const handleExportChallengeCsv = () => {
        const headers = [
            'Challenge',
            'Difficulty',
            'Total Submissions',
            'Passed',
            'Failed',
            'Abandoned',
            'Pass Rate %',
            'Avg Time (ms)',
            'Last Activity',
        ];
        const rows = filteredChallenges.map((challenge) => [
            challenge.challengeTitle || '',
            challenge.difficulty || '',
            Number(challenge.totalSubmissions || 0),
            Number(challenge.successfulSubmissions || 0),
            Number(challenge.failedSubmissions || 0),
            Number(challenge.abandonedAttempts || 0),
            Number(challenge.successRate || 0).toFixed(1),
            Number(challenge.averageSolveTime || 0) > 0 ? Number(challenge.averageSolveTime || 0).toFixed(1) : '—',
            getLastActivity(challenge) ? new Date(getLastActivity(challenge)).toISOString() : 'No activity',
        ]);
        const csv = [headers, ...rows].map((row) => row.map((value) => `"${value}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `challenges-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        if (!filteredChallenges.length) return;
        const stillExists = filteredChallenges.some((item) => item.challengeId === selectedChallengeId);
        if (!stillExists) {
            setSelectedChallengeId(filteredChallenges[0].challengeId);
            setExpandedSubmissionKey(null);
        }
    }, [filteredChallenges, selectedChallengeId]);

    /* Overall quality stats */
    const overallQuality = useMemo(() => {
        const totalSub = qualityRows.reduce((s, r) => s + r.total, 0);
        const totalSuccess = qualityRows.reduce((s, r) => s + r.successful, 0);
        const rate = totalSub > 0 ? (totalSuccess / totalSub) * 100 : 0;
        return { total: totalSub, successful: totalSuccess, rate };
    }, [qualityRows]);

    if (error && !overview && !usersStats && !challengeStats && !submissionStats) {
        return <div className="p-6 text-red-400">{error}</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="mb-6">
                <h1 className="font-heading text-3xl font-bold mb-2 truncate" style={{ color: 'var(--color-text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>{t('admin.dashboard.title')}</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>{t('admin.dashboard.subtitle')}</p>
            </div>

            {loading ? (
                <div className="rounded-xl px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                    {t('admin.dashboard.loading')}
                </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <StatCard
                    value={(overview?.totalUsers || 0).toLocaleString()}
                    label={t('admin.dashboard.totalUsers')}
                    color="cyan"
                    icon={(
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    )}
                />
                <StatCard
                    value={(overview?.activeUsers || 0).toLocaleString()}
                    label={t('admin.dashboard.activeUsers')}
                    isLive
                    color="green"
                    icon={(
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                    )}
                />
                <StatCard
                    value={(overview?.totalChallenges || 0).toLocaleString()}
                    label={t('admin.dashboard.totalChallenges')}
                    color="yellow"
                    icon={(
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                        </svg>
                    )}
                />
                <StatCard
                    value={Number(overview?.totalSubmissions || 0) > 0 ? `${Number(overview?.successRate || 0).toFixed(1)}%` : '-'}
                    label={t('admin.dashboard.submissionSuccessRate')}
                    color="purple"
                    icon={(
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl shadow-custom">
                    <h2 className="font-heading text-xl font-bold mb-4" style={{ color: 'var(--color-text-heading)' }}>{t('admin.dashboard.newUsersTitle')}</h2>
                    <div className="h-64 overflow-hidden">
                        <ActiveUsersChart
                            labels={usersStats?.signupsLast7Days?.labels || []}
                            values={usersStats?.signupsLast7Days?.values || []}
                            label={t('admin.dashboard.newUsersLabel')}
                        />
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl shadow-custom">
                    <h2 className="font-heading text-xl font-bold mb-4" style={{ color: 'var(--color-text-heading)' }}>{t('admin.dashboard.draftVsPublished')}</h2>
                    <div className="h-64 overflow-hidden">
                        <GamesChart
                            labels={challengeStatusData.labels}
                            values={challengeStatusData.values}
                            datasetLabel={t('admin.dashboard.challengesLabel')}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl shadow-custom">
                    <h2 className="font-heading text-xl font-bold mb-4" style={{ color: 'var(--color-text-heading)' }}>{t('admin.dashboard.difficultyDistribution')}</h2>
                    <div className="h-64 overflow-hidden">
                        <DifficultyChart distribution={challengeStats?.difficultyDistribution} />
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl shadow-custom">
                    <h2 className="font-heading text-xl font-bold mb-4" style={{ color: 'var(--color-text-heading)' }}>{t('admin.dashboard.submissionsByDifficulty')}</h2>
                    <div className="h-64 overflow-hidden">
                        <GamesChart
                            labels={submissionsByDifficulty.labels}
                            values={submissionsByDifficulty.values}
                            datasetLabel={t('admin.dashboard.submissionsLabel')}
                        />
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                WIDGET 3 — Submission Quality by Difficulty (Tier Cards)
               ═══════════════════════════════════════════════════════════════ */}
            <Box
                className="glass-panel rounded-2xl shadow-custom spotlight-hover"
                overflow="hidden"
                animation={`${fadeSlideIn} 0.5s ease 0.05s both`}
                transition="all .3s ease"
                _hover={{ boxShadow: 'var(--shadow-custom-hover)' }}
            >
                {/* Header */}
                <Box px={6} pt={5} pb={2}>
                    <Flex align="center" justify="space-between">
                        <Box>
                            <Text
                                fontFamily="heading"
                                fontSize="xl"
                                fontWeight="bold"
                                bgGradient="linear(to-r, var(--color-text-heading), #a78bfa)"
                                bgClip="text"
                            >
                                {t('admin.dashboard.submissionQuality')}
                            </Text>
                            <Text fontSize="xs" color="var(--color-text-muted)" mt={0.5}>
                                {t('admin.dashboard.qualitySubtitle')}
                            </Text>
                        </Box>
                        <Tooltip label={t('admin.dashboard.qualityTooltip')} hasArrow placement="left">
                            <Flex
                                align="center" justify="center"
                                boxSize={7} borderRadius="full"
                                bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.06)"
                                cursor="help"
                            >
                                <Text fontSize="xs" fontWeight="700" color="var(--color-text-muted)">?</Text>
                            </Flex>
                        </Tooltip>
                    </Flex>
                </Box>

                {/* Tier Cards */}
                <Box px={6} pt={3} pb={0}>
                    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
                        {qualityRows.map((item, idx) => {
                            const rate = Math.max(0, Math.min(100, item.successRate || 0));
                            const tierColor = getDiffColor(item.key);
                            return (
                                <Box
                                    key={item.key}
                                    p={6}
                                    borderRadius="16px"
                                    border={`1px solid ${tierColor}20`}
                                    bg={`${tierColor}05`}
                                    boxShadow={`inset 0 1px 0 ${tierColor}10`}
                                    transition="all .25s ease"
                                    _hover={{
                                        transform: 'translateY(-3px)',
                                        borderColor: `${tierColor}45`,
                                        boxShadow: `0 8px 30px ${tierColor}15, inset 0 1px 0 ${tierColor}15`,
                                    }}
                                    animation={`${fadeSlideIn} 0.4s ease ${0.1 + idx * 0.08}s both`}
                                    cursor="default"
                                >
                                    {/* Tier label */}
                                    <Flex align="center" gap={2} mb={4}>
                                        <Box boxSize={2.5} borderRadius="sm" bg={tierColor} boxShadow={`0 0 6px ${tierColor}60`} />
                                        <Text
                                            fontSize="xs"
                                            fontWeight="700"
                                            textTransform="uppercase"
                                            letterSpacing="0.1em"
                                            color="var(--color-text-muted)"
                                        >
                                            {t(`admin.dashboard.${item.key}`)}
                                        </Text>
                                    </Flex>

                                    {/* Hero stat + ring */}
                                    <Flex align="center" justify="space-between" mb={4}>
                                        <Text
                                            fontSize={{ base: '3xl', lg: '4xl' }}
                                            fontWeight="800"
                                            color={item.total === 0 ? 'var(--color-text-muted)' : tierColor}
                                            lineHeight="1"
                                        >
                                            {item.total === 0 ? '—' : `${rate.toFixed(0)}%`}
                                        </Text>
                                        <ProgressRing value={rate} color={tierColor} size={68} strokeWidth={4} />
                                    </Flex>

                                    {/* Submission count */}
                                    <Text fontSize="xs" color="var(--color-text-muted)" lineHeight="tall">
                                        {item.total === 0 ? (
                                            <em>{t('admin.dashboard.noSubmissionsYet')}</em>
                                        ) : (
                                            t('admin.dashboard.successfulOfTotal', { successful: item.successful, total: item.total })
                                        )}
                                    </Text>
                                </Box>
                            );
                        })}
                    </SimpleGrid>
                </Box>

                {/* ─── Premium Gold Summary Bar (FIX 3B) ─── */}
                <Box
                    mt={5}
                    px={6}
                    py={5}
                    bg="linear-gradient(135deg, rgba(246,195,67,0.06) 0%, rgba(255,165,0,0.03) 50%, rgba(246,195,67,0.06) 100%)"
                    borderTop="1px solid rgba(246,195,67,0.12)"
                >
                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        align="center"
                        justify="center"
                        gap={{ base: 3, md: 6 }}
                    >
                        {/* Trophy icon */}
                        <Flex
                            align="center" justify="center"
                            boxSize={10}
                            borderRadius="full"
                            bg="rgba(246,195,67,0.1)"
                            border="1px solid rgba(246,195,67,0.2)"
                            flexShrink={0}
                        >
                            <Icon as={Trophy} boxSize={5} color="#F6C343" />
                        </Flex>

                        {/* Overall label */}
                        <Box textAlign={{ base: 'center', md: 'left' }}>
                            <Text
                                fontSize="10px"
                                fontWeight="700"
                                textTransform="uppercase"
                                letterSpacing="0.12em"
                                color="#F6C343"
                                animation={`${goldPulse} 3s ease infinite`}
                            >
                                {t('admin.dashboard.overallPerformance')}
                            </Text>
                        </Box>

                        {/* Decorative line */}
                        <Box
                            display={{ base: 'none', md: 'block' }}
                            w="40px" h="1px"
                            bg="linear-gradient(90deg, transparent, rgba(246,195,67,0.3), transparent)"
                        />

                        {/* Hero percentage */}
                        <Text
                            fontSize={{ base: '3xl', md: '4xl' }}
                            fontWeight="800"
                            color="#F6C343"
                            lineHeight="1"
                            textShadow="0 0 24px rgba(246,195,67,0.25)"
                        >
                            {overallQuality.rate > 0 ? `${overallQuality.rate.toFixed(1)}%` : '—'}
                        </Text>

                        {/* Decorative line */}
                        <Box
                            display={{ base: 'none', md: 'block' }}
                            w="40px" h="1px"
                            bg="linear-gradient(90deg, transparent, rgba(246,195,67,0.3), transparent)"
                        />

                        {/* Total submissions */}
                        <Box textAlign={{ base: 'center', md: 'left' }}>
                            <Text fontSize="sm" color="var(--color-text-muted)">
                                {t('admin.dashboard.successRateAcross')}{' '}
                                <Text as="span" fontWeight="700" color="#F6C343">
                                    {overallQuality.total.toLocaleString()}
                                </Text>
                                {' '}{t('admin.dashboard.totalSubmissions')}
                            </Text>
                        </Box>
                    </Flex>
                </Box>
            </Box>

            {/* ═══════════════════════════════════════════════════════════════
                WIDGET 2 — Challenge Submission Analytics (Bloomberg-style)
               ═══════════════════════════════════════════════════════════════ */}
            <Box
                className="glass-panel rounded-2xl shadow-custom spotlight-hover"
                overflow="hidden"
                animation={`${fadeSlideIn} 0.5s ease 0.15s both`}
                transition="all .3s ease"
                _hover={{ boxShadow: 'var(--shadow-custom-hover)' }}
            >
                {/* Header */}
                <Box px={6} pt={5} pb={2}>
                    <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
                        <Box>
                            <Text
                                fontFamily="heading"
                                fontSize="xl"
                                fontWeight="bold"
                                bgGradient="linear(to-r, var(--color-text-heading), #38bdf8)"
                                bgClip="text"
                            >
                                {t('admin.dashboard.challengeAnalytics')}
                            </Text>
                            <Text fontSize="xs" color="var(--color-text-muted)" mt={0.5}>
                                {t('admin.dashboard.analyticsSubtitle')}
                            </Text>
                        </Box>
                        <Badge
                            px={2.5} py={1} borderRadius="full"
                            bg="rgba(34,211,238,0.1)" color="#22d3ee"
                            border="1px solid rgba(34,211,238,0.2)"
                            fontSize="xs" fontWeight="700"
                        >
                            {t('admin.dashboard.challengeCount', { count: challengeSubmissionOverview.length })}
                        </Badge>
                    </Flex>
                </Box>

                {/* Icon library found: lucide-react. Using Filter, ListFilter, Search, RotateCcw, Download, Users, Flag, Flame, AlertOctagon, CheckCircle2, XCircle, PauseCircle, Eye, EyeOff. */}
                {/* Colors confirmed from index.css: success var(--color-green-500), error var(--color-red-500), warning var(--color-yellow-500), muted var(--color-text-muted), border var(--color-border), card bg var(--color-bg-card). */}
                <Box px={4} pb={3}>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={2}>
                        <Flex align="center" gap={2} px={3} py={2} borderRadius="lg" bg="var(--color-bg-secondary)" border="1px solid var(--color-border)">
                            <Icon as={BarChart3} boxSize={4} color="var(--color-cyan-400)" />
                            <Text fontSize="xs" color="var(--color-text-secondary)">Total submissions: <Text as="span" color="var(--color-text-heading)" fontWeight="700">{globalChallengeStats.totalSubmissions}</Text></Text>
                        </Flex>
                        <Flex align="center" gap={2} px={3} py={2} borderRadius="lg" bg="var(--color-bg-secondary)" border="1px solid var(--color-border)">
                            <Icon as={CheckCircle2} boxSize={4} color="var(--color-green-500)" />
                            <Text fontSize="xs" color="var(--color-text-secondary)">Overall pass rate: <Text as="span" color="var(--color-text-heading)" fontWeight="700">{globalChallengeStats.overallPassRate === null ? '—' : `${globalChallengeStats.overallPassRate.toFixed(1)}%`}</Text></Text>
                        </Flex>
                        <Flex align="center" gap={2} px={3} py={2} borderRadius="lg" bg="var(--color-bg-secondary)" border="1px solid var(--color-border)">
                            <Icon as={XCircle} boxSize={4} color="var(--color-red-500)" />
                            <Text fontSize="xs" color="var(--color-text-secondary)">Total failed: <Text as="span" color="var(--color-text-heading)" fontWeight="700">{globalChallengeStats.failed}</Text></Text>
                        </Flex>
                        <Flex align="center" gap={2} px={3} py={2} borderRadius="lg" bg="var(--color-bg-secondary)" border="1px solid var(--color-border)">
                            <Icon as={PauseCircle} boxSize={4} color="var(--color-text-muted)" />
                            <Text fontSize="xs" color="var(--color-text-secondary)">Total abandoned: <Text as="span" color="var(--color-text-heading)" fontWeight="700">{globalChallengeStats.abandoned}</Text></Text>
                        </Flex>
                        <Tooltip label={globalChallengeStats.mostAttemptedTitle || '—'}>
                            <Flex align="center" gap={2} px={3} py={2} borderRadius="lg" bg="var(--color-bg-secondary)" border="1px solid var(--color-border)">
                                <Icon as={Flame} boxSize={4} color="var(--color-yellow-500)" />
                                <Text fontSize="xs" color="var(--color-text-secondary)">Most attempted: <Text as="span" color="var(--color-text-heading)" fontWeight="700">{globalChallengeStats.mostAttemptedTitle ? `${globalChallengeStats.mostAttemptedTitle.slice(0, 20)}${globalChallengeStats.mostAttemptedTitle.length > 20 ? '...' : ''}` : '—'}</Text></Text>
                            </Flex>
                        </Tooltip>
                        <Tooltip label={globalChallengeStats.highestDropoutTitle || '—'}>
                            <Flex align="center" gap={2} px={3} py={2} borderRadius="lg" bg="var(--color-bg-secondary)" border="1px solid var(--color-border)">
                                <Icon as={AlertOctagon} boxSize={4} color="var(--color-red-500)" />
                                <Text fontSize="xs" color="var(--color-text-secondary)">Highest dropout: <Text as="span" color="var(--color-text-heading)" fontWeight="700">{globalChallengeStats.highestDropoutTitle ? `${globalChallengeStats.highestDropoutTitle.slice(0, 20)}${globalChallengeStats.highestDropoutTitle.length > 20 ? '...' : ''}` : '—'}</Text></Text>
                            </Flex>
                        </Tooltip>
                    </SimpleGrid>
                </Box>

                <Box px={4} pb={3} borderTop="1px solid var(--color-border)">
                    <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={2} mt={3}>
                        <Flex align="center" gap={2} p={1.5} borderRadius="md" bg="var(--color-bg-secondary)">
                            <Icon as={Filter} boxSize={3.5} color="var(--color-text-muted)" />
                            {['all', 'easy', 'medium', 'hard'].map((value) => {
                                const isActive = challengeFilters.difficulty === value;
                                return (
                                    <Box
                                        key={value}
                                        as="button"
                                        px={2}
                                        py={0.5}
                                        borderRadius="full"
                                        fontSize="10px"
                                        fontWeight="700"
                                        textTransform="uppercase"
                                        bg={isActive ? 'var(--color-cyan-500)' : 'transparent'}
                                        color={isActive ? 'var(--color-text-inverted)' : 'var(--color-text-muted)'}
                                        border="1px solid var(--color-border)"
                                        onClick={() => {
                                            setChallengeFilters((prev) => ({ ...prev, difficulty: value }));
                                            setExpandedSubmissionKey(null);
                                        }}
                                    >
                                        {value}
                                    </Box>
                                );
                            })}
                        </Flex>
                        <Flex align="center" gap={2}>
                            <Icon as={ListFilter} boxSize={3.5} color="var(--color-text-muted)" />
                            <select
                                className="form-select"
                                value={challengeFilters.status}
                                onChange={(event) => {
                                    setChallengeFilters((prev) => ({ ...prev, status: event.target.value }));
                                    setExpandedSubmissionKey(null);
                                }}
                                style={{ fontSize: '12px', width: '100%' }}
                            >
                                <option value="all">Status: All</option>
                                <option value="success">Passed</option>
                                <option value="failed">Failed</option>
                                <option value="abandoned">Abandoned</option>
                            </select>
                        </Flex>
                        <Flex align="center" gap={2}>
                            <Icon as={Code2} boxSize={3.5} color="var(--color-text-muted)" />
                            <select
                                className="form-select"
                                value={challengeFilters.language}
                                onChange={(event) => {
                                    setChallengeFilters((prev) => ({ ...prev, language: event.target.value }));
                                    setExpandedSubmissionKey(null);
                                }}
                                style={{ fontSize: '12px', width: '100%' }}
                            >
                                <option value="all">Language: All</option>
                                {availableLanguages.map((language) => (
                                    <option key={language} value={language}>{language}</option>
                                ))}
                            </select>
                        </Flex>
                        <Flex align="center" gap={2}>
                            <Icon as={BarChart3} boxSize={3.5} color="var(--color-text-muted)" />
                            <select
                                className="form-select"
                                value={challengeFilters.sortBy}
                                onChange={(event) => setChallengeFilters((prev) => ({ ...prev, sortBy: event.target.value }))}
                                style={{ fontSize: '12px', width: '100%' }}
                            >
                                <option value="mostSubmissions">Most submissions</option>
                                <option value="highestPassRate">Highest pass rate</option>
                                <option value="lowestPassRate">Lowest pass rate</option>
                                <option value="highestAbandonment">Highest abandonment</option>
                                <option value="alphabetical">Alphabetical</option>
                            </select>
                        </Flex>
                    </SimpleGrid>
                    <Flex mt={2} align="center" gap={2}>
                        <Box position="relative" flex={1}>
                            <Icon as={Search} boxSize={3.5} color="var(--color-text-muted)" position="absolute" left="10px" top="50%" transform="translateY(-50%)" />
                            <input
                                className="search-input"
                                placeholder="Search challenge..."
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                style={{ width: '100%', paddingLeft: '30px', paddingRight: '30px', fontSize: '12px' }}
                            />
                            {searchInput && (
                                <Box
                                    as="button"
                                    position="absolute"
                                    right="8px"
                                    top="50%"
                                    transform="translateY(-50%)"
                                    color="var(--color-text-muted)"
                                    onClick={() => setSearchInput('')}
                                >
                                    x
                                </Box>
                            )}
                        </Box>
                        <Tooltip label="Export CSV">
                            <Box
                                as="button"
                                p={2}
                                borderRadius="md"
                                border="1px solid var(--color-border)"
                                color="var(--color-text-muted)"
                                onClick={handleExportChallengeCsv}
                            >
                                <Icon as={Download} boxSize={4} />
                            </Box>
                        </Tooltip>
                        {isAnyFilterActive && (
                            <Tooltip label="Reset filters">
                                <Box
                                    as="button"
                                    p={2}
                                    borderRadius="md"
                                    border="1px solid var(--color-border)"
                                    color="var(--color-text-muted)"
                                    onClick={handleResetFilters}
                                >
                                    <Icon as={RotateCcw} boxSize={4} />
                                </Box>
                            </Tooltip>
                        )}
                    </Flex>
                    <Text fontSize="xs" mt={2} color="var(--color-text-muted)">
                        Showing {filteredChallenges.length} of {challengeSubmissionOverview.length} challenges
                    </Text>
                </Box>


                <Flex direction={{ base: 'column', lg: 'row' }} minH="520px">
                    {/* ─── LEFT PANEL: Challenge List ─── */}
                    <Box
                        w={{ base: '100%', lg: '320px' }}
                        flexShrink={0}
                        borderRight={{ base: 'none', lg: '1px solid rgba(255,255,255,0.06)' }}
                        borderBottom={{ base: '1px solid rgba(255,255,255,0.06)', lg: 'none' }}
                    >
                        <Box
                            maxH={{ base: '280px', lg: '520px' }}
                            overflowY="auto"
                            className="scrollbar-thin"
                            px={2}
                            py={2}
                        >
                            {filteredChallenges.length === 0 ? (
                                <Flex direction="column" align="center" justify="center" py={16} gap={3}>
                                    <Icon as={BarChart3} boxSize={8} color="var(--color-text-muted)" opacity={0.4} />
                                    <Text fontSize="sm" color="var(--color-text-muted)">{t('admin.dashboard.noChallengesFound')}</Text>
                                </Flex>
                            ) : filteredChallenges.map((item, i) => {
                                const rate = Number(item.successRate || 0);
                                const rateColor = rate > 70 ? 'var(--color-green-500)' : rate >= 40 ? 'var(--color-yellow-500)' : 'var(--color-red-500)';
                                const selected = selectedChallengeOverview?.challengeId === item.challengeId;
                                const diffColor = getDiffColor(item.difficulty);
                                const totalSubmissions = Number(item.totalSubmissions || 0);
                                const abandonedRate = totalSubmissions > 0 ? (Number(item.abandonedAttempts || 0) / totalSubmissions) * 100 : 0;
                                const lastActivity = getLastActivity(item);
                                return (
                                    <Box
                                        key={item.challengeId}
                                        px={3}
                                        py={3}
                                        mb={1}
                                        borderRadius="lg"
                                        cursor="pointer"
                                        onClick={() => {
                                            setSelectedChallengeId(item.challengeId);
                                            setExpandedSubmissionKey(null);
                                            setActiveSubmissionTab('all');
                                        }}
                                        bg={selected ? 'rgba(255,255,255,0.06)' : 'transparent'}
                                        borderLeft="3px solid"
                                        borderLeftColor={selected ? diffColor : 'transparent'}
                                        transition="all .15s ease"
                                        _hover={{
                                            bg: 'rgba(255,255,255,0.04)',
                                            borderLeftColor: diffColor,
                                        }}
                                        role="group"
                                        animation={`${fadeSlideIn} 0.3s ease ${i * 0.03}s both`}
                                    >
                                        <Flex justify="space-between" align="flex-start">
                                            <Tooltip label={item.challengeTitle} openDelay={600} placement="right">
                                                <Text
                                                    fontWeight="500"
                                                    fontSize="sm"
                                                    color="var(--color-text-primary)"
                                                    noOfLines={1}
                                                    flex={1}
                                                    mr={2}
                                                >
                                                    {item.challengeTitle}
                                                </Text>
                                            </Tooltip>
                                            <Icon
                                                as={ChevronRight}
                                                boxSize={3.5}
                                                color="var(--color-text-muted)"
                                                opacity={0}
                                                _groupHover={{ opacity: 0.6 }}
                                                transition="opacity .15s"
                                                mt={0.5}
                                            />
                                        </Flex>
                                        <Flex mt={1.5} align="center" gap={2} flexWrap="wrap">
                                            <Text
                                                fontSize="10px"
                                                fontWeight="700"
                                                px={1.5}
                                                py={0.5}
                                                borderRadius="full"
                                                bg={`${diffColor}18`}
                                                color={diffColor}
                                                textTransform="uppercase"
                                                letterSpacing="0.04em"
                                            >
                                                {t(`admin.dashboard.${(item.difficulty || 'easy').toLowerCase()}`)}
                                            </Text>
                                            {abandonedRate > 30 && (
                                                <Badge fontSize="10px" bg="var(--color-warning-bg)" color="var(--color-yellow-500)" border="1px solid var(--color-border)">
                                                    High dropout
                                                </Badge>
                                            )}
                                        </Flex>
                                        <Flex mt={1.5} align="center" gap={2}>
                                            <Text fontSize="xs" color="var(--color-text-muted)">
                                                {t('admin.dashboard.subs', { count: item.totalSubmissions })}
                                            </Text>
                                            {totalSubmissions === 0 ? (
                                                <Text fontSize="xs" fontWeight="600" color="var(--color-text-muted)">?</Text>
                                            ) : (
                                                <>
                                                    <Box flex={1} h="6px" borderRadius="full" bg="var(--color-bg-secondary)" overflow="hidden">
                                                        <Box h="full" borderRadius="full" bg={rateColor} w={`${Math.max(4, Math.min(100, rate))}%`} />
                                                    </Box>
                                                    <Text fontSize="xs" fontWeight="600" color={rateColor}>{rate.toFixed(0)}%</Text>
                                                </>
                                            )}
                                        </Flex>
                                        <Text mt={1} fontSize="11px" color={getLastActivityColor(item)}>
                                            {lastActivity ? formatRelative(lastActivity) : 'No activity'}
                                        </Text>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>

                    {/* ─── RIGHT PANEL: Selected Challenge Detail ─── */}
                    <Box flex={1} px={6} py={5}>
                        {!selectedChallengeOverview ? (
                            <Flex direction="column" align="center" justify="center" h="full" gap={4} py={16}>
                                <Icon as={BarChart3} boxSize={12} color="var(--color-text-muted)" opacity={0.2} />
                                <Text color="var(--color-text-muted)" fontSize="sm">{t('admin.dashboard.selectChallenge')}</Text>
                            </Flex>
                        ) : (
                            <VStack align="stretch" spacing={5}>
                                {/* Header */}
                                <Box>
                                    <Text fontSize="xl" fontWeight="bold" color="var(--color-text-primary)">
                                        {selectedChallengeOverview.challengeTitle}
                                    </Text>
                                    <Flex mt={1.5} align="center" gap={2}>
                                        <Text
                                            fontSize="10px"
                                            fontWeight="700"
                                            px={2}
                                            py={0.5}
                                            borderRadius="full"
                                            bg={`${getDiffColor(selectedChallengeOverview.difficulty)}18`}
                                            color={getDiffColor(selectedChallengeOverview.difficulty)}
                                            textTransform="uppercase"
                                            letterSpacing="0.04em"
                                        >
                                            {t(`admin.dashboard.${(selectedChallengeOverview.difficulty || 'easy').toLowerCase()}`)}
                                        </Text>
                                    </Flex>
                                </Box>

                                {/* Warning indicators */}
                                {selectedChallengeOverview.totalSubmissions > 0 && Number(selectedChallengeOverview.successRate || 0) < 30 && (
                                    <Flex
                                        align="center" gap={2} px={3} py={2}
                                        borderRadius="lg" bg="rgba(239,68,68,0.08)"
                                        border="1px solid rgba(239,68,68,0.15)"
                                    >
                                        <Icon as={TrendingDown} boxSize={4} color="#ef4444" />
                                        <Text fontSize="xs" color="#ef4444">{t('admin.dashboard.lowSuccessWarning')}</Text>
                                    </Flex>
                                )}
                                {selectedChallengeOverview.totalSubmissions > 0 && Number(selectedChallengeOverview.successRate || 0) >= 30 && Number(selectedChallengeOverview.successRate || 0) < 50 && (
                                    <Flex
                                        align="center" gap={2} px={3} py={2}
                                        borderRadius="lg" bg="rgba(249,115,22,0.08)"
                                        border="1px solid rgba(249,115,22,0.15)"
                                    >
                                        <Icon as={AlertTriangle} boxSize={4} color="#f97316" />
                                        <Text fontSize="xs" color="#f97316">{t('admin.dashboard.difficultWarning')}</Text>
                                    </Flex>
                                )}
                                {selectedChallengeOverview.totalSubmissions > 0 && (Number(selectedChallengeOverview.abandonedAttempts || 0) / Math.max(1, Number(selectedChallengeOverview.totalSubmissions || 0))) > 0.4 && (
                                    <Flex
                                        align="center" gap={2} px={3} py={2}
                                        borderRadius="lg" bg="rgba(234,179,8,0.08)"
                                        border="1px solid rgba(234,179,8,0.15)"
                                    >
                                        <Icon as={DoorOpen} boxSize={4} color="#eab308" />
                                        <Text fontSize="xs" color="#eab308">{t('admin.dashboard.highAbandonmentWarning')}</Text>
                                    </Flex>
                                )}

                                {/* Stats row */}
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={3} role="group">
                                    {/* Total Submissions */}
                                    <GlassStatCard
                                        icon={BarChart3} iconColor="#22d3ee" iconBg="rgba(34,211,238,0.12)"
                                        label={t('admin.dashboard.totalSubs')} delay={0.05}
                                    >
                                        <Text fontWeight="800" fontSize="xl" color="var(--color-text-heading)">
                                            {selectedChallengeOverview.totalSubmissions}
                                        </Text>
                                    </GlassStatCard>

                                    {/* Success Rate with ring (FIX 1 — larger ring) */}
                                    <GlassStatCard
                                        icon={CheckCircle2} iconColor="#22c55e" iconBg="rgba(34,197,94,0.12)"
                                        label={t('admin.dashboard.success')} delay={0.1}
                                    >
                                        <Flex align="center" gap={3}>
                                            <Text fontWeight="800" fontSize="xl" color="green.400">
                                                {selectedChallengeOverview.totalSubmissions > 0 ? `${Number(selectedChallengeOverview.successRate || 0).toFixed(1)}%` : '—'}
                                            </Text>
                                            <ProgressRing
                                                value={selectedChallengeOverview.totalSubmissions > 0 ? Number(selectedChallengeOverview.successRate || 0) : 0}
                                                color="#22c55e" size={34} strokeWidth={3}
                                            />
                                        </Flex>
                                    </GlassStatCard>

                                    {/* Avg Solve Time */}
                                    <GlassStatCard
                                        icon={Clock} iconColor="#6366f1" iconBg="rgba(99,102,241,0.12)"
                                        label={t('admin.dashboard.avgTime')} delay={0.15}
                                    >
                                        <Text fontWeight="800" fontSize="xl" color="var(--color-text-heading)">
                                            {selectedChallengeOverview.averageSolveTime > 0 ? `${Number(selectedChallengeOverview.averageSolveTime).toFixed(1)}s` : '—'}
                                        </Text>
                                    </GlassStatCard>

                                    {/* Abandoned */}
                                    <GlassStatCard
                                        icon={PauseCircle} iconColor="#f97316" iconBg="rgba(249,115,22,0.12)"
                                        label={t('admin.dashboard.abandoned')} delay={0.2}
                                    >
                                        <Text fontWeight="800" fontSize="xl" color="orange.300">
                                            {selectedChallengeOverview.abandonedAttempts}
                                        </Text>
                                    </GlassStatCard>

                                    <GlassStatCard
                                        icon={Users} iconColor="var(--color-cyan-400)" iconBg="var(--color-info-bg)"
                                        label="Unique users" delay={0.25}
                                    >
                                        <Text fontWeight="800" fontSize="xl" color="var(--color-text-heading)">
                                            {challengeSummaryExtras.uniqueUsers}
                                        </Text>
                                    </GlassStatCard>

                                    <GlassStatCard
                                        icon={XCircle} iconColor="var(--color-red-500)" iconBg="var(--color-error-bg)"
                                        label="Failed" delay={0.3}
                                    >
                                        <Text fontWeight="800" fontSize="xl" color={challengeSummaryExtras.failedRate > 50 ? 'var(--color-red-500)' : 'var(--color-text-heading)'}>
                                            {filteredSubmissions.length > 0 ? `${challengeSummaryExtras.failedRate.toFixed(1)}%` : '—'}
                                        </Text>
                                    </GlassStatCard>

                                    <GlassStatCard
                                        icon={Code2} iconColor="var(--color-text-muted)" iconBg="var(--color-bg-secondary)"
                                        label="Top language" delay={0.35}
                                    >
                                        {challengeSummaryExtras.topLanguage ? (
                                            <Text
                                                fontSize="11px"
                                                display="inline-flex"
                                                alignItems="center"
                                                minH="28px"
                                                maxW="100%"
                                                noOfLines={1}
                                                px={2}
                                                py={1}
                                                borderRadius="md"
                                                border="1px solid var(--color-border)"
                                                bg={getLanguageVisual(challengeSummaryExtras.topLanguage).bg}
                                                color={getLanguageVisual(challengeSummaryExtras.topLanguage).text}
                                                fontWeight="700"
                                                textTransform="uppercase"
                                            >
                                                {getLanguageVisual(challengeSummaryExtras.topLanguage).label}
                                            </Text>
                                        ) : (
                                            <Text fontWeight="800" fontSize="xl" color="var(--color-text-muted)">—</Text>
                                        )}
                                    </GlassStatCard>
                                </SimpleGrid>

                                {/* Divider */}
                                <Box h="1px" bg="rgba(255,255,255,0.06)" />

                                <Flex align="center" gap={2} borderBottom="1px solid var(--color-border)" pb={2} overflowX="auto">
                                    <Box
                                        as="button"
                                        px={3}
                                        py={1.5}
                                        borderRadius="md"
                                        border="1px solid var(--color-border)"
                                        bg={activeSubmissionTab === 'all' ? 'var(--color-hover-bg)' : 'transparent'}
                                        color={activeSubmissionTab === 'all' ? 'var(--color-text-heading)' : 'var(--color-text-muted)'}
                                        fontSize="sm"
                                        onClick={() => setActiveSubmissionTab('all')}
                                    >
                                        All submissions
                                    </Box>
                                    <Box
                                        as="button"
                                        px={3}
                                        py={1.5}
                                        borderRadius="md"
                                        border="1px solid var(--color-border)"
                                        bg={activeSubmissionTab === 'byUser' ? 'var(--color-hover-bg)' : 'transparent'}
                                        color={activeSubmissionTab === 'byUser' ? 'var(--color-text-heading)' : 'var(--color-text-muted)'}
                                        fontSize="sm"
                                        onClick={() => {
                                            setActiveSubmissionTab('byUser');
                                            setExpandedSubmissionKey(null);
                                        }}
                                    >
                                        By user
                                    </Box>
                                </Flex>

                                {activeSubmissionTab === 'byUser' ? (
                                    <VStack align="stretch" spacing={3} maxH="460px" overflowY="auto" className="scrollbar-thin" pr={1}>
                                        {submissionsByUser.length === 0 ? (
                                            <Flex direction="column" align="center" justify="center" py={10} gap={2}>
                                                <Text color="var(--color-text-muted)" fontSize="sm">No submissions for this filter</Text>
                                            </Flex>
                                        ) : submissionsByUser.map((userRow) => (
                                            <Box key={userRow.username} borderRadius="lg" border="1px solid var(--color-border)" bg="var(--color-bg-secondary)" px={3} py={3}>
                                                <Flex align="center" gap={2} wrap="wrap">
                                                    <Flex align="center" justify="center" boxSize={7} borderRadius="full" bg="var(--color-info-bg)" border="1px solid var(--color-border)">
                                                        <Text fontSize="xs" fontWeight="700" color="var(--color-cyan-400)">{(userRow.username || '?')[0].toUpperCase()}</Text>
                                                    </Flex>
                                                    <Text fontSize="sm" fontWeight="700" color="var(--color-text-heading)">{userRow.username}</Text>
                                                    <Text fontSize="xs" color="var(--color-text-muted)">{userRow.attempts} attempts</Text>
                                                    <Text fontSize="xs" color="var(--color-green-500)">{userRow.passed} passed</Text>
                                                    <Text fontSize="xs" color="var(--color-red-500)">{userRow.failed} failed</Text>
                                                    <Text fontSize="xs" color="var(--color-text-muted)">{userRow.passRate.toFixed(1)}%</Text>
                                                </Flex>
                                                <Flex mt={3} align="center" wrap="wrap" gap={2}>
                                                    {userRow.timeline.map((attempt, idx) => {
                                                        const dotColor = attempt.status === 'success'
                                                            ? 'var(--color-green-500)'
                                                            : attempt.status === 'failed'
                                                                ? 'var(--color-red-500)'
                                                                : 'var(--color-text-muted)';
                                                        const runtime = runtimeDisplay(attempt.executionTime);
                                                        return (
                                                            <Tooltip
                                                                key={`${userRow.username}-${attempt.submittedAt || idx}`}
                                                                label={`${formatRelative(attempt.submittedAt)} · ${runtime.label} · ${(attempt.language || 'N/A').toUpperCase()}`}
                                                            >
                                                                <Box boxSize="10px" borderRadius="full" bg={dotColor} border="1px solid var(--color-border)" />
                                                            </Tooltip>
                                                        );
                                                    })}
                                                </Flex>
                                            </Box>
                                        ))}
                                    </VStack>
                                ) : (
                                    <VStack align="stretch" spacing={2.5} maxH="520px" overflowY="auto" className="scrollbar-thin" pr={1} py={1}>
                                        {filteredSubmissions.map((submission, index) => {
                                            const rowKey = getSubmissionRowKey(selectedChallengeOverview.challengeId, submission, index);
                                            const status = submission.status === 'success' ? t('admin.dashboard.passed') : submission.status === 'abandoned' ? t('admin.dashboard.abandoned') : t('admin.dashboard.failed');
                                            const statusColor = submission.status === 'success' ? 'var(--color-green-500)' : submission.status === 'abandoned' ? 'var(--color-text-muted)' : 'var(--color-red-500)';
                                            const statusBg = submission.status === 'success' ? 'var(--color-success-bg)' : submission.status === 'abandoned' ? 'var(--color-bg-secondary)' : 'var(--color-error-bg)';
                                            const StatusIcon = submission.status === 'success' ? CheckCircle2 : submission.status === 'abandoned' ? PauseCircle : XCircle;
                                            const isExpanded = expandedSubmissionKey === rowKey;
                                            const runtime = runtimeDisplay(submission.executionTime);
                                            const languageStyle = getLanguageVisual(submission.language);
                                            const isFlagged = Boolean(flaggedSubmissionKeys[rowKey]);
                                            return (
                                                <Box
                                                    key={rowKey}
                                                    borderRadius="lg"
                                                    border="1px solid var(--color-border)"
                                                    bg="var(--color-bg-secondary)"
                                                    overflow="visible"
                                                    transition="all .15s ease"
                                                    _hover={{ borderColor: 'var(--color-border-hover)' }}
                                                    role="group"
                                                >
                                                    <Flex
                                                        px={4} py={3}
                                                        align="center"
                                                        gap={3}
                                                        minH="68px"
                                                        overflow="visible"
                                                    >
                                                        <Flex align="center" gap={3} flex="1 1 16rem" minW="14rem">
                                                            <Flex
                                                                align="center" justify="center"
                                                                boxSize={8} borderRadius="full"
                                                                bg="var(--color-info-bg)"
                                                                border="1px solid var(--color-border)"
                                                                flexShrink={0}
                                                            >
                                                                <Text fontSize="xs" fontWeight="700" color="var(--color-cyan-400)">
                                                                    {(submission.username || '?')[0].toUpperCase()}
                                                                </Text>
                                                            </Flex>
                                                            <Box minW={0}>
                                                                <Flex align="center" gap={1}>
                                                                    {isFlagged && <Icon as={Flag} boxSize={3.5} color="var(--color-red-500)" />}
                                                                    <Text fontWeight="500" fontSize="sm" color="var(--color-text-primary)" noOfLines={1}>
                                                                        {submission.username}
                                                                    </Text>
                                                                </Flex>
                                                                <Text fontSize="xs" color="var(--color-text-muted)">
                                                                    {formatRelative(submission.submittedAt)}
                                                                </Text>
                                                            </Box>
                                                        </Flex>

                                                        <Flex gap={2} align="center" justify="flex-end" flexWrap="nowrap" flexShrink={0} minW="27rem" overflow="visible">
                                                            <Flex align="center" justify="center" gap={1} h="34px" minW="7.25rem" px={2.5} borderRadius="full" bg={statusBg} border="1px solid var(--color-border)">
                                                                <Icon as={StatusIcon} boxSize={3} color={statusColor} />
                                                                <Text fontSize="10px" fontWeight="700" color={statusColor} textTransform="uppercase">
                                                                    {status}
                                                                </Text>
                                                            </Flex>
                                                            <Text fontSize="xs" minW="5.25rem" h="34px" lineHeight="32px" textAlign="center" px={2} borderRadius="full" bg="var(--color-bg-card)" border="1px solid var(--color-border)" color={runtime.color} fontFamily="var(--font-mono)" fontWeight="700">
                                                                {runtime.label}
                                                            </Text>
                                                            <Text
                                                                fontSize="10px"
                                                                minW="3.25rem"
                                                                h="34px"
                                                                lineHeight="32px"
                                                                textAlign="center"
                                                                px={2}
                                                                borderRadius="full"
                                                                fontFamily="var(--font-mono)"
                                                                fontWeight="800"
                                                                bg={languageStyle.bg}
                                                                border="1px solid var(--color-border)"
                                                                color={languageStyle.text}
                                                            >
                                                                {languageStyle.label}
                                                            </Text>
                                                            <Flex
                                                                as="button"
                                                                align="center" gap={1}
                                                                h="34px" px={2.5} borderRadius="full"
                                                                bg="var(--color-bg-card)"
                                                                border="1px solid var(--color-border)"
                                                                minW="4.5rem"
                                                                justify="center"
                                                                cursor="pointer"
                                                                transition="all .15s"
                                                                _hover={{ bg: 'var(--color-hover-bg)', borderColor: 'var(--color-border-hover)' }}
                                                                onClick={() => setExpandedSubmissionKey(isExpanded ? null : rowKey)}
                                                            >
                                                                <Icon as={isExpanded ? EyeOff : Eye} boxSize={3} color="var(--color-text-muted)" />
                                                                <Text fontSize="10px" fontWeight="600" color="var(--color-text-muted)">
                                                                    {isExpanded ? t('admin.dashboard.hide') : t('admin.dashboard.code')}
                                                                </Text>
                                                            </Flex>
                                                            <Tooltip label={isFlagged ? 'Unflag submission' : 'Flag submission'}>
                                                                <Box
                                                                    as="button"
                                                                    w="34px"
                                                                    h="34px"
                                                                    display="inline-flex"
                                                                    alignItems="center"
                                                                    justifyContent="center"
                                                                    borderRadius="full"
                                                                    border="1px solid var(--color-border)"
                                                                    color={isFlagged ? 'var(--color-red-500)' : 'var(--color-text-muted)'}
                                                                    opacity={isFlagged ? 1 : 0.55}
                                                                    transition="all .15s ease"
                                                                    _hover={{ opacity: 1, bg: 'var(--color-hover-bg)' }}
                                                                    onClick={() => setFlaggedSubmissionKeys((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }))}
                                                                >
                                                                    <Icon as={Flag} boxSize={3.5} />
                                                                </Box>
                                                            </Tooltip>
                                                        </Flex>
                                                    </Flex>

                                                    <Collapse in={isExpanded} animateOpacity>
                                                        <Box px={4} pb={3}>
                                                            <Flex
                                                                align="center" justify="space-between"
                                                                bg="var(--color-editor-toolbar)" px={3} py={1.5}
                                                                borderTopRadius="md"
                                                                borderBottom="1px solid var(--color-border)"
                                                            >
                                                                <Text fontSize="10px" fontFamily="var(--font-mono)" color="var(--color-text-muted)">
                                                                    {submission.language || 'javascript'}
                                                                </Text>
                                                                <CopyButton text={submission.code} />
                                                            </Flex>
                                                            <Box
                                                                h="220px"
                                                                borderBottomRadius="md"
                                                                overflow="hidden"
                                                                border="1px solid var(--color-border)"
                                                                borderTop="none"
                                                            >
                                                                <CodeEditor
                                                                    code={submission.code || ''}
                                                                    language={submission.language || 'javascript'}
                                                                    readOnly
                                                                    height="100%"
                                                                    options={{ minimap: { enabled: false }, fontSize: 12, wordWrap: 'on', lineNumbers: 'on' }}
                                                                />
                                                            </Box>
                                                            {submission.status === 'failed' && submission.errorMessage && (
                                                                <Text mt={2} fontSize="xs" color="var(--color-red-500)">{submission.errorMessage}</Text>
                                                            )}
                                                        </Box>
                                                    </Collapse>
                                                </Box>
                                            );
                                        })}
                                        {filteredSubmissions.length === 0 && (
                                            <Flex direction="column" align="center" justify="center" py={12} gap={3}>
                                                <Icon as={BarChart3} boxSize={8} color="var(--color-text-muted)" opacity={0.3} />
                                                <Text color="var(--color-text-muted)" fontSize="sm">No submissions for this filter</Text>
                                            </Flex>
                                        )}
                                    </VStack>
                                )}
                            </VStack>
                        )}
                    </Box>
                </Flex>
            </Box>

            <SandboxMonitorCard
                status={sandboxStatus}
                loading={sandboxLoading}
                error={sandboxError}
            />
        </div>
    );
};

export default Dashboard;
