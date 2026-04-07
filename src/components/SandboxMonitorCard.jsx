import React, { useMemo } from 'react';
import {
    Badge,
    Box,
    Flex,
    HStack,
    Icon,
    SimpleGrid,
    Spinner,
    Text,
    Tooltip,
    keyframes,
} from '@chakra-ui/react';
import {
    Activity,
    AlertTriangle,
    CalendarClock,
    CheckCircle2,
    Cpu,
    Fingerprint,
    Flame,
    HardDrive,
    PlayCircle,
    RefreshCw,
    ServerCog,
    XCircle,
} from 'lucide-react';

/* ─── Keyframe animations ─── */
const pulse = keyframes`
  0% { transform: scale(1); opacity: .85; }
  50% { transform: scale(1.25); opacity: 1; }
  100% { transform: scale(1); opacity: .85; }
`;

const fillBar = keyframes`
  from { width: 0%; }
  to { width: var(--fill-to); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmerSlide = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
`;

/* ─── Formatting helpers (pure display logic — unchanged) ─── */
const formatDuration = (ms) => {
    if (ms == null || Number.isNaN(Number(ms))) return 'No executions yet';
    const value = Math.max(0, Number(ms));
    if (value < 1000) return `${value}ms`;
    if (value < 60000) return `${(value / 1000).toFixed(1)}s`;
    const minutes = Math.floor(value / 60000);
    const seconds = Math.floor((value % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
};

const formatPercent = (value, fallback = 'No data yet') =>
    value == null || Number.isNaN(Number(value)) ? fallback : `${Number(value).toFixed(1)}%`;

const formatMb = (value, fallback = 'No data yet') =>
    value == null || Number.isNaN(Number(value)) ? fallback : `${Number(value).toFixed(1)} MB`;

const relativeTime = (value) => {
    if (!value) return 'No executions yet';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'No executions yet';
    const diff = Date.now() - date.getTime();
    if (diff < 10000) return 'Just now';
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hours = Math.floor(min / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const statusConfig = (status) => {
    if (status === 'executing') return { label: 'EXECUTING', color: '#f59e0b', pulse: true };
    if (status === 'running') return { label: 'RUNNING', color: '#22c55e', pulse: true };
    if (status === 'starting') return { label: 'STARTING', color: '#f59e0b', pulse: true };
    return { label: 'IDLE', color: '#ef4444', pulse: false };
};

const getCpuColor = (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return 'var(--color-text-secondary)';
    if (num < 50) return '#22c55e';
    if (num <= 80) return '#f59e0b';
    return '#ef4444';
};

const getMemoryColor = (value, limitMb = 128) => {
    const num = Number(value);
    if (Number.isNaN(num)) return 'var(--color-text-secondary)';
    const pct = (num / limitMb) * 100;
    if (pct < 60) return '#22c55e';
    if (pct <= 85) return '#f59e0b';
    return '#ef4444';
};

const getSuccessColor = (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return 'var(--color-text-secondary)';
    if (num > 90) return '#22c55e';
    if (num >= 50) return '#f59e0b';
    return '#ef4444';
};

/* ─── Metric icon color map ─── */
const metricColors = {
    'Container ID': { bg: 'rgba(56,189,248,0.12)', color: '#38bdf8' },
    'Last Uptime': { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
    'Avg CPU': { bg: 'rgba(249,115,22,0.12)', color: '#f97316' },
    'Peak CPU': { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
    'Avg Memory': { bg: 'rgba(168,85,247,0.12)', color: '#a855f7' },
    'Peak Memory': { bg: 'rgba(234,179,8,0.12)', color: '#eab308' },
    'Total Runs': { bg: 'rgba(34,211,238,0.12)', color: '#22d3ee' },
    'Success Rate': { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    'Failed Runs': { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
    'Last Run': { bg: 'rgba(99,102,241,0.12)', color: '#6366f1' },
};

/* ─── Glassmorphism Metric Card ─── */
const MetricCard = ({ label, value, icon, tooltip, valueColor, index }) => {
    const palette = metricColors[label] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)' };
    return (
        <Tooltip label={tooltip} hasArrow placement="top" openDelay={250}>
            <Box
                p={4}
                borderRadius="14px"
                border="1px solid rgba(255,255,255,0.06)"
                bg="rgba(255,255,255,0.03)"
                transition="all .2s ease"
                _hover={{
                    transform: 'scale(1.02)',
                    borderColor: 'rgba(255,255,255,0.12)',
                    bg: 'rgba(255,255,255,0.05)',
                }}
                animation={`${fadeSlideIn} 0.4s ease ${index * 0.04}s both`}
                cursor="default"
                position="relative"
                overflow="hidden"
                role="group"
            >
                {/* Shimmer on hover */}
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
                        bgGradient="linear(to-r, transparent, rgba(255,255,255,0.04), transparent)"
                        animation={`${shimmerSlide} 2s ease infinite`}
                    />
                </Box>

                {/* Icon circle */}
                <Flex
                    align="center"
                    justify="center"
                    boxSize={9}
                    borderRadius="full"
                    bg={palette.bg}
                    mb={3}
                    position="relative"
                >
                    <Icon as={icon} boxSize={4} color={palette.color} />
                </Flex>

                {/* Value */}
                <Text
                    fontWeight="700"
                    fontSize={{ base: 'lg', md: 'xl' }}
                    color={valueColor || 'var(--color-text-heading)'}
                    noOfLines={1}
                    fontFamily={label === 'Container ID' ? 'var(--font-mono)' : undefined}
                    letterSpacing={label === 'Container ID' ? '0.02em' : undefined}
                    position="relative"
                >
                    {value}
                </Text>

                {/* Label */}
                <Text
                    fontSize="xs"
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                    color="var(--color-text-muted)"
                    fontWeight="600"
                    mt={1}
                    position="relative"
                >
                    {label}
                </Text>
            </Box>
        </Tooltip>
    );
};

/* ─── Main Component ─── */
const SandboxMonitorCard = ({ status, loading, error }) => {
    const tone = statusConfig(status?.status);
    const health = status?.health || 'no_data';
    const healthValue = useMemo(() => {
        if (health === 'healthy') return 100;
        if (health === 'degraded') return 65;
        if (health === 'unhealthy') return 30;
        return 0;
    }, [health]);

    const healthGradient = healthValue > 80
        ? 'linear-gradient(90deg, #22c55e, #4ade80)'
        : healthValue > 50
            ? 'linear-gradient(90deg, #eab308, #facc15)'
            : healthValue > 0
                ? 'linear-gradient(90deg, #ef4444, #f87171)'
                : 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.08))';

    const metrics = [
        { label: 'Container ID', value: status?.containerId || 'Idle', icon: Fingerprint, tooltip: 'Most recent container short ID.' },
        { label: 'Last Uptime', value: formatDuration(status?.lastUptimeMs), icon: Activity, tooltip: 'Execution duration of the last run.' },
        { label: 'Avg CPU', value: formatPercent(status?.avgCpuPercent), icon: Cpu, tooltip: 'Average peak CPU over recent runs.', valueColor: getCpuColor(status?.avgCpuPercent) },
        { label: 'Peak CPU', value: formatPercent(status?.peakCpuPercent), icon: Flame, tooltip: 'Highest CPU peak recorded.', valueColor: getCpuColor(status?.peakCpuPercent) },
        { label: 'Avg Memory', value: formatMb(status?.avgMemoryMb), icon: HardDrive, tooltip: 'Average peak memory over recent runs.', valueColor: getMemoryColor(status?.avgMemoryMb) },
        { label: 'Peak Memory', value: formatMb(status?.peakMemoryMb), icon: AlertTriangle, tooltip: 'Highest memory peak recorded.', valueColor: getMemoryColor(status?.peakMemoryMb) },
        { label: 'Total Runs', value: String(status?.totalExecutions ?? 0), icon: PlayCircle, tooltip: 'All recorded executions.' },
        { label: 'Success Rate', value: formatPercent(status?.successRate), icon: CheckCircle2, tooltip: 'Successful executions / total executions.', valueColor: getSuccessColor(status?.successRate) },
        { label: 'Failed Runs', value: String(status?.failedExecutions ?? 0), icon: XCircle, tooltip: 'Failed execution count.' },
        { label: 'Last Run', value: relativeTime(status?.lastExecutionAt || null), icon: CalendarClock, tooltip: 'Relative time since latest run.' },
    ];

    return (
        /* FIX 2: Use glass-panel + shadow-custom to match other dashboard cards */
        <Box
            className="glass-panel rounded-2xl shadow-custom spotlight-hover"
            overflow="hidden"
            animation={`${fadeSlideIn} 0.5s ease 0.25s both`}
            transition="all .3s ease"
            _hover={{ boxShadow: 'var(--shadow-custom-hover)' }}
        >
            {/* ─── Header with subtle gradient ─── */}
            <Box
                pb={3}
                pt={5}
                px={6}
                bgGradient={`linear(to-r, ${tone.color}08, transparent 60%)`}
            >
                <Flex align="center" justify="space-between" gap={4} wrap="wrap">
                    <HStack spacing={4}>
                        {/* Server icon with glow */}
                        <Flex
                            align="center"
                            justify="center"
                            boxSize={12}
                            borderRadius="xl"
                            bg={`${tone.color}15`}
                            border={`1px solid ${tone.color}30`}
                            boxShadow={`0 0 20px ${tone.color}15`}
                        >
                            <Icon as={ServerCog} boxSize={6} color={tone.color} />
                        </Flex>
                        <Box>
                            <Text
                                fontFamily="heading"
                                fontSize="lg"
                                fontWeight="800"
                                bgGradient={`linear(to-r, var(--color-text-heading), ${tone.color})`}
                                bgClip="text"
                                letterSpacing="0.04em"
                                textTransform="uppercase"
                            >
                                AlgoArenaSandbox
                            </Text>
                            <Text
                                fontSize="xs"
                                color="var(--color-text-muted)"
                                fontFamily="var(--font-mono)"
                                mt={0.5}
                            >
                                {status?.image || 'No executions yet'}
                            </Text>
                        </Box>
                    </HStack>

                    {/* Status pill */}
                    <Badge
                        px={3.5}
                        py={1.5}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="700"
                        letterSpacing="0.06em"
                        textTransform="uppercase"
                        border={`1px solid ${tone.color}40`}
                        bg={`${tone.color}15`}
                        color={tone.color}
                        boxShadow={`0 0 12px ${tone.color}20`}
                    >
                        <HStack spacing={2}>
                            <Box
                                boxSize={2}
                                borderRadius="full"
                                bg={tone.color}
                                boxShadow={`0 0 6px ${tone.color}`}
                                animation={tone.pulse ? `${pulse} 1.4s infinite ease-in-out` : 'none'}
                            />
                            <Text>{tone.label}</Text>
                        </HStack>
                    </Badge>
                </Flex>
            </Box>

            {/* ─── Subtle separator ─── */}
            <Box h="1px" bg="rgba(255,255,255,0.06)" mx={6} />

            {/* ─── Metrics Grid ─── */}
            <Box pt={5} px={6} pb={5}>
                {loading ? (
                    <Flex align="center" gap={3} color="var(--color-text-muted)" py={8} justify="center">
                        <Spinner size="sm" color="cyan.300" />
                        <Text fontSize="sm">Refreshing sandbox telemetry...</Text>
                    </Flex>
                ) : error ? (
                    <Text color="red.300" fontSize="sm" py={8} textAlign="center">{error}</Text>
                ) : (
                    <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} spacing={3}>
                        {metrics.map((metric, i) => (
                            <MetricCard
                                key={metric.label}
                                index={i}
                                label={metric.label}
                                value={metric.value}
                                icon={metric.icon}
                                tooltip={metric.tooltip}
                                valueColor={metric.valueColor}
                            />
                        ))}
                    </SimpleGrid>
                )}
            </Box>

            {/* ─── Subtle separator ─── */}
            <Box h="1px" bg="rgba(255,255,255,0.06)" mx={6} />

            {/* ─── Health Bar & Footer ─── */}
            <Box pt={4} pb={4} px={6}>
                <Box w="full">
                    {/* Health header */}
                    <Flex align="center" justify="space-between" mb={2.5}>
                        <Text
                            fontSize="xs"
                            textTransform="uppercase"
                            letterSpacing="0.08em"
                            color="var(--color-text-muted)"
                            fontWeight="600"
                        >
                            System Health
                        </Text>
                        <Text
                            fontSize="xs"
                            fontWeight="700"
                            color={
                                healthValue > 80 ? '#22c55e'
                                    : healthValue > 50 ? '#eab308'
                                        : healthValue > 0 ? '#ef4444'
                                            : 'var(--color-text-muted)'
                            }
                            textTransform="uppercase"
                            letterSpacing="0.04em"
                        >
                            {status?.healthLabel || 'No Data'}
                        </Text>
                    </Flex>

                    {/* Gradient health bar */}
                    <Box
                        w="full"
                        h="6px"
                        borderRadius="full"
                        bg="rgba(255,255,255,0.06)"
                        overflow="hidden"
                    >
                        <Box
                            h="full"
                            borderRadius="full"
                            bgGradient={healthGradient}
                            style={{ '--fill-to': `${healthValue}%` }}
                            animation={`${fillBar} 1s ease-out forwards`}
                        />
                    </Box>

                    {/* Footer meta */}
                    <Flex align="center" justify="space-between" mt={3}>
                        <HStack spacing={2}>
                            <Text fontSize="xs" color="var(--color-text-muted)">
                                Last synced: {relativeTime(status?.lastUpdatedAt || null)}
                            </Text>
                            {loading && (
                                <Icon
                                    as={RefreshCw}
                                    boxSize={3}
                                    color="cyan.300"
                                    animation={`${spin} 1s linear infinite`}
                                />
                            )}
                        </HStack>
                        <Text
                            fontSize="10px"
                            px={2}
                            py={0.5}
                            borderRadius="md"
                            bg="rgba(255,255,255,0.04)"
                            border="1px solid rgba(255,255,255,0.06)"
                            color="var(--color-text-muted)"
                            fontFamily="var(--font-mono)"
                        >
                            AlgoArenaSandbox
                        </Text>
                    </Flex>
                </Box>
            </Box>
        </Box>
    );
};

export default SandboxMonitorCard;
