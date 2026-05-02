import React, { useEffect, useState } from 'react';
import { Badge, Box, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Skeleton, Tab, TabList, TabPanel, TabPanels, Tabs, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { supportService } from './supportService';

const statusColor = { pending: 'yellow', in_review: 'blue', resolved: 'green', closed: 'gray' };

const SupportRequestHistory = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    supportService.getMyRequests(1, 20).then((r) => setItems(r.items || [])).finally(() => setLoading(false));
  }, [isOpen]);

  const renderList = (filter) => {
    const filtered = items.filter((i) => (filter === 'open' ? ['pending', 'in_review'].includes(i.status) : filter === 'resolved' ? ['resolved', 'closed'].includes(i.status) : true));
    if (loading) return <Skeleton h="80px" />;
    if (!filtered.length) return <Text color="var(--color-text-muted)">{t('support.noRequests')}</Text>;
    return (
      <VStack align="stretch" spacing={3}>
        {filtered.map((i) => (
          <Box key={i._id} p={3} borderWidth="1px" borderColor="var(--color-border)" bg="var(--color-bg-secondary)" borderRadius="lg">
            <Text fontFamily="mono" fontSize="xs" color="var(--color-cyan-400)">{i.referenceNumber}</Text>
            <Text fontWeight="600" color="var(--color-text-heading)">{i.subject}</Text>
            <Badge colorScheme={statusColor[i.status] || 'gray'}>{t(`support.status_${i.status}`)}</Badge>
          </Box>
        ))}
      </VStack>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="var(--color-bg-card)" color="var(--color-text-primary)" border="1px solid var(--color-border)" boxShadow="var(--shadow-custom)">
        <ModalHeader>{t('support.myRequests')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Tabs>
            <TabList>
              <Tab>{t('support.all')}</Tab>
              <Tab>{t('support.open')}</Tab>
              <Tab>{t('support.resolved')}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>{renderList('all')}</TabPanel>
              <TabPanel>{renderList('open')}</TabPanel>
              <TabPanel>{renderList('resolved')}</TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SupportRequestHistory;

