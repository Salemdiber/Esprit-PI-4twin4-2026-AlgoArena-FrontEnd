/**
 * Challenge Playground Page
 * Route: /playground/challenges/:id
 * Full-featured challenge solving interface
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Button, HStack, Icon } from '@chakra-ui/react';
import ChallengeArenaPlayground from '../../components/ChallengeArenaPlayground';

// Back arrow icon
const BackIcon = (props) => (
  <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </Icon>
);

const ChallengePlaygroundPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/playground/challenges');
  };

  return (
    <Box bg="var(--color-bg-primary)" minH="100vh">
      {/* Header with back button */}
      <Container maxW="full" px={4} py={3}>
        <HStack>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<BackIcon w={4} h={4} />}
            onClick={handleBack}
          >
            Back to Challenges
          </Button>
        </HStack>
      </Container>

      {/* Main content */}
      <ChallengeArenaPlayground challengeId={id} />
    </Box>
  );
};

export default ChallengePlaygroundPage;
