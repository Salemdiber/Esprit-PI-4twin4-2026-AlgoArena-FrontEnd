/**
 * EditorToolbar – language selector + editor action icons.
 * Sits above the code editor container.
 */
import React from 'react';
import {
    Flex,
    Select,
    IconButton,
    Icon,
} from '@chakra-ui/react';
import { useChallengeContext } from '../context/ChallengeContext';
import { LANGUAGES } from '../data/mockChallenges';

const SettingsIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <circle cx="12" cy="12" r="3" />
    </Icon>
);

const FullscreenIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
    </Icon>
);

const EditorToolbar = () => {
    const { language, setLanguage } = useChallengeContext();

    return (
        <Flex
            bg="var(--color-bg-secondary)"
            borderBottom="1px solid"
            borderColor="gray.700"
            px={4}
            py={3}
            align="center"
            justify="space-between"
        >
            <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                bg="var(--color-bg-primary)"
                border="1px solid"
                borderColor="gray.700"
                borderRadius="8px"
                fontSize="sm"
                color="gray.300"
                w="160px"
                _focus={{ borderColor: 'brand.500', boxShadow: 'none' }}
            >
                {LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value} style={{ background: '#0f172a' }}>
                        {lang.label}
                    </option>
                ))}
            </Select>

            <Flex gap={1}>
                <IconButton
                    icon={<SettingsIcon w={5} h={5} />}
                    variant="ghost"
                    color="gray.400"
                    _hover={{ color: 'gray.100' }}
                    size="sm"
                    aria-label="Settings"
                />
                <IconButton
                    icon={<FullscreenIcon w={5} h={5} />}
                    variant="ghost"
                    color="gray.400"
                    _hover={{ color: 'gray.100' }}
                    size="sm"
                    aria-label="Fullscreen"
                />
            </Flex>
        </Flex>
    );
};

export default EditorToolbar;
