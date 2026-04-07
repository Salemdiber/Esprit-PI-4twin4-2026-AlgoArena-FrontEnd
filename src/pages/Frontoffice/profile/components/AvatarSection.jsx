/**
 * AvatarSection – avatar preview with upload / remove / drag-and-drop.
 *
 * Reads user.avatar from ProfileContext.
 * Uses a hidden file input triggered by the camera IconButton or Upload button.
 */
import React, { useRef, useState, useCallback } from 'react';
import {
    Box,
    Flex,
    Avatar,
    IconButton,
    Button,
    Text,
    Icon,
    Spinner,
    useColorModeValue,
} from '@chakra-ui/react';
import { motion, useReducedMotion } from 'framer-motion';
import { useProfile } from '../context/ProfileContext';

const MotionBox = motion.create(Box);

/* ── inline icons ── */
const CameraIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
    </Icon>
);

const UploadIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
    </Icon>
);

const AvatarSection = () => {
    const { user, updateAvatar, removeAvatar, isUpdating } = useProfile();
    const fileInputRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    const handleFile = useCallback(
        (file) => {
            if (!file || !file.type.startsWith('image/')) return;
            if (file.size > 5 * 1024 * 1024) return; // 5 MB limit
            updateAvatar(file);
        },
        [updateAvatar],
    );

    const onFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        e.target.value = '';
    };

    /* Drag-and-drop handlers */
    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    const onDragLeave = () => setIsDragOver(false);
    const onDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <MotionBox
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
            bg="var(--color-bg-secondary)"
            borderRadius="12px"
            boxShadow="var(--shadow-card)"
            borderTop="2px solid #22d3ee"
            p={{ base: 6, md: 8 }}
            position="relative"
            overflow="hidden"
            role="group"
            _hover={{
                '& > .hover-overlay': { opacity: 1 },
            }}
        >
            {/* Subtle hover overlay */}
            <Box
                className="hover-overlay"
                position="absolute"
                inset={0}
                bg="rgba(34, 211, 238, 0.04)"
                opacity={0}
                transition="opacity 0.5s"
                pointerEvents="none"
            />

            <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'center', md: 'flex-start' }}
                gap={6}
                position="relative"
                zIndex={1}
            >
                {/* Avatar circle */}
                <Box position="relative" cursor="pointer" onClick={() => fileInputRef.current?.click()}>
                    <Box
                        w={{ base: '96px', md: '128px' }}
                        h={{ base: '96px', md: '128px' }}
                        borderRadius="full"
                        border="4px solid"
                        borderColor="var(--color-border)"
                        overflow="hidden"
                        boxShadow="lg"
                        transition="box-shadow 0.3s"
                        _hover={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.25)' }}
                    >
                        {isUpdating ? (
                            <Flex w="100%" h="100%" align="center" justify="center" bg="var(--color-bg-primary)">
                                <Spinner color="#22d3ee" />
                            </Flex>
                        ) : (
                            <Avatar
                                src={user.avatar}
                                name={user.username}
                                w="100%"
                                h="100%"
                                borderRadius="0"
                            />
                        )}
                    </Box>

                    <IconButton
                        aria-label="Edit Avatar"
                        icon={<CameraIcon w={4} h={4} />}
                        position="absolute"
                        bottom={0}
                        right={0}
                        size="sm"
                        bg="#22d3ee"
                        color="#0f172a"
                        borderRadius="full"
                        border="2px solid var(--color-bg-secondary)"
                        _hover={{ transform: 'scale(1.1)' }}
                        transition="transform 0.2s"
                        onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                        }}
                    />
                </Box>

                {/* Content */}
                <Flex
                    flex={1}
                    direction="column"
                    align={{ base: 'center', md: 'flex-start' }}
                    textAlign={{ base: 'center', md: 'left' }}
                    gap={4}
                    w="100%"
                >
                    <Box>
                        <Text fontFamily="heading" fontSize="lg" fontWeight="600" color={useColorModeValue("gray.800","gray.100")}>
                            Profile Avatar
                        </Text>
                        <Text color={useColorModeValue("gray.500","gray.400")} fontSize="sm" mt={1}>
                            Update your profile picture. Max size 5MB.
                        </Text>
                    </Box>

                    <Flex direction={{ base: 'column', sm: 'row' }} gap={4} w={{ base: '100%', md: 'auto' }}>
                        <Button
                            leftIcon={<UploadIcon w={4} h={4} />}
                            bg="#22d3ee"
                            color="#0f172a"
                            fontWeight="500"
                            borderRadius="6px"
                            fontSize="sm"
                            _hover={{ bg: '#67e8f9', boxShadow: '0 0 20px rgba(34, 211, 238, 0.4)' }}
                            boxShadow="0 4px 14px rgba(34, 211, 238, 0.2)"
                            onClick={() => fileInputRef.current?.click()}
                            isLoading={isUpdating}
                        >
                            Upload New Avatar
                        </Button>

                        <Button
                            variant="outline"
                            borderColor="var(--color-border)"
                            color={useColorModeValue("gray.600","gray.300")}
                            fontWeight="500"
                            borderRadius="6px"
                            fontSize="sm"
                            _hover={{ color: 'gray.100', borderColor: 'gray.500' }}
                            onClick={removeAvatar}
                            isDisabled={!user.avatar}
                        >
                            Remove
                        </Button>
                    </Flex>

                    {/* Drop zone (desktop only) */}
                    <Box
                        display={{ base: 'none', md: 'block' }}
                        w="100%"
                        mt={4}
                        border="2px dashed"
                        borderColor={isDragOver ? '#22d3ee' : 'var(--color-border)'}
                        borderRadius="8px"
                        p={4}
                        textAlign="center"
                        bg={isDragOver ? 'rgba(34, 211, 238, 0.06)' : 'transparent'}
                        _hover={{ bg: 'rgba(55, 65, 81, 0.3)', borderColor: '#475569' }}
                        transition="all 0.2s"
                        cursor="pointer"
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Text fontSize="xs" color="gray.500">
                            Or drag and drop an image here
                        </Text>
                    </Box>
                </Flex>
            </Flex>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={onFileChange}
            />
        </MotionBox>
    );
};

export default AvatarSection;
