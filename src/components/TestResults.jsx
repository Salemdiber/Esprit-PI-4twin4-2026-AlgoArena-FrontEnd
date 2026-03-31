/**
 * Test Results Component
 * Displays detailed test case execution results
 */

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Collapse,
  Button,
  Icon,
  useColorModeValue,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';

// Chevron icon
const ChevronIcon = (props) => (
  <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polyline points="6 9 12 15 18 9" />
  </Icon>
);

const TestResultsComponent = ({ results = [], isRunning = false, passedTests = 0, totalTests = 0 }) => {
  const [expanded, setExpanded] = useState(true);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const successBg = useColorModeValue('green.50', 'rgba(16,185,129,0.1)');
  const failBg = useColorModeValue('red.50', 'rgba(239,68,68,0.1)');

  const passPercentage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  const allPassed = passedTests === totalTests && totalTests > 0;

  return (
    <VStack spacing={0} align="stretch">
      {/* Summary Header */}
      <Box
        p={4}
        bg={allPassed ? successBg : failBg}
        borderRadius="8px 8px 0 0"
        borderBottom={`1px solid ${borderColor}`}
      >
        <HStack justify="space-between" mb={3}>
          <HStack>
            <Text fontWeight="bold" fontSize="lg">
              {isRunning ? '⏳ Running Tests...' : allPassed ? '✅ All Tests Passed!' : '❌ Some Tests Failed'}
            </Text>
          </HStack>
          <Badge
            colorScheme={allPassed ? 'green' : passedTests > 0 ? 'yellow' : 'red'}
            fontSize="md"
          >
            {passedTests}/{totalTests}
          </Badge>
        </HStack>

        {/* Progress Bar */}
        {totalTests > 0 && (
          <VStack spacing={2} align="stretch">
            <Progress
              value={passPercentage}
              size="sm"
              colorScheme={allPassed ? 'green' : passedTests > 0 ? 'yellow' : 'red'}
              borderRadius="4px"
            />
            <Text fontSize="xs" color="gray.500">
              {passPercentage}% Tests Passing ({passedTests} / {totalTests})
            </Text>
          </VStack>
        )}
      </Box>

      {/* Results List */}
      <Collapse in={expanded} animateOpacity>
        {isRunning ? (
          <Box p={4} textAlign="center">
            <Text color="gray.400">Executing tests...</Text>
          </Box>
        ) : results.length > 0 ? (
          <Box overflow="auto">
            <Table size="sm" variant="simple">
              <Thead>
                <Tr bg={useColorModeValue('gray.50', 'gray.900')}>
                  <Th>Status</Th>
                  <Th>Input</Th>
                  <Th>Expected</Th>
                  <Th>Actual</Th>
                  <Th>Time</Th>
                  <Th>Memory</Th>
                </Tr>
              </Thead>
              <Tbody>
                {results.map((result, idx) => (
                  <Tr
                    key={idx}
                    bg={result.status === 'PASSED' ? successBg : failBg}
                    _hover={{ bg: useColorModeValue(
                      result.status === 'PASSED' ? 'green.100' : 'red.100',
                      result.status === 'PASSED' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'
                    )}}
                  >
                    <Td>
                      <Badge colorScheme={result.status === 'PASSED' ? 'green' : 'red'}>
                        {result.status === 'PASSED' ? '✓ PASS' : '✗ FAIL'}
                      </Badge>
                    </Td>
                    <Td fontSize="xs" fontFamily="mono" maxW="150px" isTruncated>
                      {typeof result.input === 'string' ? result.input : JSON.stringify(result.input).slice(0, 50)}
                    </Td>
                    <Td fontSize="xs" fontFamily="mono" maxW="150px" isTruncated>
                      {typeof result.expected === 'string' ? result.expected : JSON.stringify(result.expected).slice(0, 50)}
                    </Td>
                    <Td fontSize="xs" fontFamily="mono" maxW="150px" isTruncated>
                      <Text color={result.status === 'PASSED' ? 'green.500' : 'red.500'}>
                        {typeof result.actual === 'string' ? result.actual : JSON.stringify(result.actual).slice(0, 50)}
                      </Text>
                    </Td>
                    <Td fontSize="xs">{result.time || result.runtime}ms</Td>
                    <Td fontSize="xs">{result.memory}MB</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        ) : (
          <Box p={4} textAlign="center" color="gray.400">
            <Text>No test results yet. Run tests to see results.</Text>
          </Box>
        )}
      </Collapse>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setExpanded(!expanded)}
        w="100%"
        justifyContent="space-between"
        borderRadius="0 0 8px 8px"
        borderTop={`1px solid ${borderColor}`}
        _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
      >
        <Text fontSize="xs" fontWeight="600">
          {expanded ? 'Collapse' : 'Expand'} Details
        </Text>
        <ChevronIcon
          w={4}
          h={4}
          transform={expanded ? 'rotate(180deg)' : 'rotate(0deg)'}
          transition="transform 0.2s"
        />
      </Button>
    </VStack>
  );
};

export default TestResultsComponent;
