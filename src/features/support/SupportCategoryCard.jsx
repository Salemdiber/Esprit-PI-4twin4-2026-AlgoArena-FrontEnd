import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';

const SupportCategoryCard = ({ icon, title, description, color, onClick, cta }) => (
  <Box
    p={4}
    borderWidth="1px"
    borderColor="var(--color-border)"
    borderRadius="xl"
    cursor="pointer"
    transition="all 0.2s ease"
    bg="var(--color-bg-secondary)"
    color="var(--color-text-primary)"
    _hover={{ transform: 'translateY(-2px)', borderColor: color, boxShadow: 'var(--shadow-custom)' }}
    onClick={onClick}
  >
    <VStack spacing={3} align="start">
      <Box w="56px" h="56px" borderRadius="full" display="flex" alignItems="center" justifyContent="center" bg={`${color}22`} color={color}>
        {icon}
      </Box>
      <Text fontWeight="700">{title}</Text>
      <Text fontSize="sm" color="var(--color-text-muted)">{description}</Text>
      <Text fontSize="sm" color={color}>{cta}</Text>
    </VStack>
  </Box>
);

export default SupportCategoryCard;

