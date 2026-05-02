import React from 'react';
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { Bug, CalendarClock, Headphones, LifeBuoy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSupport } from './SupportProvider';
import SupportCategoryCard from './SupportCategoryCard';

const SupportHub = () => {
  const { t } = useTranslation();
  const { isHubOpen, closeHub, openCategory, openHistory } = useSupport();
  return (
    <Modal isOpen={isHubOpen} onClose={closeHub} size="lg">
      <ModalOverlay />
      <ModalContent bg="var(--color-bg-card)" color="var(--color-text-primary)" border="1px solid var(--color-border)" boxShadow="var(--shadow-custom)">
        <ModalHeader>
          <VStack align="start" spacing={1}>
            <Text display="flex" gap={2} alignItems="center"><LifeBuoy size={18} /> {t('support.title')}</Text>
            <Text fontSize="sm" color="var(--color-text-muted)">{t('support.subtitle')}</Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
            <SupportCategoryCard icon={<CalendarClock size={28} />} color="#3b82f6" title={t('support.scheduleMeeting')} description={t('support.scheduleMeetingDesc')} cta={t('support.getStarted')} onClick={() => openCategory('schedule_meeting')} />
            <SupportCategoryCard icon={<Headphones size={28} />} color="#14b8a6" title={t('support.contactSupport')} description={t('support.contactSupportDesc')} cta={t('support.getStarted')} onClick={() => openCategory('contact_support')} />
            <SupportCategoryCard icon={<Bug size={28} />} color="#f97316" title={t('support.reportBug')} description={t('support.reportBugDesc')} cta={t('support.getStarted')} onClick={() => openCategory('report_bug')} />
          </SimpleGrid>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={openHistory}>{t('support.viewMyRequests')}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SupportHub;

