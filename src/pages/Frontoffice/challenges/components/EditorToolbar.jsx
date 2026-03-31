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
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverBody,
    PopoverHeader,
    VStack,
    Text,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Tooltip,
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

const ExitFullscreenIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M8 8H5V5m11 0h3v3m0 8v3h-3M8 16H5v3" />
        <path d="M9 9L5 5m10 4l4-4m0 14l-4-4M9 15l-4 4" />
    </Icon>
);

const FONT_OPTIONS = [
    { value: 'monospace', label: 'Monospace' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Consolas', label: 'Consolas' },
    { value: 'Fira Code', label: 'Fira Code' },
    { value: 'JetBrains Mono', label: 'JetBrains Mono' },
];

const EditorToolbar = () => {
    const {
        language,
        setLanguage,
        editorSettings,
        setEditorSettings,
        isEditorFullscreen,
        setEditorFullscreen,
    } = useChallengeContext();

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
                <Popover placement="bottom-end">
                    <PopoverTrigger>
                        <IconButton
                            icon={<SettingsIcon w={5} h={5} />}
                            variant="ghost"
                            color="gray.400"
                            _hover={{ color: 'gray.100' }}
                            size="sm"
                            aria-label="Editor settings"
                        />
                    </PopoverTrigger>
                    <PopoverContent bg="var(--color-bg-secondary)" borderColor="gray.700" color="gray.200" w="280px">
                        <PopoverArrow bg="var(--color-bg-secondary)" borderColor="gray.700" />
                        <PopoverHeader borderColor="gray.700" fontWeight="semibold">Editor Settings</PopoverHeader>
                        <PopoverBody>
                            <VStack align="stretch" spacing={4}>
                                <VStack align="stretch" spacing={2}>
                                    <Text fontSize="xs" color="gray.400">Font Family</Text>
                                    <Select
                                        size="sm"
                                        value={editorSettings.fontFamily}
                                        onChange={(e) => setEditorSettings({ fontFamily: e.target.value })}
                                        bg="var(--color-bg-primary)"
                                        borderColor="gray.700"
                                    >
                                        {FONT_OPTIONS.map((font) => (
                                            <option key={font.value} value={font.value} style={{ background: '#0f172a' }}>
                                                {font.label}
                                            </option>
                                        ))}
                                    </Select>
                                </VStack>

                                <VStack align="stretch" spacing={2}>
                                    <Text fontSize="xs" color="gray.400">Font Size: {editorSettings.fontSize}px</Text>
                                    <Slider
                                        min={12}
                                        max={28}
                                        step={1}
                                        value={editorSettings.fontSize}
                                        onChange={(value) => setEditorSettings({ fontSize: value })}
                                    >
                                        <SliderTrack>
                                            <SliderFilledTrack bg="brand.500" />
                                        </SliderTrack>
                                        <SliderThumb />
                                    </Slider>
                                </VStack>
                            </VStack>
                        </PopoverBody>
                    </PopoverContent>
                </Popover>

                <Tooltip label={isEditorFullscreen ? 'Exit Full Screen' : 'Full Screen'}>
                    <IconButton
                        icon={isEditorFullscreen ? <ExitFullscreenIcon w={5} h={5} /> : <FullscreenIcon w={5} h={5} />}
                        variant="ghost"
                        color="gray.400"
                        _hover={{ color: 'gray.100' }}
                        size="sm"
                        aria-label="Toggle fullscreen"
                        onClick={() => setEditorFullscreen(!isEditorFullscreen)}
                    />
                </Tooltip>
            </Flex>
        </Flex>
    );
};

export default EditorToolbar;
