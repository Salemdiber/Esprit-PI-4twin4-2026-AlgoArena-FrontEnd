/**
 * ProblemTabs – Description | Discussion | Submissions tabs.
 * Uses Chakra Tabs with custom dark styling.
 */
import React from 'react';
import {
    Tabs,
    TabList,
    Tab,
    useColorModeValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useChallengeContext } from '../context/ChallengeContext';

const ProblemTabs = () => {
    const { t } = useTranslation();
    const { activeTab, setActiveTab } = useChallengeContext();

    const tabLabels = [t('challengePage.tabDescription'), t('challengePage.tabSubmissions'), t('challengePage.tabAiJudge')];

    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const inactiveColor = useColorModeValue('gray.500', 'gray.400');
    const hoverColor = useColorModeValue('gray.900', 'gray.100');

    return (
        <Tabs
            index={activeTab}
            onChange={setActiveTab}
            variant="unstyled"
            borderBottom="1px solid"
            borderColor={borderColor}
            mb={6}
        >
            <TabList gap={6}>
                {tabLabels.map((label, i) => (
                    <Tab
                        key={label}
                        pb={3}
                        fontSize="sm"
                        fontWeight="semibold"
                        color={activeTab === i ? 'brand.500' : inactiveColor}
                        borderBottom="2px solid"
                        borderColor={activeTab === i ? 'brand.500' : 'transparent'}
                        _hover={{ color: activeTab === i ? 'brand.500' : hoverColor }}
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
