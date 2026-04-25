import React, { useEffect, useMemo, useState } from 'react';
import { Box, Flex, Input, Spinner, Text, useColorModeValue } from '@chakra-ui/react';
import { userService } from '../../services/userService';

const Billing = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await userService.getUsers();
                if (!cancelled) setUsers(Array.isArray(data) ? data : (data?.items || data?.users || []));
            } catch (err) {
                if (!cancelled) {
                    setError(err?.message || 'Unable to load billing data.');
                    setUsers([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, []);

    const normalizedUsers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return [...users]
            .filter((user) => {
                if (!query) return true;
                return [user?.username, user?.email, user?._id, user?.role]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(query));
            })
            .sort((left, right) => Number(right?.hintCredits ?? 0) - Number(left?.hintCredits ?? 0));
    }, [searchTerm, users]);

    const totalBalance = useMemo(
        () => normalizedUsers.reduce((sum, user) => sum + Number(user?.hintCredits ?? 0), 0),
        [normalizedUsers],
    );

    const totalPurchases = useMemo(
        () => normalizedUsers.reduce((sum, user) => sum + (Array.isArray(user?.hintPurchases) ? user.hintPurchases.length : 0), 0),
        [normalizedUsers],
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="mb-6">
                <h1 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold mb-2">Billing</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Browse all users, their Arena Coins balance, and recent wallet activity.</p>
            </div>

            <div className="glass-panel rounded-2xl p-6 shadow-custom">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl p-4" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                        <Text style={{ color: 'var(--color-text-muted)' }} className="text-sm mb-1">Users</Text>
                        <Text style={{ color: 'var(--color-text-heading)' }} className="text-3xl font-black">{normalizedUsers.length}</Text>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                        <Text style={{ color: 'var(--color-text-muted)' }} className="text-sm mb-1">Total balance</Text>
                        <Text style={{ color: 'var(--color-cyan-400)' }} className="text-3xl font-black">{totalBalance}</Text>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                        <Text style={{ color: 'var(--color-text-muted)' }} className="text-sm mb-1">Top-up records</Text>
                        <Text style={{ color: 'var(--color-text-heading)' }} className="text-3xl font-black">{totalPurchases}</Text>
                    </div>
                </div>

                <div className="mt-4">
                    <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium mb-2">Search users</label>
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by username, email, id, or role"
                        bg="var(--color-bg-primary)"
                        borderColor={useColorModeValue('gray.200', 'gray.700')}
                        color={useColorModeValue('gray.800', 'gray.100')}
                    />
                </div>
            </div>

            {loading ? (
                <Flex align="center" justify="center" minH="240px">
                    <Spinner size="xl" color="cyan.400" />
                </Flex>
            ) : error ? (
                <Box className="glass-panel rounded-2xl p-6 shadow-custom border border-red-500/20 bg-red-500/5">
                    <Text color="red.300">{error}</Text>
                </Box>
            ) : (
                <div className="glass-panel rounded-2xl p-6 shadow-custom">
                    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                        <div>
                            <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold mb-1">Users and balances</h2>
                            <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">Sorted by highest Arena Coins balance.</p>
                        </div>
                        <Text style={{ color: 'var(--color-text-secondary)' }} className="text-sm">{normalizedUsers.length} visible</Text>
                    </div>

                    {normalizedUsers.length === 0 ? (
                        <div className="rounded-xl p-4" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                            <Text style={{ color: 'var(--color-text-muted)' }}>No users match your search.</Text>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {normalizedUsers.map((user) => {
                                const purchases = Array.isArray(user?.hintPurchases) ? user.hintPurchases : [];
                                return (
                                    <div
                                        key={user?._id}
                                        className="rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                                        style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}
                                    >
                                        <div>
                                            <Text style={{ color: 'var(--color-text-heading)' }} className="font-semibold text-lg">
                                                {user?.username || 'Unknown user'}
                                            </Text>
                                            <Text style={{ color: 'var(--color-text-muted)' }} className="text-sm break-all">
                                                {user?.email || 'No email'}
                                            </Text>
                                            <Text style={{ color: 'var(--color-text-muted)' }} className="text-xs mt-1">
                                                {user?._id || 'No id'}
                                            </Text>
                                        </div>

                                        <div className="flex items-center gap-6 flex-wrap md:justify-end">
                                            <div className="text-left md:text-right">
                                                <Text style={{ color: 'var(--color-text-muted)' }} className="text-xs uppercase tracking-wide">Balance</Text>
                                                <Text style={{ color: 'var(--color-cyan-400)' }} className="text-3xl font-black leading-none">
                                                    {Number(user?.hintCredits ?? 0)}
                                                </Text>
                                            </div>
                                            <div className="text-left md:text-right">
                                                <Text style={{ color: 'var(--color-text-muted)' }} className="text-xs uppercase tracking-wide">Purchases</Text>
                                                <Text style={{ color: 'var(--color-text-heading)' }} className="text-2xl font-bold leading-none">
                                                    {purchases.length}
                                                </Text>
                                            </div>
                                            <div className="text-left md:text-right">
                                                <Text style={{ color: 'var(--color-text-muted)' }} className="text-xs uppercase tracking-wide">Role</Text>
                                                <Text style={{ color: 'var(--color-text-heading)' }} className="text-sm font-semibold">
                                                    {user?.role || 'Player'}
                                                </Text>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Billing;