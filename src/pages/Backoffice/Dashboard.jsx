import React, { useEffect, useMemo, useState } from 'react';
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
    Divider,
    Flex,
    SimpleGrid,
    Text,
    VStack,
} from '@chakra-ui/react';
import { CodeEditor } from '../../editor';

const Dashboard = () => {
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
                setError(err?.message || 'Failed to load dashboard analytics');
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
                    setSandboxError(err?.message || 'Failed to load sandbox status');
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
        labels: ['Draft', 'Published'],
        values: [Number(challengeStats?.draftChallenges || 0), Number(challengeStats?.publishedChallenges || 0)],
    }), [challengeStats]);

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
        if (!value) return 'N/A';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'N/A';
        const diff = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    if (loading) {
        return <div className="p-6" style={{ color: 'var(--color-text-heading)' }}>Loading dashboard analytics...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-400">{error}</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="mb-6">
                <h1 className="font-heading text-3xl font-bold mb-2" style={{ color: 'var(--color-text-heading)' }}>Dashboard Overview</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Real-time platform analytics and challenge intelligence</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <StatCard
                    value={(overview?.totalUsers || 0).toLocaleString()}
                    label="Total Users"
                    color="cyan"
                    icon={(
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    )}
                />
                <StatCard
                    value={(overview?.activeUsers || 0).toLocaleString()}
                    label="Active Users (7d)"
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
                    label="Total Challenges"
                    color="yellow"
                    icon={(
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                        </svg>
                    )}
                />
                <StatCard
                    value={Number(overview?.totalSubmissions || 0) > 0 ? `${Number(overview?.successRate || 0).toFixed(1)}%` : '-'}
                    label="Submission Success Rate"
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
                    <h2 className="font-heading text-xl font-bold mb-4" style={{ color: 'var(--color-text-heading)' }}>New Users (Last 7 Days)</h2>
                    <div className="h-64 overflow-hidden">
                        <ActiveUsersChart
                            labels={usersStats?.signupsLast7Days?.labels || []}
                            values={usersStats?.signupsLast7Days?.values || []}
                            label="New Users"
                        />
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl shadow-custom">
                    <h2 className="font-heading text-xl font-bold mb-4" style={{ color: 'var(--color-text-heading)' }}>Draft vs Published Challenges</h2>
                    <div className="h-64 overflow-hidden">
                        <GamesChart
                            labels={challengeStatusData.labels}
                            values={challengeStatusData.values}
                            datasetLabel="Challenges"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl shadow-custom">
                    <h2 className="font-heading text-xl font-bold mb-4" style={{ color: 'var(--color-text-heading)' }}>Difficulty Distribution</h2>
                    <div className="h-64 overflow-hidden">
                        <DifficultyChart distribution={challengeStats?.difficultyDistribution} />
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl shadow-custom">
                    <h2 className="font-heading text-xl font-bold mb-4" style={{ color: 'var(--color-text-heading)' }}>Submissions by Difficulty</h2>
                    <div className="h-64 overflow-hidden">
                        <GamesChart
                            labels={submissionsByDifficulty.labels}
                            values={submissionsByDifficulty.values}
                            datasetLabel="Submissions"
                        />
                    </div>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl shadow-custom">
                <h2 className="font-heading text-xl font-bold mb-5" style={{ color: 'var(--color-text-heading)' }}>Submission Quality by Difficulty</h2>
                <div className="space-y-4">
                    {qualityRows.map((item) => {
                        const rate = Math.max(0, Math.min(100, item.successRate || 0));
                        const rateColor = rate >= 90 ? '#22c55e' : rate >= 70 ? '#eab308' : rate >= 50 ? '#f97316' : '#ef4444';
                        return (
                        <div key={item.label} className="rounded-xl p-4" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{item.label}</p>
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.successful} successful / {item.total} total submissions</p>
                            </div>
                            <div className="w-full rounded-full h-2.5" style={{ background: 'rgba(148,163,184,0.2)' }}>
                                <div
                                    className="h-2.5 rounded-full transition-all duration-700"
                                    style={{
                                        width: `${rate}%`,
                                        background: `linear-gradient(90deg, ${rateColor} 0%, ${rateColor}99 100%)`,
                                    }}
                                />
                            </div>
                            <p className="text-xs mt-2 font-medium" style={{ color: rateColor }}>
                                {Number(item.total || 0) === 0 ? '—' : `${Number(item.successRate || 0).toFixed(1)}% success`}
                            </p>
                        </div>
                    )})}
                </div>
            </div>

            <Card bg="var(--color-bg-card)" border="1px solid" borderColor="var(--color-border)" borderRadius="2xl" shadow="md">
                <CardHeader pb={2}>
                    <Text fontFamily="heading" fontSize="xl" fontWeight="bold" color="var(--color-text-heading)">
                        Challenge Submission Analytics
                    </Text>
                </CardHeader>
                <CardBody>
                    <Flex direction={{ base: 'column', lg: 'row' }} gap={4}>
                        <Box w={{ base: '100%', lg: '34%' }} maxH="560px" overflowY="auto" pr={1}>
                            <VStack spacing={3} align="stretch">
                                {challengeSubmissionOverview.map((item) => {
                                    const rate = Number(item.successRate || 0);
                                    const rateColor = rate >= 90 ? 'green.400' : rate >= 70 ? 'yellow.300' : rate >= 50 ? 'orange.300' : 'red.400';
                                    const selected = selectedChallengeOverview?.challengeId === item.challengeId;
                                    return (
                                        <Box
                                            key={item.challengeId}
                                            p={3}
                                            borderRadius="lg"
                                            cursor="pointer"
                                            onClick={() => {
                                                setSelectedChallengeId(item.challengeId);
                                                setExpandedSubmissionKey(null);
                                            }}
                                            bg={selected ? 'rgba(34,211,238,0.12)' : 'var(--color-bg-input)'}
                                            border="1px solid"
                                            borderColor={selected ? 'rgba(34,211,238,0.35)' : 'var(--color-border)'}
                                        >
                                            <Text fontWeight="bold" color="var(--color-text-primary)" noOfLines={1}>{item.challengeTitle}</Text>
                                            <Flex mt={2} justify="space-between" align="center">
                                                <Badge colorScheme="purple">{item.difficulty}</Badge>
                                                <Text fontSize="xs" color="var(--color-text-muted)">{item.totalSubmissions} submissions</Text>
                                            </Flex>
                                            <Text fontSize="xs" mt={1} color={rateColor}>{item.totalSubmissions === 0 ? 'No submissions yet' : `${rate.toFixed(1)}% success`}</Text>
                                        </Box>
                                    );
                                })}
                            </VStack>
                        </Box>

                        <Box flex={1}>
                            {!selectedChallengeOverview ? (
                                <Text color="var(--color-text-muted)">No challenge submission data available yet.</Text>
                            ) : (
                                <VStack align="stretch" spacing={4}>
                                    <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={2}>
                                        <Box>
                                            <Text fontSize="xl" fontWeight="bold" color="var(--color-text-primary)">
                                                {selectedChallengeOverview.challengeTitle}
                                            </Text>
                                            <Badge mt={1} colorScheme="purple">{selectedChallengeOverview.difficulty}</Badge>
                                        </Box>
                                    </Flex>

                                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                                        <Box p={3} border="1px solid" borderColor="var(--color-border)" borderRadius="lg">
                                            <Text fontSize="xs" color="var(--color-text-muted)">Total Submissions</Text>
                                            <Text fontWeight="bold" color="var(--color-text-primary)">{selectedChallengeOverview.totalSubmissions}</Text>
                                        </Box>
                                        <Box p={3} border="1px solid" borderColor="var(--color-border)" borderRadius="lg">
                                            <Text fontSize="xs" color="var(--color-text-muted)">Success Rate</Text>
                                            <Text fontWeight="bold" color="green.400">
                                                {selectedChallengeOverview.totalSubmissions > 0 ? `${Number(selectedChallengeOverview.successRate || 0).toFixed(1)}%` : '—'}
                                            </Text>
                                        </Box>
                                        <Box p={3} border="1px solid" borderColor="var(--color-border)" borderRadius="lg">
                                            <Text fontSize="xs" color="var(--color-text-muted)">Avg Solve Time</Text>
                                            <Text fontWeight="bold" color="var(--color-text-primary)">
                                                {selectedChallengeOverview.averageSolveTime > 0 ? `${Number(selectedChallengeOverview.averageSolveTime).toFixed(1)}s` : '—'}
                                            </Text>
                                        </Box>
                                        <Box p={3} border="1px solid" borderColor="var(--color-border)" borderRadius="lg">
                                            <Text fontSize="xs" color="var(--color-text-muted)">Abandoned Attempts</Text>
                                            <Text fontWeight="bold" color="orange.300">{selectedChallengeOverview.abandonedAttempts}</Text>
                                        </Box>
                                    </SimpleGrid>

                                    {selectedChallengeOverview.totalSubmissions > 0 && Number(selectedChallengeOverview.successRate || 0) < 30 && (
                                        <Badge colorScheme="red" p={2} borderRadius="md">⚠️ Very low success rate. Consider reviewing this challenge&apos;s difficulty or test cases.</Badge>
                                    )}
                                    {selectedChallengeOverview.totalSubmissions > 0 && Number(selectedChallengeOverview.successRate || 0) >= 30 && Number(selectedChallengeOverview.successRate || 0) < 50 && (
                                        <Badge colorScheme="orange" p={2} borderRadius="md">This challenge may be too difficult. Review recommended.</Badge>
                                    )}
                                    {selectedChallengeOverview.totalSubmissions > 0 && (Number(selectedChallengeOverview.abandonedAttempts || 0) / Math.max(1, Number(selectedChallengeOverview.totalSubmissions || 0))) > 0.4 && (
                                        <Badge colorScheme="yellow" p={2} borderRadius="md">High abandonment rate. Users may find this challenge frustrating.</Badge>
                                    )}

                                    <Divider borderColor="var(--color-border)" />

                                    <VStack align="stretch" spacing={3} maxH="360px" overflowY="auto">
                                        {(selectedChallengeOverview.recentSubmissions || []).map((submission, index) => {
                                            const rowKey = `${submission.userId}-${submission.submittedAt || index}`;
                                            const status = submission.status === 'success' ? 'Passed' : submission.status === 'abandoned' ? 'Abandoned' : 'Failed';
                                            const statusColor = submission.status === 'success' ? 'green' : submission.status === 'abandoned' ? 'orange' : 'red';
                                            const isExpanded = expandedSubmissionKey === rowKey;
                                            return (
                                                <Box key={rowKey} border="1px solid" borderColor="var(--color-border)" borderRadius="lg" p={3}>
                                                    <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={2}>
                                                        <Box>
                                                            <Text fontWeight="semibold" color="var(--color-text-primary)">{submission.username}</Text>
                                                            <Text fontSize="xs" color="var(--color-text-muted)">{formatRelative(submission.submittedAt)}</Text>
                                                        </Box>
                                                        <Flex gap={2} align="center">
                                                            <Badge colorScheme={statusColor}>{status}</Badge>
                                                            <Text fontSize="xs" color="var(--color-text-muted)">{submission.executionTime || 0}ms</Text>
                                                            <Text fontSize="xs" color="var(--color-text-muted)">{submission.memoryUsed || 'N/A'}</Text>
                                                            <Badge variant="outline" colorScheme="cyan">{submission.language || 'javascript'}</Badge>
                                                            <Badge
                                                                cursor="pointer"
                                                                onClick={() => setExpandedSubmissionKey(isExpanded ? null : rowKey)}
                                                                colorScheme="purple"
                                                            >
                                                                {isExpanded ? 'Hide Code' : 'View Code'}
                                                            </Badge>
                                                        </Flex>
                                                    </Flex>
                                                    <Collapse in={isExpanded} animateOpacity>
                                                        <Box mt={3}>
                                                            <Box h="220px" border="1px solid" borderColor="var(--color-border)" borderRadius="md" overflow="hidden">
                                                                <CodeEditor
                                                                    code={submission.code || ''}
                                                                    language={submission.language || 'javascript'}
                                                                    readOnly
                                                                    height="100%"
                                                                    options={{ minimap: { enabled: false }, fontSize: 12, wordWrap: 'on' }}
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
                                            <Text color="var(--color-text-muted)">No recent submissions for this challenge.</Text>
                                        )}
                                    </VStack>
                                </VStack>
                            )}
                        </Box>
                    </Flex>
                </CardBody>
            </Card>

            <SandboxMonitorCard
                status={sandboxStatus}
                loading={sandboxLoading}
                error={sandboxError}
            />
        </div>
    );
};

export default Dashboard;
