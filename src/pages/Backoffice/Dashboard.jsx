import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
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
import { CodeEditor } from '../../editor';
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

/* ─── Count-up hook for hero numbers ─── */
const useCountUp = (target, duration = 1000) => {
    const [value, setValue] = useState(0);
    const hasAnimated = useRef(false);
    useEffect(() => {
        if (hasAnimated.current || target === 0) { setValue(target); return; }
        hasAnimated.current = true;
        const start = performance.now();
        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [target, duration]);
    return value;
};

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

const getRateColor = (rate) => {
    if (rate >= 90) return '#22c55e';
    if (rate >= 70) return '#eab308';
    if (rate >= 50) return '#f97316';
    return '#ef4444';
};

/* ─── Glassmorphism Stat Card (shared between widgets) ─── */
const GlassStatCard = ({ icon: IconComponent, iconColor, iconBg, label, children, delay = 0 }) => (
    <Box
        p={4}
        borderRadius="14px"
        bg="rgba(255,255,255,0.03)"
        border="1px solid rgba(255,255,255,0.06)"
        transition="all .2s ease"
        _hover={{
            borderColor: 'rgba(255,255,255,0.12)',
            bg: 'rgba(255,255,255,0.05)',
        }}
        animation={`${fadeSlideIn} 0.4s ease ${delay}s both`}
        position="relative"
        overflow="hidden"
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
        <Flex align="center" gap={2} mb={2}>
            <Flex boxSize={7} borderRadius="full" align="center" justify="center" bg={iconBg}>
                <Icon as={IconComponent} boxSize={3.5} color={iconColor} />
            </Flex>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.06em" color="var(--color-text-muted)" fontWeight="600">
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
    const [sandboxStatus, setSandboxStatus] = useState(null);
    const [sandboxLoading, setSandboxLoading] = useState(true);
    const [sandboxError, setSandboxError] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
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
                    overviewByChallengeRes,
                ] = await Promise.all([
                    adminStatsService.getOverview(),
                    adminStatsService.getUsers(),
                    adminStatsService.getChallenges(),
                    adminStatsService.getSubmissions(),
                    adminStatsService.getDashboardSubmissionStats(),
                    adminStatsService.getChallengeSubmissionOverview(),
                ]);
                setOverview(overviewRes);
                setUsersStats(usersRes);
                setChallengeStats(challengesRes);
                setSubmissionStats(submissionsRes);
                setSubmissionQualityStats(qualityRes);
                setChallengeSubmissionOverview(Array.isArray(overviewByChallengeRes) ? overviewByChallengeRes : []);
                if (Array.isArray(overviewByChallengeRes) && overviewByChallengeRes.length > 0) {
                    setSelectedChallengeId((prev) => prev || overviewByChallengeRes[0].challengeId);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
                setError(err?.message || t('admin.dashboard.loadError'));
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

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

    const selectedChallengeOverview = useMemo(
        () => challengeSubmissionOverview.find((item) => item.challengeId === selectedChallengeId) || challengeSubmissionOverview[0] || null,
        [challengeSubmissionOverview, selectedChallengeId],
    );

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

    /* Overall quality stats */
    const overallQuality = useMemo(() => {
        const totalSub = qualityRows.reduce((s, r) => s + r.total, 0);
        const totalSuccess = qualityRows.reduce((s, r) => s + r.successful, 0);
        const rate = totalSub > 0 ? (totalSuccess / totalSub) * 100 : 0;
        return { total: totalSub, successful: totalSuccess, rate };
    }, [qualityRows]);

    /* Count-up for overall rate */
    const animatedOverallRate = useCountUp(Math.round(overallQuality.rate * 10) / 10, 1200);

    if (loading) {
        return <div className="p-6" style={{ color: 'var(--color-text-heading)' }}>{t('admin.dashboard.loading')}</div>;
    }

    if (error) {
        return <div className="p-6 text-red-400">{error}</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="mb-6">
                <h1 className="font-heading text-3xl font-bold mb-2" style={{ color: 'var(--color-text-heading)' }}>{t('admin.dashboard.title')}</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>{t('admin.dashboard.subtitle')}</p>
            </div>

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
                            {challengeSubmissionOverview.length === 0 ? (
                                <Flex direction="column" align="center" justify="center" py={16} gap={3}>
                                    <Icon as={BarChart3} boxSize={8} color="var(--color-text-muted)" opacity={0.4} />
                                    <Text fontSize="sm" color="var(--color-text-muted)">{t('admin.dashboard.noChallengesFound')}</Text>
                                </Flex>
                            ) : challengeSubmissionOverview.map((item, i) => {
                                const rate = Number(item.successRate || 0);
                                const rateColor = getRateColor(rate);
                                const selected = selectedChallengeOverview?.challengeId === item.challengeId;
                                const diffColor = getDiffColor(item.difficulty);
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
                                            <Text fontSize="xs" color="var(--color-text-muted)">
                                                {t('admin.dashboard.subs', { count: item.totalSubmissions })}
                                            </Text>
                                            <Text fontSize="xs" fontWeight="600" color={item.totalSubmissions === 0 ? 'var(--color-text-muted)' : rateColor}>
                                                {item.totalSubmissions === 0 ? '—' : `${rate.toFixed(0)}%`}
                                            </Text>
                                        </Flex>
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
                                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} role="group">
                                    {/* Total Submissions */}
                                    <GlassStatCard
                                        icon={BarChart3} iconColor="#22d3ee" iconBg="rgba(34,211,238,0.12)"
                                        label={t('admin.dashboard.totalSubs')} delay={0.05}
                                    >
                                        <Text fontWeight="800" fontSize="2xl" color="var(--color-text-heading)">
                                            {selectedChallengeOverview.totalSubmissions}
                                        </Text>
                                    </GlassStatCard>

                                    {/* Success Rate with ring (FIX 1 — larger ring) */}
                                    <GlassStatCard
                                        icon={CheckCircle2} iconColor="#22c55e" iconBg="rgba(34,197,94,0.12)"
                                        label={t('admin.dashboard.success')} delay={0.1}
                                    >
                                        <Flex align="center" gap={3}>
                                            <Text fontWeight="800" fontSize="2xl" color="green.400">
                                                {selectedChallengeOverview.totalSubmissions > 0 ? `${Number(selectedChallengeOverview.successRate || 0).toFixed(1)}%` : '—'}
                                            </Text>
                                            <ProgressRing
                                                value={selectedChallengeOverview.totalSubmissions > 0 ? Number(selectedChallengeOverview.successRate || 0) : 0}
                                                color="#22c55e" size={40} strokeWidth={3}
                                            />
                                        </Flex>
                                    </GlassStatCard>

                                    {/* Avg Solve Time */}
                                    <GlassStatCard
                                        icon={Clock} iconColor="#6366f1" iconBg="rgba(99,102,241,0.12)"
                                        label={t('admin.dashboard.avgTime')} delay={0.15}
                                    >
                                        <Text fontWeight="800" fontSize="2xl" color="var(--color-text-heading)">
                                            {selectedChallengeOverview.averageSolveTime > 0 ? `${Number(selectedChallengeOverview.averageSolveTime).toFixed(1)}s` : '—'}
                                        </Text>
                                    </GlassStatCard>

                                    {/* Abandoned */}
                                    <GlassStatCard
                                        icon={PauseCircle} iconColor="#f97316" iconBg="rgba(249,115,22,0.12)"
                                        label={t('admin.dashboard.abandoned')} delay={0.2}
                                    >
                                        <Text fontWeight="800" fontSize="2xl" color="orange.300">
                                            {selectedChallengeOverview.abandonedAttempts}
                                        </Text>
                                    </GlassStatCard>
                                </SimpleGrid>

                                {/* Divider */}
                                <Box h="1px" bg="rgba(255,255,255,0.06)" />

                                {/* Submissions timeline */}
                                <VStack align="stretch" spacing={2} maxH="360px" overflowY="auto" className="scrollbar-thin">
                                    {(selectedChallengeOverview.recentSubmissions || []).map((submission, index) => {
                                        const rowKey = `${submission.userId}-${submission.submittedAt || index}`;
                                        const status = submission.status === 'success' ? t('admin.dashboard.passed') : submission.status === 'abandoned' ? t('admin.dashboard.abandoned') : t('admin.dashboard.failed');
                                        const statusColor = submission.status === 'success' ? '#22c55e' : submission.status === 'abandoned' ? '#f97316' : '#ef4444';
                                        const StatusIcon = submission.status === 'success' ? CheckCircle2 : submission.status === 'abandoned' ? PauseCircle : XCircle;
                                        const isExpanded = expandedSubmissionKey === rowKey;
                                        return (
                                            <Box
                                                key={rowKey}
                                                borderRadius="lg"
                                                border="1px solid rgba(255,255,255,0.06)"
                                                bg="rgba(255,255,255,0.02)"
                                                overflow="hidden"
                                                transition="all .15s ease"
                                                _hover={{ borderColor: 'rgba(255,255,255,0.1)' }}
                                                animation={`${fadeSlideIn} 0.3s ease ${index * 0.05}s both`}
                                            >
                                                <Flex
                                                    px={4} py={3}
                                                    align={{ base: 'flex-start', md: 'center' }}
                                                    direction={{ base: 'column', md: 'row' }}
                                                    gap={2}
                                                >
                                                    {/* Avatar + User info */}
                                                    <Flex align="center" gap={3} flex={1} minW={0}>
                                                        <Flex
                                                            align="center" justify="center"
                                                            boxSize={8} borderRadius="full"
                                                            bg="rgba(34,211,238,0.1)"
                                                            border="1px solid rgba(34,211,238,0.15)"
                                                            flexShrink={0}
                                                        >
                                                            <Text fontSize="xs" fontWeight="700" color="#22d3ee">
                                                                {(submission.username || '?')[0].toUpperCase()}
                                                            </Text>
                                                        </Flex>
                                                        <Box minW={0}>
                                                            <Text fontWeight="500" fontSize="sm" color="var(--color-text-primary)" noOfLines={1}>
                                                                {submission.username}
                                                            </Text>
                                                            <Text fontSize="xs" color="var(--color-text-muted)">
                                                                {formatRelative(submission.submittedAt)}
                                                            </Text>
                                                        </Box>
                                                    </Flex>

                                                    {/* Status + Metrics */}
                                                    <Flex gap={2} align="center" flexWrap="wrap" flexShrink={0}>
                                                        <Flex
                                                            align="center" gap={1}
                                                            px={2} py={1} borderRadius="full"
                                                            bg={`${statusColor}15`}
                                                            border={`1px solid ${statusColor}30`}
                                                        >
                                                            <Icon as={StatusIcon} boxSize={3} color={statusColor} />
                                                            <Text fontSize="10px" fontWeight="700" color={statusColor} textTransform="uppercase">
                                                                {status}
                                                            </Text>
                                                        </Flex>
                                                        <Text fontSize="xs" color="var(--color-text-muted)" fontFamily="var(--font-mono)">
                                                            {submission.executionTime || 0}ms
                                                        </Text>
                                                        <Text
                                                            fontSize="10px" px={1.5} py={0.5}
                                                            borderRadius="md" fontFamily="var(--font-mono)"
                                                            bg="rgba(34,211,238,0.08)" border="1px solid rgba(34,211,238,0.15)"
                                                            color="#22d3ee"
                                                        >
                                                            {submission.language || 'javascript'}
                                                        </Text>
                                                        <Flex
                                                            as="button"
                                                            align="center" gap={1}
                                                            px={2} py={1} borderRadius="md"
                                                            bg="transparent"
                                                            border="1px solid rgba(255,255,255,0.08)"
                                                            cursor="pointer"
                                                            transition="all .15s"
                                                            _hover={{ bg: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)' }}
                                                            _focusVisible={{ boxShadow: '0 0 0 2px rgba(34,211,238,0.4)' }}
                                                            onClick={() => setExpandedSubmissionKey(isExpanded ? null : rowKey)}
                                                        >
                                                            <Icon as={isExpanded ? EyeOff : Eye} boxSize={3} color="var(--color-text-muted)" />
                                                            <Text fontSize="10px" fontWeight="600" color="var(--color-text-muted)">
                                                                {isExpanded ? t('admin.dashboard.hide') : t('admin.dashboard.code')}
                                                            </Text>
                                                        </Flex>
                                                    </Flex>
                                                </Flex>

                                                {/* Expandable code block */}
                                                <Collapse in={isExpanded} animateOpacity>
                                                    <Box px={4} pb={3}>
                                                        {/* Code header bar */}
                                                        <Flex
                                                            align="center" justify="space-between"
                                                            bg="rgba(0,0,0,0.25)" px={3} py={1.5}
                                                            borderTopRadius="md"
                                                            borderBottom="1px solid rgba(255,255,255,0.06)"
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
                                                            border="1px solid rgba(255,255,255,0.06)"
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
                                                            <Text mt={2} fontSize="xs" color="red.300">{submission.errorMessage}</Text>
                                                        )}
                                                    </Box>
                                                </Collapse>
                                            </Box>
                                        );
                                    })}
                                    {(selectedChallengeOverview.recentSubmissions || []).length === 0 && (
                                        <Flex direction="column" align="center" justify="center" py={12} gap={3}>
                                            <Icon as={BarChart3} boxSize={8} color="var(--color-text-muted)" opacity={0.3} />
                                            <Text color="var(--color-text-muted)" fontSize="sm">{t('admin.dashboard.noRecentSubmissions')}</Text>
                                        </Flex>
                                    )}
                                </VStack>
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
