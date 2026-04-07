/**
 * AuthHeader – logo + page heading + subtitle for auth flow pages.
 *
 * Props:
 *   icon       – optional React node displayed beside the title
 *   title      – heading text
 *   subtitle   – small description text
 */
import React from 'react';
import { Box, Heading, Text, HStack, useColorModeValue } from '@chakra-ui/react';

const AuthHeader = ({ icon, title, subtitle }) => {
    const headingColor = useColorModeValue('gray.800', 'gray.100');
    const subtitleColor = useColorModeValue('gray.500', 'gray.400');
    return (
        <Box mb={6}>
            {/* Logo */}
            <Box textAlign="center" mb={6}>
                <Text
                    color="#22d3ee"
                    fontFamily="heading"
                    fontSize="2xl"
                    fontWeight="bold"
                    letterSpacing="-0.02em"
                >
                    AlgoArena
                </Text>
            </Box>

            {/* Title row */}
            {icon ? (
                <HStack spacing={2} mb={2}>
                    {icon}
                    <Heading
                        fontFamily="heading"
                        fontSize={{ base: '2xl', md: '3xl' }}
                        fontWeight="semibold"
                        color={headingColor}
                        letterSpacing="-0.02em"
                    >
                        {title}
                    </Heading>
                </HStack>
            ) : (
                <Heading
                    fontFamily="heading"
                    fontSize={{ base: '2xl', md: '3xl' }}
                    fontWeight="semibold"
                    color="gray.100"
                    letterSpacing="-0.02em"
                    textAlign={icon ? 'left' : 'center'}
                    mb={2}
                >
                    {title}
                </Heading>
            )}

            {subtitle && (
                <Text
                    color={subtitleColor}
                    fontSize={{ base: 'sm', md: 'md' }}
                    lineHeight="relaxed"
                    textAlign={icon ? 'left' : 'center'}
                    maxW="sm"
                    mx={icon ? undefined : 'auto'}
                >
                    {subtitle}
                </Text>
            )}
        </Box>
    );
};

export default AuthHeader;
