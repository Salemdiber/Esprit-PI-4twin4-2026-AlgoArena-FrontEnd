/**
 * AccessibilityDrawer – Chakra Drawer containing all accessibility controls
 *
 * Sections:
 *  1. Visual Modes (high contrast, reduced motion, dyslexia font, font scale)
 *  2. Color Vision Support (color-blind mode + profile selector)
 *  3. Voice Mode (text-to-speech + voice commands)
 */
import React from 'react';
import {
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    DrawerHeader,
    DrawerBody,
    VStack,
    HStack,
    Text,
    Switch,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Box,
    Divider,
    Button,
    Icon,
    Tooltip,
    Badge,
} from '@chakra-ui/react';
import useAccessibility from '../hooks/useAccessibility';
import { readAloud, stopSpeaking, getPageText } from '../utils/speechUtils';

/* ── Inline SVG icons (no external dependency) ── */

const EyeIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </Icon>
);



const MicIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
        <path d="M19 10v2a7 7 0 01-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </Icon>
);

const VolumeIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 010 14.14" />
        <path d="M15.54 8.46a5 5 0 010 7.07" />
    </Icon>
);

const ResetIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
    </Icon>
);

/* ── Section header component ── */
const SectionHeader = ({ icon, title }) => (
    <HStack spacing={3} mb={4}>
        {icon}
        <Text fontFamily="heading" fontSize="md" fontWeight="bold" color="var(--color-text-primary)">
            {title}
        </Text>
    </HStack>
);

/* ── Control row component ── */
const ControlRow = ({ label, description, children }) => (
    <HStack justify="space-between" align="center" w="full" py={2}>
        <Box flex={1} pr={3}>
            <Text fontSize="sm" fontWeight="medium" color="var(--color-text-primary)">
                {label}
            </Text>
            {description && (
                <Text fontSize="xs" color="var(--color-text-muted)" mt={0.5}>
                    {description}
                </Text>
            )}
        </Box>
        {children}
    </HStack>
);

/* ── Font scale labels ── */
const FONT_SCALE_LABELS = { 0: 'Small', 1: 'Medium', 2: 'Large' };
const FONT_SCALE_VALUES = ['small', 'medium', 'large'];

