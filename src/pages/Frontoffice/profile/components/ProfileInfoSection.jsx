/**
 * ProfileInfoSection – view / edit mode for username, email, bio.
 *
 * View mode: displays read-only values with an "Edit Profile" button.
 * Edit mode: inline form controls with Save / Cancel.
 */
import React, { useState, useEffect } from 'react';
import {
    Box,
    Flex,
    Text,
    Button,
    Input,
    Textarea,
    Badge,
    Icon,
    Spinner,
    useColorModeValue,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useProfile } from '../context/ProfileContext';

const MotionBox = motion.create(Box);

/* Inline edit icon */
const PencilIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Icon>
);

/* Shared input styles */
const inputStyles = {
    bg: 'var(--color-bg-primary)',
    border: '1px solid',
    borderColor: 'var(--color-border)',
    borderRadius: '6px',
    color: 'gray.100',
    _focus: { borderColor: '#22d3ee', boxShadow: '0 0 0 1px #22d3ee' },
    _placeholder: { color: 'gray.600' },
};

const ProfileInfoSection = () => {
    const { user, isEditing, setIsEditing, updateUser, isUpdating } = useProfile();
    const prefersReducedMotion = useReducedMotion();

    // Local draft state for edit mode
    const [draft, setDraft] = useState({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
    });

    // Sync draft when user changes externally
    useEffect(() => {
        if (!isEditing) {
            setDraft({
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || ''
            });
        }
    }, [user, isEditing]);

    const handleSave = () => {
        const patch = {};
        if (draft.username && draft.username.trim() !== '' && draft.username !== user.username) patch.username = draft.username;
        if (draft.email && draft.email.trim() !== '' && draft.email !== user.email) patch.email = draft.email;
        if (draft.bio && draft.bio.trim() !== '' && draft.bio !== user.bio) patch.bio = draft.bio;

        if (Object.keys(patch).length === 0) {
            setIsEditing(false);
            return;
        }

        updateUser(patch);
    };

    const handleCancel = () => {
        setDraft({
            username: user.username || '',
            email: user.email || '',
            bio: user.bio || ''
        });
        setIsEditing(false);
    };

    return (
        <MotionBox
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            bg="var(--color-bg-secondary)"
            borderRadius="12px"
            boxShadow="var(--shadow-card)"
            borderTop="2px solid #22d3ee"
            p={{ base: 6, md: 8 }}
        >
            {/* Header row */}
            <Flex justify="space-between" align="center" mb={6}>
                <Text fontFamily="heading" fontSize="lg" fontWeight="600" color={useColorModeValue("gray.800","gray.100")}>
                    Profile Information
                </Text>

                {!isEditing ? (
                    <Button
                        leftIcon={<PencilIcon w="14px" h="14px" />}
                        size="sm"
                        variant="outline"
                        color="#22d3ee"
                        borderColor="rgba(34, 211, 238, 0.3)"
                        _hover={{ bg: 'rgba(34, 211, 238, 0.1)', borderColor: '#22d3ee' }}
                        borderRadius="6px"
                        fontSize="sm"
                        fontWeight="500"
                        onClick={() => setIsEditing(true)}
                    >
                        Edit Profile
                    </Button>
                ) : (
                    <Flex gap={2}>
                        <Button
                            size="sm"
                            bg="#22d3ee"
                            color="#0f172a"
                            _hover={{ bg: '#67e8f9' }}
                            borderRadius="6px"
                            fontSize="sm"
                            fontWeight="600"
                            onClick={handleSave}
                            isLoading={isUpdating}
                        >
                            Save
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            borderColor="var(--color-border)"
                            color={useColorModeValue("gray.600","gray.300")}
                            _hover={{ borderColor: 'gray.500', color: 'gray.100' }}
                            borderRadius="6px"
                            fontSize="sm"
                            fontWeight="500"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                    </Flex>
                )}
            </Flex>

            {/* Fields */}
            <AnimatePresence mode="wait">
                <MotionBox
                    key={isEditing ? 'edit' : 'view'}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
                >
                    <Flex direction="column" gap={6}>
                        {/* Username */}
                        <Box role="group">
                            <Text
                                fontSize="xs"
                                fontWeight="600"
                                color={useColorModeValue("gray.500","gray.400")}
                                textTransform="uppercase"
                                letterSpacing="wider"
                                mb={2}
                            >
                                Username
                            </Text>
                            {isEditing ? (
                                <Input
                                    value={draft.username}
                                    onChange={(e) => setDraft((d) => ({ ...d, username: e.target.value }))}
                                    {...inputStyles}
                                />
                            ) : (
                                <Text
                                    color={useColorModeValue("gray.800","gray.100")}
                                    fontWeight="500"
                                    borderBottom="1px solid"
                                    borderColor="var(--color-border)"
                                    pb={2}
                                    _groupHover={{ borderColor: '#475569' }}
                                    transition="border-color 0.2s"
                                >
                                    {user.username}
                                </Text>
                            )}
                        </Box>

                        {/* Email */}
                        <Box role="group">
                            <Text
                                fontSize="xs"
                                fontWeight="600"
                                color={useColorModeValue("gray.500","gray.400")}
                                textTransform="uppercase"
                                letterSpacing="wider"
                                mb={2}
                            >
                                Email Address
                            </Text>
                            {isEditing ? (
                                <Input
                                    type="email"
                                    value={draft.email}
                                    onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                                    {...inputStyles}
                                />
                            ) : (
                                <Flex
                                    align="center"
                                    justify="space-between"
                                    borderBottom="1px solid"
                                    borderColor="var(--color-border)"
                                    pb={2}
                                    _groupHover={{ borderColor: '#475569' }}
                                    transition="border-color 0.2s"
                                >
                                    <Text color={useColorModeValue("gray.800","gray.100")} fontWeight="500">
                                        {user.email}
                                    </Text>
                                    {user.emailVerified && (
                                        <Badge
                                            display="flex"
                                            alignItems="center"
                                            gap={1}
                                            px={2}
                                            py="2px"
                                            borderRadius="4px"
                                            fontSize="xs"
                                            fontWeight="500"
                                            bg="rgba(16, 185, 129, 0.1)"
                                            color="#10b981"
                                            border="1px solid"
                                            borderColor="rgba(16, 185, 129, 0.2)"
                                        >
                                            <CheckIcon w={3} h={3} />
                                            Verified
                                        </Badge>
                                    )}
                                </Flex>
                            )}
                        </Box>

                        {/* Bio */}
                        <Box role="group">
                            <Text
                                fontSize="xs"
                                fontWeight="600"
                                color={useColorModeValue("gray.500","gray.400")}
                                textTransform="uppercase"
                                letterSpacing="wider"
                                mb={2}
                            >
                                Bio
                            </Text>
                            {isEditing ? (
                                <Textarea
                                    value={draft.bio}
                                    onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
                                    rows={3}
                                    resize="vertical"
                                    {...inputStyles}
                                />
                            ) : (
                                <Text
                                    color={useColorModeValue("gray.600","gray.300")}
                                    fontSize="sm"
                                    lineHeight="1.7"
                                    borderBottom="1px solid"
                                    borderColor="var(--color-border)"
                                    pb={2}
                                    _groupHover={{ borderColor: '#475569' }}
                                    transition="border-color 0.2s"
                                >
                                    {user.bio}
                                </Text>
                            )}
                        </Box>
                    </Flex>
                </MotionBox>
            </AnimatePresence>
        </MotionBox>
    );
};

export default ProfileInfoSection;
