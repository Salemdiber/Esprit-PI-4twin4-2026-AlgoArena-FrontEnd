/**
 * RunButton – animated run/stop button with spinner or play icon.
 *
 * Props:
 *   isRunning  – boolean
 *   onClick    – handler
 */
import React from 'react';
import { Button, Icon, Spinner, HStack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const PlayIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
        <polygon points="5 3 19 12 5 21 5 3" />
    </Icon>
);

const RunButton = ({ isRunning, onClick }) => {
    const { t } = useTranslation();
    return (
        <Button
            onClick={onClick}
            bg={isRunning ? 'var(--color-border)' : 'linear-gradient(135deg, #22d3ee, #06b6d4)'}
            bgGradient={isRunning ? undefined : 'linear(135deg, #22d3ee, #06b6d4)'}
            color={isRunning ? '#94a3b8' : '#0f172a'}
            fontWeight="bold"
            fontSize="sm"
            h="36px"
            px={5}
            borderRadius="8px"
            _hover={
                isRunning
                    ? {}
                    : { bgGradient: 'linear(135deg, #22d3ee, #0891b2)', transform: 'translateY(-1px)', boxShadow: '0 4px 16px rgba(34, 211, 238, 0.35)' }
            }
            _active={{ transform: 'translateY(0)' }}
            transition="all 0.2s"
            disabled={isRunning}
            position="relative"
            overflow="hidden"
        >
            <HStack spacing={2}>
                {isRunning ? (
                    <>
                        <Spinner size="xs" speed="0.6s" color="#22d3ee" />
                        <Text>{t('editor.running')}</Text>
                    </>
                ) : (
                    <>
                        <PlayIcon w={3.5} h={3.5} />
                        <Text>{t('editor.runCode')}</Text>
                    </>
                )}
            </HStack>
        </Button>
    );
};

export default RunButton;