const AccessibilityDrawer = ({ isOpen, onClose }) => {
    const { settings, updateSetting, resetSettings } = useAccessibility();

    const fontScaleIndex = FONT_SCALE_VALUES.indexOf(settings.fontScale);

    const handleReadPage = () => {
        const text = getPageText('main') || getPageText('#root');
        if (text) {
            readAloud(text);
        } else {
            readAloud('No readable content found on this page.');
        }
    };

    return (
        <Drawer
            isOpen={isOpen}
            placement="right"
            onClose={onClose}
            size={{ base: 'full', md: 'sm' }}
        >
            <DrawerOverlay bg="rgba(0, 0, 0, 0.6)" backdropFilter="blur(4px)" />
            <DrawerContent
                bg="var(--color-bg-primary)"
                borderLeft="1px solid"
                borderColor="var(--color-border)"
                maxW={{ base: '100%', md: '380px' }}
            >
                <DrawerCloseButton
                    color="var(--color-text-muted)"
                    _hover={{ color: '#22d3ee' }}
                    mt={2}
                />

                <DrawerHeader
                    borderBottom="1px solid"
                    borderColor="var(--color-border)"
                    pb={4}
                >
                    <HStack spacing={3}>
                        <Box
                            p={2}
                            borderRadius="8px"
                            bg="rgba(34, 211, 238, 0.1)"
                            border="1px solid rgba(34, 211, 238, 0.3)"
                        >
                            <Icon viewBox="0 0 24 24" w={5} h={5} color="#22d3ee" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="7" r="1.5" fill="currentColor" />
                                <path d="M12 10v2" />
                                <path d="M8 14c0 2.21 1.79 4 4 4s4-1.79 4-4" />
                                <line x1="8" y1="18" x2="8" y2="21" />
                                <line x1="16" y1="18" x2="16" y2="21" />
                            </Icon>
                        </Box>
                        <Box>
                            <Text fontFamily="heading" fontSize="lg" fontWeight="bold" color="var(--color-text-primary)">
                                Accessibility
                            </Text>
                            <Text fontSize="xs" color="var(--color-text-muted)">
                                Customize your experience
                            </Text>
                        </Box>
                    </HStack>
                </DrawerHeader>

                <DrawerBody py={6} overflowY="auto">
                    <VStack spacing={6} align="stretch">
                        {/* ─── Section 1: Visual Modes ─── */}
                        <Box>
                            <SectionHeader
                                icon={<EyeIcon w={5} h={5} color="#22d3ee" />}
                                title="Visual Modes"
                            />

                            <VStack spacing={1} align="stretch">
                                <ControlRow
                                    label="High Contrast"
                                    description="Stronger borders, no transparency"
                                >
                                    <Switch
                                        isChecked={settings.highContrast}
                                        onChange={(e) => updateSetting('highContrast', e.target.checked)}
                                        colorScheme="brand"
                                        size="md"
                                    />
                                </ControlRow>

                                <ControlRow
                                    label="Reduced Motion"
                                    description="Disable animations"
                                >
                                    <Switch
                                        isChecked={settings.reducedMotion}
                                        onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                                        colorScheme="brand"
                                        size="md"
                                    />
                                </ControlRow>

                                <ControlRow
                                    label="Dyslexia-Friendly Font"
                                    description="OpenDyslexic typeface"
                                >
                                    <Switch
                                        isChecked={settings.dyslexiaFont}
                                        onChange={(e) => updateSetting('dyslexiaFont', e.target.checked)}
                                        colorScheme="brand"
                                        size="md"
                                    />
                                </ControlRow>

                                {/* Font Size Slider */}
                                <Box pt={2}>
                                    <Text fontSize="sm" fontWeight="medium" color="var(--color-text-primary)" mb={3}>
                                        Font Size
                                    </Text>
                                    <HStack spacing={4}>
                                        <Text fontSize="xs" color="var(--color-text-muted)" minW="40px">
                                            {FONT_SCALE_LABELS[fontScaleIndex]}
                                        </Text>
                                        <Slider
                                            value={fontScaleIndex}
                                            min={0}
                                            max={2}
                                            step={1}
                                            onChange={(val) => updateSetting('fontScale', FONT_SCALE_VALUES[val])}
                                            flex={1}
                                        >
                                            <SliderTrack bg="var(--color-tag-bg)" h="6px" borderRadius="full">
                                                <SliderFilledTrack bg="#22d3ee" />
                                            </SliderTrack>
                                            <SliderThumb
                                                boxSize={5}
                                                bg="#22d3ee"
                                                border="2px solid"
                                                bordercolor="var(--color-text-primary)"
                                                _focus={{ boxShadow: '0 0 0 3px rgba(34,211,238,0.4)' }}
                                            />
                                        </Slider>
                                    </HStack>
                                </Box>
                            </VStack>
                        </Box>

                        {/* ─── Section 2: Voice Mode ─── */}
                        <Box>
                            <SectionHeader
                                icon={<VolumeIcon w={5} h={5} color="#22d3ee" />}
                                title="Voice Mode"
                            />

                            <VStack spacing={1} align="stretch">
                                <ControlRow
                                    label="Enable Voice Mode"
                                    description="Read page content aloud"
                                >
                                    <Switch
                                        isChecked={settings.voiceMode}
                                        onChange={(e) => updateSetting('voiceMode', e.target.checked)}
                                        colorScheme="brand"
                                        size="md"
                                    />
                                </ControlRow>

                                {settings.voiceMode && (
                                    <HStack spacing={3} pt={2}>
                                        <Button
                                            size="sm"
                                            leftIcon={<VolumeIcon w={4} h={4} />}
                                            bg="rgba(34, 211, 238, 0.15)"
                                            color="#22d3ee"
                                            border="1px solid rgba(34, 211, 238, 0.3)"
                                            _hover={{ bg: 'rgba(34, 211, 238, 0.25)' }}
                                            onClick={handleReadPage}
                                            flex={1}
                                        >
                                            Read Page
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            color="var(--color-text-muted)"
                                            border="1px solid"
                                            borderColor="var(--color-border)"
                                            _hover={{ bg: 'var(--color-bg-secondary)', color: 'var(--color-text-heading)' }}
                                            onClick={stopSpeaking}
                                            flex={1}
                                        >
                                            Stop
                                        </Button>
                                    </HStack>
                                )}

                                <Box pt={2}>
                                    <ControlRow
                                        label="Voice Commands"
                                        description="Navigate by speaking"
                                    >
                                        <Switch
                                            isChecked={settings.voiceCommandsEnabled}
                                            onChange={(e) => updateSetting('voiceCommandsEnabled', e.target.checked)}
                                            colorScheme="brand"
                                            size="md"
                                        />
                                    </ControlRow>

                                    {settings.voiceCommandsEnabled && (
                                        <Box
                                            mt={2}
                                            p={3}
                                            borderRadius="8px"
                                            bg="rgba(34, 211, 238, 0.05)"
                                            border="1px solid rgba(34, 211, 238, 0.15)"
                                        >
                                            <HStack mb={2}>
                                                <MicIcon w={4} h={4} color="#22d3ee" />
                                                <Text fontSize="xs" fontWeight="semibold" color="#22d3ee">
                                                    Available Commands
                                                </Text>
                                                <Badge
                                                    colorScheme="cyan"
                                                    variant="subtle"
                                                    fontSize="10px"
                                                    ml="auto"
                                                >
                                                    LISTENING
                                                </Badge>
                                            </HStack>
                                            <VStack spacing={1} align="stretch">
                                                {[
                                                    '"Go to leaderboard"',
                                                    '"Open challenges"',
                                                    '"Start battle"',
                                                    '"Go home"',
                                                ].map((cmd) => (
                                                    <Text key={cmd} fontSize="xs" color="var(--color-text-muted)" fontFamily="mono">
                                                        {cmd}
                                                    </Text>
                                                ))}
                                            </VStack>
                                        </Box>
                                    )}
                                </Box>
                            </VStack>
                        </Box>

                        <Divider borderColor="var(--color-border)" />

                        {/* ─── Reset ─── */}
                        <Button
                            size="sm"
                            leftIcon={<ResetIcon w={4} h={4} />}
                            variant="ghost"
                            color="var(--color-text-muted)"
                            border="1px solid"
                            borderColor="var(--color-border)"
                            _hover={{ bg: 'var(--color-bg-secondary)', color: 'var(--color-text-heading)', borderColor: 'var(--color-border-hover)' }}
                            onClick={resetSettings}
                            w="full"
                        >
                            Reset to Defaults
                        </Button>
                    </VStack>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
};

export default AccessibilityDrawer;
