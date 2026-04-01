/**
 * ProblemTabs – Description | Discussion | Submissions tabs.
 * Uses Chakra Tabs with custom dark styling.
 */
import React from 'react';
import {
    Tabs,
    TabList,
    Tab,
} from '@chakra-ui/react';
import { useChallengeContext } from '../context/ChallengeContext';

const ProblemTabs = () => {
    const { activeTab, setActiveTab } = useChallengeContext();

    return (
        <Tabs
            index={activeTab}
            onChange={setActiveTab}
            variant="unstyled"
            borderBottom="1px solid"
            borderColor="gray.700"
            mb={6}
        >
            <TabList gap={6}>
                {['Description', 'Submissions'].map((label, i) => (
                    <Tab
                        key={label}
                        pb={3}
                        fontSize="sm"
                        fontWeight="semibold"
                        color={activeTab === i ? 'brand.500' : 'gray.400'}
                        borderBottom="2px solid"
                        borderColor={activeTab === i ? 'brand.500' : 'transparent'}
                        _hover={{ color: activeTab === i ? 'brand.500' : 'gray.100' }}
                        transition="all 0.2s"
                        px={0}
                    >
                        {label}
                    </Tab>
                ))}
            </TabList>
        </Tabs>
    );
};

export default ProblemTabs;
