/**
 * Live Leaderboard Component
 * Displays real-time player rankings for current challenge
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Spinner,
  useColorModeValue,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import leaderboardService from '../services/leaderboardService';

// Crown icon for rank 1
const CrownIcon = (props) => (
  <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Icon>
);

const LiveLeaderboard = ({ challengeId, autoPoll = true, pollInterval = 3000 }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      setError(null);
      const result = await leaderboardService.getLiveLeaderboard(challengeId, { limit: 10 });
      
      if (result.success && result.data.length > 0) {
        setPlayers(result.data);
        setLoading(false);
      } else if (result.data.length === 0) {
        // Mock data if no real data
        const mockResult = leaderboardService._getMockLiveLeaderboard();
        setPlayers(mockResult.data);
        setLoading(false);
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setError('Unable to load leaderboard');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Poll for updates if enabled
    if (autoPoll) {
      const interval = setInterval(fetchLeaderboard, pollInterval);
      return () => clearInterval(interval);
    }
  }, [challengeId, autoPoll, pollInterval]);

  if (loading) {
    return (
      <VStack spacing={4} p={4} align="stretch">
        <Text fontWeight="bold" fontSize="lg">🔴 Live Leaderboard</Text>
        <Spinner color="cyan.400" thickness="3px" size="lg" />
        <Text fontSize="sm" color="gray.400">Loading players...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack spacing={2} p={4} align="stretch">
        <Text fontWeight="bold" fontSize="lg">🔴 Live Leaderboard</Text>
        <Text fontSize="sm" color="red.400">{error}</Text>
      </VStack>
    );
  }

  if (!players || players.length === 0) {
    return (
      <VStack spacing={2} p={4} align="stretch">
        <Text fontWeight="bold" fontSize="lg">🔴 Live Leaderboard</Text>
        <Text fontSize="sm" color="gray.400">No players found.</Text>
      </VStack>
    );
  }

  return (
    <Box
      bg={bgColor}
      borderRadius="12px"
      border={`1px solid ${borderColor}`}
      overflow="hidden"
    >
      {/* Header */}
      <Box p={4} borderBottom={`1px solid ${borderColor}`} bg="rgba(34,211,238,0.05)">
        <HStack justify="space-between">
          <Text fontWeight="bold" fontSize="lg">
            🔴 Live Leaderboard
          </Text>
          <Badge colorScheme="cyan" fontSize="xs">
            {players.length} players
          </Badge>
        </HStack>
      </Box>

      {/* Player List */}
      <VStack spacing={0} align="stretch">
        {players.map((player, index) => (
          <Tooltip
            key={index}
            label={`${player.testsPassed}/${player.totalTests} tests passed`}
            placement="left"
          >
            <HStack
              p={3}
              borderBottom={`1px solid ${borderColor}`}
              _hover={{ bg: hoverBg }}
              cursor="pointer"
              transition="all 0.2s"
            >
              {/* Rank */}
              <Box w="40px" textAlign="center" position="relative">
                {player.rank === 1 ? (
                  <CrownIcon w={5} h={5} color="gold" />
                ) : (
                  <Text fontWeight="bold" fontSize="sm" color="gray.400">
                    #{player.rank}
                  </Text>
                )}
              </Box>

              {/* Player */}
              <HStack flex={1} spacing={2}>
                <Avatar size="sm" name={player.username} />
                <VStack spacing={0} align="start" flex={1}>
                  <Text fontWeight="600" fontSize="sm">
                    {player.username}
                  </Text>
                  <HStack spacing={2} fontSize="xs" color="gray.400">
                    <Text>{player.testsPassed}/{player.totalTests} ✓</Text>
                    <Text>•</Text>
                    <Text>{player.time}</Text>
                  </HStack>
                </VStack>
              </HStack>

              {/* Progress Badge */}
              <Box textAlign="right">
                {player.status === 'solved' ? (
                  <Badge colorScheme="green" fontSize="xs" px={2} py={1}>
                    ✓ Solved
                  </Badge>
                ) : (
                  <VStack spacing={0}>
                    <Text fontSize="xs" fontWeight="bold" color="cyan.400">
                      {player.progress}%
                    </Text>
                    <Box
                      w="60px"
                      h="4px"
                      bgGradient="linear(to-r, rgba(34,211,238,0.3), rgba(34,211,238,0.1))"
                      borderRadius="2px"
                      overflow="hidden"
                    >
                      <Box
                        h="100%"
                        bgGradient={`linear(to-r, #22d3ee, #06b6d4)`}
                        w={`${player.progress}%`}
                        transition="width 0.3s ease"
                      />
                    </Box>
                  </VStack>
                )}
              </Box>
            </HStack>
          </Tooltip>
        ))}
      </VStack>

      {/* Footer */}
      <Box p={3} bg="rgba(34,211,238,0.03)" borderTop={`1px solid ${borderColor}`}>
        <Text fontSize="xs" color="gray.400" textAlign="center">
          Updates every 3 seconds • Last update: just now
        </Text>
      </Box>
    </Box>
  );
};

export default LiveLeaderboard;
