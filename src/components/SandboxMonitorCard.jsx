import React, { useMemo } from 'react';
import {
    Badge,
    Box,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Divider,
    Flex,
    HStack,
    Icon,
    Progress,
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
    Container,
    Cpu,
    Fingerprint,
    Flame,
    HardDrive,
    Hash,
    Image as ImageIcon,
    PlayCircle,
    ServerCog,
    XCircle,
} from 'lucide-react';

const pulse = keyframes`
  0% { transform: scale(1); opacity: .85; }
  50% { transform: scale(1.18); opacity: 1; }
  100% { transform: scale(1); opacity: .85; }
`;

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
    if (status === 'executing') {
        return { label: 'Executing...', color: '#f59e0b', pulse: true };
    }
    if (status === 'running') {
        return { label: 'Running', color: '#22c55e', pulse: true };
    }
    if (status === 'starting') {
        return { label: 'Starting...', color: '#f59e0b', pulse: true };
    }
    return { label: 'Idle', color: '#ef4444', pulse: false };
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

const MetricCard = ({ label, value, icon, tooltip, valueColor }) => (
    <Tooltip label={tooltip} hasArrow placement="top" openDelay={250}>
        <Box
            p={3.5}
            borderRadius="xl"
            border="1px solid var(--color-border)"
            bg="var(--color-bg-input)"
            transition="all .2s ease"
            _hover={{ transform: 'translateY(-1px)', borderColor: 'rgba(56,189,248,0.35)' }}
        >
            <HStack spacing={2} mb={2}>
                <Icon as={icon} boxSize={4} color="var(--color-text-muted)" />
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em" color="var(--color-text-muted)" fontWeight="600">
                    {label}
                </Text>
            </HStack>
            <Text fontWeight="700" fontSize="md" color={valueColor || 'var(--color-text-heading)'} noOfLines={1}>
                {value}
            </Text>
        </Box>
    </Tooltip>
);

const SandboxMonitorCard = ({ status, loading, error }) => {
    const tone = statusConfig(status?.status);
    const health = status?.health || 'no_data';
    const healthValue = useMemo(() => {
        if (health === 'healthy') return 100;
        if (health === 'degraded') return 65;
        if (health === 'unhealthy') return 30;
        return 0;
    }, [health]);
    const healthColor = health === 'healthy' ? 'green' : health === 'degraded' ? 'yellow' : health === 'unhealthy' ? 'red' : 'gray';

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
        <Card
            bg="var(--color-bg-card)"
            border="1px solid var(--color-border)"
            borderRadius="2xl"
            boxShadow="var(--shadow-card)"
            animation="fadeIn .35s ease"
        >
            <CardHeader pb={3}>
                <Flex align="center" justify="space-between" gap={4} wrap="wrap">
                    <HStack spacing={3}>
                        <Flex
                            align="center"
                            justify="center"
                            boxSize={12}
                            borderRadius="xl"
                            border="1px solid var(--color-border)"
                            bg="var(--color-bg-input)"
                        >
                            <Icon as={ServerCog} boxSize={6} color="var(--color-text-heading)" />
                        </Flex>
                        <Box>
                            <Text fontSize="xl" fontWeight="800" color="var(--color-text-heading)">
                                AlgoArenaSandbox
                            </Text>
                            <HStack spacing={2}>
                                <Icon as={ImageIcon} boxSize={3.5} color="var(--color-text-muted)" />
                                <Text fontSize="sm" color="var(--color-text-muted)">
                                    {status?.image || 'No executions yet'}
                                </Text>
                            </HStack>
                        </Box>
                    </HStack>
                    <Badge
                        px={3}
                        py={1.5}
                        borderRadius="full"
                        fontSize="xs"
                        textTransform="none"
                        border={`1px solid ${tone.color}66`}
                        bg={`${tone.color}22`}
                        color={tone.color}
                    >
                        <HStack spacing={2}>
                            <Box
                                boxSize={2}
                                borderRadius="full"
                                bg={tone.color}
                                animation={tone.pulse ? `${pulse} 1.2s infinite ease-in-out` : 'none'}
                            />
                            <Text>{tone.label}</Text>
                        </HStack>
                    </Badge>
                </Flex>
            </CardHeader>

            <Divider borderColor="var(--color-border)" />

            <CardBody pt={4}>
                {loading ? (
                    <HStack spacing={3} color="var(--color-text-muted)">
                        <Spinner size="sm" color="cyan.300" />
                        <Text fontSize="sm">Refreshing sandbox telemetry...</Text>
                    </HStack>
                ) : error ? (
                    <Text color="red.300" fontSize="sm">{error}</Text>
                ) : (
                    <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} spacing={3}>
                        {metrics.map((metric) => (
                            <MetricCard
                                key={metric.label}
                                label={metric.label}
                                value={metric.value}
                                icon={metric.icon}
                                tooltip={metric.tooltip}
                                valueColor={metric.valueColor}
                            />
                        ))}
                    </SimpleGrid>
                )}
            </CardBody>

            <Divider borderColor="var(--color-border)" />

            <CardFooter pt={4}>
                <Box w="full">
                    <Flex align="center" justify="space-between" mb={2}>
                        <HStack spacing={2}>
                            <Icon as={Container} boxSize={4} color="var(--color-text-muted)" />
                            <Text fontSize="sm" color="var(--color-text-muted)">Container Health</Text>
                        </HStack>
                        <Text
                            fontSize="sm"
                            fontWeight="700"
                            color={healthColor === 'green' ? '#22c55e' : healthColor === 'yellow' ? '#f59e0b' : healthColor === 'red' ? '#ef4444' : 'var(--color-text-muted)'}
                        >
                            {status?.healthLabel || 'No Data'}
                        </Text>
                    </Flex>
                    <Progress value={healthValue} size="sm" colorScheme={healthColor} borderRadius="full" bg="var(--color-bg-input)" />
                    <Flex align="center" justify="space-between" mt={3}>
                        <HStack spacing={2}>
                                <Text fontSize="xs" color="var(--color-text-muted)">
                                Last updated: {relativeTime(status?.lastUpdatedAt || null)}
                            </Text>
                            {loading && <Spinner size="xs" color="cyan.300" />}
                        </HStack>
                        <Badge
                            fontSize="10px"
                            px={2}
                            py={0.5}
                            borderRadius="md"
                            bg="var(--color-bg-input)"
                            border="1px solid var(--color-border)"
                            color="var(--color-text-muted)"
                        >
                            <HStack spacing={1}>
                                <Icon as={Hash} boxSize={3} />
                                <Text>AlgoArenaSandbox</Text>
                            </HStack>
                        </Badge>
                    </Flex>
                </Box>
            </CardFooter>
        </Card>
    );
};

export default SandboxMonitorCard;
