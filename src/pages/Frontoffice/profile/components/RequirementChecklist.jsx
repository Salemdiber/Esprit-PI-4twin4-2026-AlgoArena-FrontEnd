/**
 * RequirementChecklist – shows password requirement items with met / unmet states.
 *
 * Props:
 *  • requirements  Array<{ id, label, met }>
 */
import React from 'react';
import { SimpleGrid, Flex, Text, Box, Icon } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';

const RequirementChecklist = ({ requirements }) => {
    return (
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2} mt={3}>
            {requirements.map((req) => (
                <Flex key={req.id} align="center">
                    {req.met ? (
                        <Icon as={CheckIcon} w={3} h={3} color="#10b981" mr={2} />
                    ) : (
                        <Box
                            w="12px"
                            h="12px"
                            borderRadius="full"
                            border="1px solid"
                            borderColor="var(--color-border)"
                            mr={2}
                            flexShrink={0}
                        />
                    )}
                    <Text fontSize="xs" color={req.met ? '#10b981' : 'gray.500'}>
                        {req.label}
                    </Text>
                </Flex>
            ))}
        </SimpleGrid>
    );
};

export default RequirementChecklist;
