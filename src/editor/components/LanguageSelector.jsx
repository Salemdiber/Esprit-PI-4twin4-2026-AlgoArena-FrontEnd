/**
 * LanguageSelector – dropdown to pick editor language.
 *
 * Props:
 *   language      – current language key
 *   setLanguage   – setter
 *   languages     – optional array of { value, label }
 */
import React from 'react';
import { Select, Icon, HStack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const CodeIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
    </Icon>
);

const LanguageSelector = ({
    language,
    setLanguage,
    languages: languagesProp,
}) => {
    const { t } = useTranslation();
    const defaultLanguages = [
        { value: 'javascript', label: t('editor.javascript') },
        { value: 'python', label: t('editor.python') },
        { value: 'cpp', label: t('editor.cpp') },
    ];
    const languages = languagesProp || defaultLanguages;
    return (
    <HStack spacing={2}>
        <CodeIcon w={4} h={4} color="gray.500" />
        <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            bg="var(--color-bg-primary)"
            border="1px solid"
            borderColor="var(--color-border)"
            borderRadius="8px"
            fontSize="sm"
            color="var(--color-text-primary)"
            w="150px"
            h="36px"
            _focus={{ borderColor: '#22d3ee', boxShadow: '0 0 0 1px #22d3ee' }}
            _hover={{ borderColor: '#475569' }}
            transition="all 0.2s"
            iconColor="var(--color-text-muted)"
        >
            {languages.map((lang) => (
                <option
                    key={lang.value}
                    value={lang.value}
                    style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}
                >
                    {lang.label}
                </option>
            ))}
        </Select>
    </HStack>
    );
};

export default LanguageSelector;
