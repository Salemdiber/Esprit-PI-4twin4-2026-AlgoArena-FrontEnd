import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Collapse,
  Flex,
  Icon,
  SimpleGrid,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import {
  AlertTriangle,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Copy,
  Download,
  Eye,
  EyeOff,
  Flag,
  PauseCircle,
  RotateCcw,
  Users,
  XCircle,
} from 'lucide-react';
import CodeEditor from '../../../editor/components/CodeEditor';
import { useTranslation } from 'react-i18next';

// Icon library found: lucide-react
// Using: AlertTriangle, BarChart3, CheckCircle2, ChevronRight, Download, Eye, EyeOff, Flag, PauseCircle, RotateCcw, Users, XCircle
// All confirmed present in lucide-react.
// Colors confirmed from index.css:
// success -> var(--color-green-500), error -> var(--color-red-500), warning -> var(--color-yellow-500)
// muted -> var(--color-text-muted), border -> var(--color-border), card -> var(--color-bg-card)

const normalizeSubmissionStatus = (status) => {
  if (status === 'success' || status === 'passed') return 'passed';
  if (status === 'abandoned') return 'abandoned';
  return 'failed';
};

const getRuntimeColor = (runtime) => {
  const value = Number(runtime || 0);
  if (!value) return 'var(--color-text-muted)';
  if (value < 500) return 'var(--color-green-500)';
  if (value <= 2000) return 'var(--color-yellow-500)';
  return 'var(--color-red-500)';
};

const getStatusColors = (status) => {
  if (status === 'passed') {
    return { bg: 'var(--color-success-bg)', color: 'var(--color-green-500)' };
  }
  if (status === 'abandoned') {
    return { bg: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' };
  }
  return { bg: 'var(--color-error-bg)', color: 'var(--color-red-500)' };
};

const getLanguageStyle = (language) => {
  const key = String(language || '').toLowerCase();
  if (key === 'javascript' || key === 'js') {
    return { label: 'JS', bg: 'var(--color-warning-bg)', color: 'var(--color-yellow-500)' };
  }
  if (key === 'python' || key === 'py') {
    return { label: 'PY', bg: 'var(--color-info-bg)', color: 'var(--color-cyan-400)' };
  }
  if (key === 'java' || key === 'jv') {
    return { label: 'JV', bg: 'var(--color-warning-bg)', color: 'var(--color-yellow-600)' };
  }
  if (key === 'cpp' || key === 'c++') {
    return { label: 'C++', bg: 'var(--color-info-bg)', color: 'var(--color-purple-500)' };
  }
  return {
    label: key ? key.slice(0, 3).toUpperCase() : 'N/A',
    bg: 'var(--color-bg-secondary)',
    color: 'var(--color-text-muted)',
  };
};

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

const CopyButton = ({ text }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(text || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }, [text]);

  return (
    <Flex as="button" align="center" gap={1} onClick={handleCopy} opacity={0.8} _hover={{ opacity: 1 }}>
      <Icon as={copied ? Check : Copy} boxSize={3} color={copied ? 'var(--color-green-500)' : 'var(--color-text-muted)'} />
      <Text fontSize="10px" color={copied ? 'var(--color-green-500)' : 'var(--color-text-muted)'}>
        {copied ? t('admin.dashboard.copied') : t('admin.dashboard.copy')}
      </Text>
    </Flex>
  );
};

