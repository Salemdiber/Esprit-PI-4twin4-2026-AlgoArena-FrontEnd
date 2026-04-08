/**
 * useChallenges – filtering, searching, and sorting logic.
 *
 * Consumes ChallengeContext and exposes the filtered + sorted list
 * together with filter state & setters.
 */
import { useState, useMemo, useCallback } from 'react';
import { useChallengeContext } from '../context/ChallengeContext';
import { ChallengeUserStatus } from '../data/mockChallenges';
import i18n from '../../../../i18n';

const DIFFICULTY_ORDER = { EASY: 0, Easy: 0, MEDIUM: 1, Medium: 1, HARD: 2, Hard: 2, EXPERT: 3, Expert: 3 };

export default function useChallenges() {
    const SORT_OPTIONS = [
        { value: 'recommended', label: i18n.t('challengePage.sortRecommended') },
        { value: 'newest', label: i18n.t('challengePage.sortNewest') },
        { value: 'difficulty', label: i18n.t('challengePage.sortDifficulty') },
        { value: 'acceptance', label: i18n.t('challengePage.sortAcceptance') },
        { value: 'xp', label: i18n.t('challengePage.sortXp') },
        { value: 'popularity', label: i18n.t('challengePage.sortPopularity') },
    ];

    const {
        challenges,
        userProgress,
        getUserProgress,
        isRecommended,
        isLoadingChallenges,
    } = useChallengeContext();

    // ── Filter state ─────────────────────────────────────────
    const [selectedDifficulties, setSelectedDifficulties] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [recommendedOnly, setRecommendedOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('recommended');

    // Toggle helpers
    const toggleDifficulty = useCallback((d) => {
        setSelectedDifficulties(prev =>
            prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
        );
    }, []);

    const toggleTag = useCallback((t) => {
        setSelectedTags(prev =>
            prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
        );
    }, []);

    const toggleStatus = useCallback((s) => {
        setSelectedStatuses(prev =>
            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
        );
    }, []);

    // ── Derive user status for a challenge ───────────────────
    const getChallengeStatus = useCallback((challengeId) => {
        const progress = userProgress.find(p => p.challengeId === challengeId);
        return progress?.status || ChallengeUserStatus.UNSOLVED;
    }, [userProgress]);

    // ── Counts (for sidebar) ─────────────────────────────────
    const difficultyCounts = useMemo(() => {
        const counts = {};
        challenges.forEach(c => { counts[c.difficulty] = (counts[c.difficulty] || 0) + 1; });
        return counts;
    }, [challenges]);

    const tagCounts = useMemo(() => {
        const counts = {};
        challenges.forEach(c => { c.tags.forEach(t => { counts[t] = (counts[t] || 0) + 1; }); });
        return counts;
    }, [challenges]);

    // ── Filtered + sorted list ───────────────────────────────
    const filteredChallenges = useMemo(() => {
        let result = [...challenges];

        // Difficulty filter
        if (selectedDifficulties.length > 0) {
            result = result.filter(c => selectedDifficulties.includes(c.difficulty));
        }

        // Tags (match any)
        if (selectedTags.length > 0) {
            result = result.filter(c => c.tags.some(t => selectedTags.includes(t)));
        }

        // Status
        if (selectedStatuses.length > 0) {
            result = result.filter(c => selectedStatuses.includes(getChallengeStatus(c.id)));
        }

        // Recommended only
        if (recommendedOnly) {
            result = result.filter(c => isRecommended(c));
        }

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            result = result.filter(c =>
                c.title.toLowerCase().includes(q) ||
                c.tags.some(t => t.toLowerCase().includes(q)) ||
                (c.description && c.description.toLowerCase().includes(q))
            );
        }

        // Sort
        switch (sortOption) {
            case 'newest':
                result.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                });
                break;
            case 'difficulty':
                result.sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] || 0) - (DIFFICULTY_ORDER[b.difficulty] || 0));
                break;
            case 'acceptance':
                result.sort((a, b) => (b.acceptanceRate || 0) - (a.acceptanceRate || 0));
                break;
            case 'xp':
                result.sort((a, b) => (b.xpReward || 0) - (a.xpReward || 0));
                break;
            case 'popularity':
                result.sort((a, b) => (b.solvedCount || 0) - (a.solvedCount || 0));
                break;
            case 'recommended':
            default:
                result.sort((a, b) => {
                    const aRec = isRecommended(a) ? 0 : 1;
                    const bRec = isRecommended(b) ? 0 : 1;
                    if (aRec !== bRec) return aRec - bRec;
                    return (DIFFICULTY_ORDER[a.difficulty] || 0) - (DIFFICULTY_ORDER[b.difficulty] || 0);
                });
                break;
        }

        return result;
    }, [
        challenges, selectedDifficulties, selectedTags, selectedStatuses,
        recommendedOnly, searchQuery, sortOption, getChallengeStatus, isRecommended,
    ]);

    return {
        filteredChallenges,
        totalCount: challenges.length,
        filteredCount: filteredChallenges.length,
        isLoadingChallenges,

        selectedDifficulties, selectedTags, selectedStatuses, recommendedOnly,
        searchQuery, sortOption,

        toggleDifficulty, toggleTag, toggleStatus, setRecommendedOnly,
        setSearchQuery, setSortOption,

        SORT_OPTIONS, difficultyCounts, tagCounts, getChallengeStatus,
    };
}
