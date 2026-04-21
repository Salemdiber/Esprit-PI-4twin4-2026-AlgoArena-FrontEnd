import React, { useMemo, useState } from 'react';
import { Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Text, Textarea, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { MEETING_TIME_SLOTS, MEETING_TYPES, PRIORITY_OPTIONS } from './supportConstants';
import { supportService } from './supportService';
import SupportSuccessScreen from './SupportSuccessScreen';

const dateOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const ScheduleMeetingForm = ({ isOpen, onClose, onViewHistory }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [f, setF] = useState({
    subject: '',
    description: '',
    meetingType: MEETING_TYPES[0],
    preferredDate: '',
    preferredTimeSlot: MEETING_TIME_SLOTS[0],
    alternativeDate: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    priority: 'medium',
  });
  const valid = useMemo(() => f.subject && f.description && f.preferredDate && f.preferredTimeSlot && f.timezone, [f]);

  const submit = async () => {
    setLoading(true);
    try {
      const request = await supportService.scheduleMeeting(f);
      setSuccess(request);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('support.scheduleMeeting')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {success ? (
            <SupportSuccessScreen request={success} onDone={onClose} onViewHistory={onViewHistory} />
          ) : (
            <VStack spacing={3}>
              <FormControl isRequired><FormLabel>{t('support.meetingSubject')}</FormLabel><Input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value.slice(0, 200) })} /><Text fontSize="xs">{f.subject.length}/200</Text></FormControl>
              <FormControl isRequired><FormLabel>{t('support.meetingDescription')}</FormLabel><Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value.slice(0, 3000) })} /><Text fontSize="xs">{f.description.length}/3000</Text></FormControl>
              <FormControl isRequired><FormLabel>{t('support.meetingFormat')}</FormLabel><Select value={f.meetingType} onChange={(e) => setF({ ...f, meetingType: e.target.value })}>{MEETING_TYPES.map((v) => <option key={v} value={v}>{t(`support.${v}`)}</option>)}</Select></FormControl>
              <FormControl isRequired><FormLabel>{t('support.preferredDate')}</FormLabel><Input type="date" min={dateOffset(1)} max={dateOffset(30)} value={f.preferredDate} onChange={(e) => setF({ ...f, preferredDate: e.target.value })} /></FormControl>
              <FormControl isRequired><FormLabel>{t('support.preferredTime')}</FormLabel><Select value={f.preferredTimeSlot} onChange={(e) => setF({ ...f, preferredTimeSlot: e.target.value })}>{MEETING_TIME_SLOTS.map((v) => <option key={v} value={v}>{v}</option>)}</Select></FormControl>
              <FormControl><FormLabel>{t('support.alternativeDate')}</FormLabel><Input type="date" min={dateOffset(1)} max={dateOffset(30)} value={f.alternativeDate} onChange={(e) => setF({ ...f, alternativeDate: e.target.value })} /></FormControl>
              <FormControl isRequired><FormLabel>{t('support.timezone')}</FormLabel><Input value={f.timezone} onChange={(e) => setF({ ...f, timezone: e.target.value })} /></FormControl>
              <FormControl isRequired><FormLabel>{t('support.priority')}</FormLabel><Select value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}>{PRIORITY_OPTIONS.map((v) => <option key={v} value={v}>{t(`support.priority_${v}`)}</option>)}</Select></FormControl>
            </VStack>
          )}
        </ModalBody>
        {!success && <ModalFooter><Button mr={3} variant="ghost" onClick={onClose}>{t('support.cancel')}</Button><Button colorScheme="cyan" isLoading={loading} onClick={submit} isDisabled={!valid}>{t('support.scheduleMeeting')}</Button></ModalFooter>}
      </ModalContent>
    </Modal>
  );
};

export default ScheduleMeetingForm;