const ChallengeAnalyticsSection = ({ challengeSubmissionOverview = [], getDiffColor }) => {
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);
  const [expandedSubmissionKey, setExpandedSubmissionKey] = useState(null);
  const [submissionTab, setSubmissionTab] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('submissions');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [flaggedRows, setFlaggedRows] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filtersAreDefault =
    difficultyFilter === 'all' &&
    statusFilter === 'all' &&
    languageFilter === 'all' &&
    sortBy === 'submissions' &&
    !searchTerm;

  const filteredChallenges = useMemo(() => {
    const list = challengeSubmissionOverview.filter((challenge) => {
      const diffPass =
        difficultyFilter === 'all' ||
        String(challenge.difficulty || '').toLowerCase() === difficultyFilter;
      const searchPass =
        !searchTerm || String(challenge.challengeTitle || '').toLowerCase().includes(searchTerm);
      return diffPass && searchPass;
    });

    return [...list].sort((a, b) => {
      const aSubs = Number(a.totalSubmissions || 0);
      const bSubs = Number(b.totalSubmissions || 0);
      const aRate = Number(a.successRate || 0);
      const bRate = Number(b.successRate || 0);
      const aDrop = aSubs ? Number(a.abandonedAttempts || 0) / aSubs : 0;
      const bDrop = bSubs ? Number(b.abandonedAttempts || 0) / bSubs : 0;
      if (sortBy === 'passRateDesc') return bRate - aRate;
      if (sortBy === 'passRateAsc') return aRate - bRate;
      if (sortBy === 'dropout') return bDrop - aDrop;
      if (sortBy === 'alpha') {
        return String(a.challengeTitle || '').localeCompare(String(b.challengeTitle || ''));
      }
      return bSubs - aSubs;
    });
  }, [challengeSubmissionOverview, difficultyFilter, searchTerm, sortBy]);

  useEffect(() => {
    if (!filteredChallenges.length) {
      setSelectedChallengeId(null);
      return;
    }
    if (!filteredChallenges.some((item) => item.challengeId === selectedChallengeId)) {
      setSelectedChallengeId(filteredChallenges[0].challengeId);
      setExpandedSubmissionKey(null);
      setSubmissionTab('all');
    }
  }, [filteredChallenges, selectedChallengeId]);

  const selectedChallenge =
    filteredChallenges.find((item) => item.challengeId === selectedChallengeId) ||
    filteredChallenges[0] ||
    null;

  const availableLanguages = useMemo(() => {
    const values = new Set();
    challengeSubmissionOverview.forEach((challenge) => {
      (challenge.recentSubmissions || []).forEach((submission) => {
        const lang = String(submission.language || '').toLowerCase();
        if (lang && lang !== 'n/a') values.add(lang);
      });
    });
    return [...values].sort((a, b) => String(a).localeCompare(String(b)));
  }, [challengeSubmissionOverview]);

  const visibleSubmissions = useMemo(() => {
    if (!selectedChallenge) return [];
    return (selectedChallenge.recentSubmissions || []).filter((submission) => {
      const status = normalizeSubmissionStatus(submission.status);
      const statusPass = statusFilter === 'all' || status === statusFilter;
      const lang = String(submission.language || '').toLowerCase();
      const languagePass = languageFilter === 'all' || lang === languageFilter;
      return statusPass && languagePass;
    });
  }, [selectedChallenge, statusFilter, languageFilter]);

  const usersSummary = useMemo(() => {
    const grouped = new Map();
    visibleSubmissions.forEach((submission) => {
      const username = submission.username || 'Unknown';
      if (!grouped.has(username)) grouped.set(username, []);
      grouped.get(username).push(submission);
    });

    return [...grouped.entries()]
      .map(([username, submissions]) => {
        const attempts = [...submissions].sort(
          (a, b) => new Date(a.submittedAt || 0).getTime() - new Date(b.submittedAt || 0).getTime(),
        );
        const passed = attempts.filter((item) => normalizeSubmissionStatus(item.status) === 'passed').length;
        const failed = attempts.filter((item) => normalizeSubmissionStatus(item.status) === 'failed').length;
        const abandoned = attempts.filter((item) => normalizeSubmissionStatus(item.status) === 'abandoned').length;
        return {
          username,
          attempts,
          count: attempts.length,
          passed,
          failed,
          abandoned,
          passRate: attempts.length ? (passed / attempts.length) * 100 : 0,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [visibleSubmissions]);

  const globalStats = useMemo(() => {
    const totalSubmissions = challengeSubmissionOverview.reduce((sum, item) => sum + Number(item.totalSubmissions || 0), 0);
    const totalPassed = challengeSubmissionOverview.reduce((sum, item) => sum + Number(item.successfulSubmissions || 0), 0);
    const totalFailed = challengeSubmissionOverview.reduce((sum, item) => sum + Number(item.failedSubmissions || 0), 0);
    const totalAbandoned = challengeSubmissionOverview.reduce((sum, item) => sum + Number(item.abandonedAttempts || 0), 0);
    const mostAttempted = challengeSubmissionOverview.reduce(
      (best, item) =>
        Number(item.totalSubmissions || 0) > Number(best?.totalSubmissions || 0) ? item : best,
      challengeSubmissionOverview[0] || null,
    );
    const highestDropout = challengeSubmissionOverview.reduce((best, item) => {
      const submissions = Number(item.totalSubmissions || 0);
      const ratio = submissions > 0 ? Number(item.abandonedAttempts || 0) / submissions : 0;
      if (!best || ratio > best.ratio) return { item, ratio };
      return best;
    }, null);

    return {
      totalSubmissions,
      passRate: totalSubmissions ? (totalPassed / totalSubmissions) * 100 : 0,
      totalFailed,
      totalAbandoned,
      mostAttemptedTitle: mostAttempted?.challengeTitle || '—',
      highestDropoutTitle: highestDropout?.item?.challengeTitle || '—',
    };
  }, [challengeSubmissionOverview]);

  const toggleFlag = useCallback((submission, rowKey) => {
    const key = rowKey || `${submission.userId || 'unknown'}-${submission.submittedAt || Date.now()}-${submission.status || 'failed'}`;
    setFlaggedRows((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetFilters = useCallback(() => {
    setDifficultyFilter('all');
    setStatusFilter('all');
    setLanguageFilter('all');
    setSortBy('submissions');
    setSearchInput('');
  }, []);

  const exportCsv = useCallback(() => {
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
    const rows = filteredChallenges.map((challenge) => {
      const latest = (challenge.recentSubmissions || [])
        .map((submission) => new Date(submission.submittedAt || 0))
        .filter((date) => !Number.isNaN(date.getTime()))
        .sort((a, b) => b.getTime() - a.getTime())[0];
      return [
        challenge.challengeTitle || '',
        challenge.difficulty || '',
        Number(challenge.totalSubmissions || 0),
        Number(challenge.successfulSubmissions || 0),
        Number(challenge.failedSubmissions || 0),
        Number(challenge.abandonedAttempts || 0),
        Number(challenge.successRate || 0).toFixed(1),
        Number(challenge.averageSolveTime || 0),
        latest ? latest.toLocaleString() : 'No activity',
      ];
    });

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `challenges-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredChallenges]);

  return (
    <Box className="glass-panel rounded-2xl shadow-custom spotlight-hover" overflow="hidden">
      <Box px={6} pt={5} pb={2}>
        <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
          <Text fontFamily="heading" fontSize="xl" fontWeight="bold" bgGradient="linear(to-r, var(--color-text-heading), var(--color-cyan-400))" bgClip="text">
            Challenge Analytics
          </Text>
          <Badge px={2.5} py={1} borderRadius="full" bg="var(--color-info-bg)" color="var(--color-cyan-400)" border="1px solid var(--color-glass-border-strong)" fontSize="xs" fontWeight="700">
            {filteredChallenges.length} challenges
          </Badge>
        </Flex>
      </Box>

      <Box px={6} pb={4}>
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={2}>
          <Flex px={3} py={2} border="1px solid var(--color-border)" borderRadius="md" bg="var(--color-bg-card)" gap={2} align="center"><Icon as={BarChart3} boxSize={3.5} color="var(--color-cyan-400)" /><Text fontSize="xs">Total submissions: {globalStats.totalSubmissions || '—'}</Text></Flex>
          <Flex px={3} py={2} border="1px solid var(--color-border)" borderRadius="md" bg="var(--color-bg-card)" gap={2} align="center"><Icon as={CheckCircle2} boxSize={3.5} color="var(--color-green-500)" /><Text fontSize="xs">Overall pass rate: {globalStats.totalSubmissions ? `${globalStats.passRate.toFixed(1)}%` : '—'}</Text></Flex>
          <Flex px={3} py={2} border="1px solid var(--color-border)" borderRadius="md" bg="var(--color-bg-card)" gap={2} align="center"><Icon as={XCircle} boxSize={3.5} color="var(--color-red-500)" /><Text fontSize="xs">Total failed: {globalStats.totalFailed || '—'}</Text></Flex>
          <Flex px={3} py={2} border="1px solid var(--color-border)" borderRadius="md" bg="var(--color-bg-card)" gap={2} align="center"><Icon as={PauseCircle} boxSize={3.5} color="var(--color-yellow-500)" /><Text fontSize="xs">Total abandoned: {globalStats.totalAbandoned || '—'}</Text></Flex>
          <Tooltip label={globalStats.mostAttemptedTitle}><Flex px={3} py={2} border="1px solid var(--color-border)" borderRadius="md" bg="var(--color-bg-card)" gap={2} align="center"><Icon as={Users} boxSize={3.5} color="var(--color-cyan-400)" /><Text fontSize="xs">Most attempted: {(globalStats.mostAttemptedTitle || '—').slice(0, 20)}{globalStats.mostAttemptedTitle?.length > 20 ? '...' : ''}</Text></Flex></Tooltip>
          <Tooltip label={globalStats.highestDropoutTitle}><Flex px={3} py={2} border="1px solid var(--color-border)" borderRadius="md" bg="var(--color-bg-card)" gap={2} align="center"><Icon as={AlertTriangle} boxSize={3.5} color="var(--color-yellow-500)" /><Text fontSize="xs">Highest dropout: {(globalStats.highestDropoutTitle || '—').slice(0, 20)}{globalStats.highestDropoutTitle?.length > 20 ? '...' : ''}</Text></Flex></Tooltip>
        </SimpleGrid>
      </Box>

      <Flex direction={{ base: 'column', lg: 'row' }} minH="520px">
        <Box w={{ base: '100%', lg: '380px' }} flexShrink={0} borderRight={{ base: 'none', lg: '1px solid var(--color-table-divider)' }} borderBottom={{ base: '1px solid var(--color-table-divider)', lg: 'none' }} px={3} py={3}>
          <VStack align="stretch" spacing={3}>
            <Flex gap={2} flexWrap="wrap">
              {['all', 'easy', 'medium', 'hard'].map((difficulty) => {
                const active = difficultyFilter === difficulty;
                const diffColor = difficulty === 'all' ? 'var(--color-cyan-400)' : getDiffColor(difficulty);
                return (
                  <Flex key={difficulty} as="button" type="button" px={3} py={1.5} borderRadius="full" border="1px solid" borderColor={active ? diffColor : 'var(--color-border)'} bg={active ? 'var(--color-info-bg)' : 'transparent'} color={active ? diffColor : 'var(--color-text-muted)'} fontSize="xs" fontWeight="700" textTransform="uppercase" onClick={() => setDifficultyFilter(difficulty)}>
                    {difficulty}
                  </Flex>
                );
              })}
            </Flex>
            <Flex gap={2}>
              <select className="form-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">Status: All</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="abandoned">Abandoned</option>
              </select>
              <select className="form-select" value={languageFilter} onChange={(event) => setLanguageFilter(event.target.value)}>
                <option value="all">Language: All</option>
                {availableLanguages.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </Flex>
            <select className="form-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="submissions">Most submissions</option>
              <option value="passRateDesc">Highest pass rate</option>
              <option value="passRateAsc">Lowest pass rate</option>
              <option value="dropout">Highest abandonment</option>
              <option value="alpha">Alphabetical</option>
            </select>
            <Flex align="center" gap={2}>
              <input className="search-input" placeholder="Search challenge..." value={searchInput} onChange={(event) => setSearchInput(event.target.value)} style={{ width: '100%', paddingLeft: '0.75rem' }} />
              {searchInput && <Flex as="button" type="button" px={2.5} py={2} borderRadius="md" border="1px solid var(--color-border)" color="var(--color-text-muted)" onClick={() => setSearchInput('')}>×</Flex>}
            </Flex>
            <Flex justify="space-between" align="center">
              <Text fontSize="xs" color="var(--color-text-muted)">Showing {filteredChallenges.length} of {challengeSubmissionOverview.length} challenges</Text>
              <Flex gap={2}>
                <Flex as="button" type="button" px={2.5} py={1.5} borderRadius="md" border="1px solid var(--color-border)" align="center" gap={1.5} onClick={exportCsv}><Icon as={Download} boxSize={3} /><Text fontSize="xs">Export CSV</Text></Flex>
                {!filtersAreDefault && <Flex as="button" type="button" px={2.5} py={1.5} borderRadius="md" border="1px solid var(--color-border)" align="center" gap={1.5} onClick={resetFilters}><Icon as={RotateCcw} boxSize={3} /><Text fontSize="xs">Reset</Text></Flex>}
              </Flex>
            </Flex>
          </VStack>

          <Box mt={3} maxH={{ base: '280px', lg: '520px' }} overflowY="auto" className="scrollbar-thin" px={1} py={1}>
            {filteredChallenges.length === 0 ? (
              <Flex direction="column" align="center" justify="center" py={12} gap={3}>
                <Icon as={BarChart3} boxSize={8} color="var(--color-text-muted)" opacity={0.4} />
                <Text fontSize="sm" color="var(--color-text-muted)">No challenge matches current filters</Text>
              </Flex>
            ) : (
              filteredChallenges.map((challenge) => {
                const submissions = Number(challenge.totalSubmissions || 0);
                const passRate = Number(challenge.successRate || 0);
                const dropoutRate = submissions > 0 ? Number(challenge.abandonedAttempts || 0) / submissions : 0;
                const selected = selectedChallenge?.challengeId === challenge.challengeId;
                const diffColor = getDiffColor(challenge.difficulty);
                const passColor = submissions === 0 ? 'var(--color-text-muted)' : passRate > 70 ? 'var(--color-green-500)' : passRate >= 40 ? 'var(--color-yellow-500)' : 'var(--color-red-500)';
                const latest = (challenge.recentSubmissions || [])
                  .map((item) => new Date(item.submittedAt || 0))
                  .filter((date) => !Number.isNaN(date.getTime()))
                  .sort((a, b) => b.getTime() - a.getTime())[0];
                const age = latest ? Math.floor((Date.now() - latest.getTime()) / (24 * 60 * 60 * 1000)) : null;
                const activityColor = age === null ? 'var(--color-text-muted)' : age < 7 ? 'var(--color-green-500)' : age < 30 ? 'var(--color-yellow-500)' : 'var(--color-text-muted)';

                return (
                  <Box key={challenge.challengeId} px={3} py={3} mb={2} borderRadius="lg" cursor="pointer" onClick={() => { setSelectedChallengeId(challenge.challengeId); setExpandedSubmissionKey(null); setSubmissionTab('all'); }} bg={selected ? 'rgba(255,255,255,0.06)' : 'transparent'} borderLeft="3px solid" borderLeftColor={selected ? diffColor : 'transparent'}>
                    <Flex justify="space-between" align="flex-start" gap={2}>
                      <Tooltip label={challenge.challengeTitle}><Text fontWeight="500" fontSize="sm" color="var(--color-text-primary)" noOfLines={1}>{challenge.challengeTitle}</Text></Tooltip>
                      {dropoutRate > 0.3 && <Text fontSize="10px" px={1.5} py={0.5} borderRadius="full" bg="var(--color-warning-bg)" color="var(--color-yellow-500)" border="1px solid var(--color-border)">High dropout</Text>}
                    </Flex>
                    <Flex mt={1.5} align="center" gap={2}>
                      <Text fontSize="10px" fontWeight="700" px={1.5} py={0.5} borderRadius="full" bg={`${diffColor}18`} color={diffColor} textTransform="uppercase">{challenge.difficulty}</Text>
                      <Text fontSize="xs" color="var(--color-text-muted)">{submissions} subs</Text>
                    </Flex>
                    <Flex mt={2} align="center" gap={2}>
                      <Box flex={1} h="6px" borderRadius="full" bg="var(--color-border-subtle)"><Box h="100%" borderRadius="full" bg={passColor} width={submissions ? `${Math.max(0, Math.min(100, passRate))}%` : '0%'} /></Box>
                      <Text fontSize="xs" fontWeight="600" color={passColor}>{submissions ? `${passRate.toFixed(0)}%` : '—'}</Text>
                      <Icon as={ChevronRight} boxSize={3.5} color="var(--color-text-muted)" />
                    </Flex>
                    <Text mt={1.5} fontSize="xs" color={activityColor}>{latest ? formatRelative(latest) : 'No activity'}</Text>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>

        <Box flex={1} px={6} py={5}>
          {!selectedChallenge ? (
            <Flex direction="column" align="center" justify="center" h="full" gap={4} py={16}>
              <Icon as={BarChart3} boxSize={12} color="var(--color-text-muted)" opacity={0.2} />
              <Text color="var(--color-text-muted)" fontSize="sm">Select a challenge</Text>
            </Flex>
          ) : (
            <VStack align="stretch" spacing={5}>
              <Text fontSize="xl" fontWeight="bold" color="var(--color-text-primary)">{selectedChallenge.challengeTitle}</Text>
              <SimpleGrid columns={{ base: 2, md: 4, lg: 7 }} spacing={3}>
                <Flex px={3} py={2} borderRadius="md" border="1px solid var(--color-border)" bg="var(--color-bg-card)"><Text fontSize="xs">Total: {selectedChallenge.totalSubmissions}</Text></Flex>
                <Flex px={3} py={2} borderRadius="md" border="1px solid var(--color-border)" bg="var(--color-bg-card)"><Text fontSize="xs">Success: {selectedChallenge.totalSubmissions > 0 ? `${Number(selectedChallenge.successRate || 0).toFixed(1)}%` : '—'}</Text></Flex>
                <Flex px={3} py={2} borderRadius="md" border="1px solid var(--color-border)" bg="var(--color-bg-card)"><Text fontSize="xs">Avg: {selectedChallenge.averageSolveTime > 0 ? `${Number(selectedChallenge.averageSolveTime).toFixed(1)}s` : '—'}</Text></Flex>
                <Flex px={3} py={2} borderRadius="md" border="1px solid var(--color-border)" bg="var(--color-bg-card)"><Text fontSize="xs">Abandoned: {selectedChallenge.abandonedAttempts}</Text></Flex>
                <Flex px={3} py={2} borderRadius="md" border="1px solid var(--color-border)" bg="var(--color-bg-card)"><Text fontSize="xs">Unique users: {new Set(visibleSubmissions.map((item) => item.username || 'Unknown')).size}</Text></Flex>
                <Flex px={3} py={2} borderRadius="md" border="1px solid var(--color-border)" bg="var(--color-bg-card)"><Text fontSize="xs">Failed: {visibleSubmissions.length ? `${((visibleSubmissions.filter((item) => normalizeSubmissionStatus(item.status) === 'failed').length / visibleSubmissions.length) * 100).toFixed(1)}%` : '—'}</Text></Flex>
                <Flex px={3} py={2} borderRadius="md" border="1px solid var(--color-border)" bg="var(--color-bg-card)"><Text fontSize="xs">Top language: {(Object.entries(visibleSubmissions.reduce((acc, item) => { const key = String(item.language || 'n/a').toLowerCase(); acc[key] = (acc[key] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))[0]?.[0]) || '—'}</Text></Flex>
              </SimpleGrid>

              <Flex gap={2}>
                <Flex as="button" type="button" px={3} py={1.5} borderRadius="md" border="1px solid var(--color-border)" bg={submissionTab === 'all' ? 'var(--color-info-bg)' : 'transparent'} color={submissionTab === 'all' ? 'var(--color-cyan-400)' : 'var(--color-text-muted)'} onClick={() => setSubmissionTab('all')}>All submissions</Flex>
                <Flex as="button" type="button" px={3} py={1.5} borderRadius="md" border="1px solid var(--color-border)" bg={submissionTab === 'byUser' ? 'var(--color-info-bg)' : 'transparent'} color={submissionTab === 'byUser' ? 'var(--color-cyan-400)' : 'var(--color-text-muted)'} onClick={() => setSubmissionTab('byUser')}>By user</Flex>
              </Flex>

              {submissionTab === 'all' ? (
                <VStack align="stretch" spacing={2} maxH="360px" overflowY="auto" className="scrollbar-thin">
                  {visibleSubmissions.map((submission, idx) => {
                    const rowKey = `${submission.userId || 'unknown'}-${submission.submittedAt || idx}-${submission.status || 'failed'}`;
                    const status = normalizeSubmissionStatus(submission.status);
                    const statusUi = getStatusColors(status);
                    const runtimeColor = getRuntimeColor(submission.executionTime);
                    const lang = getLanguageStyle(submission.language);
                    const flagged = Boolean(flaggedRows[rowKey] || submission.isFlagged);
                    const expanded = expandedSubmissionKey === rowKey;
                    return (
                      <Box key={rowKey} borderRadius="lg" border="1px solid var(--color-table-divider)" bg="var(--color-bg-card)" role="group">
                        <Flex px={4} py={3} align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={2}>
                          <Flex align="center" gap={3} flex={1} minW={0}>
                            <Flex align="center" justify="center" boxSize={8} borderRadius="full" bg="var(--color-info-bg)" border="1px solid var(--color-glass-border-strong)">
                              <Text fontSize="xs" fontWeight="700" color="var(--color-cyan-400)">{(submission.username || '?')[0].toUpperCase()}</Text>
                            </Flex>
                            <Box minW={0}>
                              <Flex align="center" gap={1.5}>
                                {flagged && <Text fontSize="xs" color="var(--color-red-500)">⚑</Text>}
                                <Text fontWeight="500" fontSize="sm" color="var(--color-text-primary)" noOfLines={1}>{submission.username}</Text>
                              </Flex>
                              <Text fontSize="xs" color="var(--color-text-muted)">{formatRelative(submission.submittedAt)}</Text>
                            </Box>
                          </Flex>

                          <Flex gap={2} align="center" flexWrap="wrap" flexShrink={0}>
                            <Flex align="center" gap={1} px={2} py={1} borderRadius="full" bg={statusUi.bg} border="1px solid var(--color-border)">
                              <Icon as={status === 'passed' ? CheckCircle2 : status === 'failed' ? XCircle : PauseCircle} boxSize={3} color={statusUi.color} />
                              <Text fontSize="10px" fontWeight="700" color={statusUi.color} textTransform="uppercase">{status}</Text>
                            </Flex>
                            <Text fontSize="xs" color={runtimeColor} fontFamily="var(--font-mono)">{Number(submission.executionTime || 0) > 0 ? `${Number(submission.executionTime)}ms` : '—'}</Text>
                            <Text fontSize="10px" px={1.5} py={0.5} borderRadius="md" fontFamily="var(--font-mono)" bg={lang.bg} border="1px solid var(--color-border)" color={lang.color}>{lang.label}</Text>
                            <Flex as="button" type="button" align="center" gap={1} px={2} py={1} borderRadius="md" border="1px solid var(--color-border)" _hover={{ bg: 'var(--color-hover-bg)' }} onClick={() => setExpandedSubmissionKey(expanded ? null : rowKey)}>
                              <Icon as={expanded ? EyeOff : Eye} boxSize={3} color="var(--color-text-muted)" />
                              <Text fontSize="10px" color="var(--color-text-muted)">{expanded ? 'Hide' : 'Code'}</Text>
                            </Flex>
                            <Flex as="button" type="button" px={2} py={1} borderRadius="md" border="1px solid var(--color-border)" opacity={0.4} _groupHover={{ opacity: 1 }} onClick={() => toggleFlag(submission, rowKey)}>
                              <Icon as={Flag} boxSize={3} color={flagged ? 'var(--color-red-500)' : 'var(--color-text-muted)'} />
                            </Flex>
                          </Flex>
                        </Flex>

                        <Collapse in={expanded} animateOpacity>
                          <Box px={4} pb={3}>
                            <Flex align="center" justify="space-between" bg="var(--color-editor-toolbar)" px={3} py={1.5} borderTopRadius="md" borderBottom="1px solid var(--color-table-divider)">
                              <Text fontSize="10px" fontFamily="var(--font-mono)" color="var(--color-text-muted)">{submission.language || 'javascript'}</Text>
                              <CopyButton text={submission.code} />
                            </Flex>
                            <Box h="220px" borderBottomRadius="md" overflow="hidden" border="1px solid var(--color-table-divider)" borderTop="none">
                              <CodeEditor code={submission.code || ''} language={submission.language || 'javascript'} readOnly height="100%" options={{ minimap: { enabled: false }, fontSize: 12, wordWrap: 'on', lineNumbers: 'on' }} />
                            </Box>
                            {status === 'failed' && submission.errorMessage && <Text mt={2} fontSize="xs" color="var(--color-red-500)">{submission.errorMessage}</Text>}
                          </Box>
                        </Collapse>
                      </Box>
                    );
                  })}
                  {visibleSubmissions.length === 0 && (
                    <Flex direction="column" align="center" justify="center" py={12} gap={3}>
                      <Icon as={BarChart3} boxSize={8} color="var(--color-text-muted)" opacity={0.3} />
                      <Text color="var(--color-text-muted)" fontSize="sm">No submissions for current filters</Text>
                    </Flex>
                  )}
                </VStack>
              ) : (
                <VStack align="stretch" spacing={3} maxH="360px" overflowY="auto" className="scrollbar-thin">
                  {usersSummary.map((user) => (
                    <Box key={user.username} borderRadius="lg" border="1px solid var(--color-table-divider)" bg="var(--color-bg-card)" p={3}>
                      <Flex align="center" justify="space-between" gap={2}>
                        <Flex align="center" gap={2}>
                          <Flex align="center" justify="center" boxSize={8} borderRadius="full" bg="var(--color-info-bg)" border="1px solid var(--color-glass-border-strong)">
                            <Text fontSize="xs" fontWeight="700" color="var(--color-cyan-400)">{(user.username || '?')[0].toUpperCase()}</Text>
                          </Flex>
                          <Text color="var(--color-text-primary)" fontWeight="600" fontSize="sm">{user.username}</Text>
                        </Flex>
                        <Text fontSize="xs" color="var(--color-text-muted)">{user.count} attempts · {user.passed} passed · {user.failed} failed · {user.passRate.toFixed(0)}%</Text>
                      </Flex>
                      <Flex mt={3} align="center" gap={2} flexWrap="wrap">
                        {user.attempts.map((attempt, index) => {
                          const status = normalizeSubmissionStatus(attempt.status);
                          const color = status === 'passed' ? 'var(--color-green-500)' : status === 'failed' ? 'var(--color-red-500)' : 'var(--color-text-muted)';
                          const tone = getLanguageStyle(attempt.language || 'n/a');
                          return (
                            <Tooltip key={`${user.username}-${attempt.submittedAt || index}`} label={`${formatRelative(attempt.submittedAt)} · ${Number(attempt.executionTime || 0) ? `${Number(attempt.executionTime)}ms` : '—'} · ${tone.label}`}>
                              <Box boxSize={3} borderRadius="full" bg={color} border="1px solid var(--color-border)" />
                            </Tooltip>
                          );
                        })}
                      </Flex>
                    </Box>
                  ))}
                  {usersSummary.length === 0 && (
                    <Flex direction="column" align="center" justify="center" py={12} gap={3}>
                      <Icon as={Users} boxSize={8} color="var(--color-text-muted)" opacity={0.3} />
                      <Text color="var(--color-text-muted)" fontSize="sm">No grouped submissions for current filters</Text>
                    </Flex>
                  )}
                </VStack>
              )}
            </VStack>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default ChallengeAnalyticsSection;
