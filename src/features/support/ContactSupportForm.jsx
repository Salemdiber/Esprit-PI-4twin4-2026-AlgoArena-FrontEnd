import React, { useMemo, useState } from 'react';
import { Button, FormControl, FormLabel, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, Text, Textarea, VStack, Input } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { supportService } from './supportService';
import SupportSuccessScreen from './SupportSuccessScreen';

const ContactSupportForm = ({ isOpen, onClose, onViewHistory }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [f, setF] = useState({ subject: '', description: '', priority: 'medium' });
  const valid = useMemo(() => f.subject && f.description && f.priority, [f]);

  const submit = async () => {
    setLoading(true);
    try {
      setSuccess(await supportService.contactSupport(f));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('support.contactSupport')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {success ? (
            <SupportSuccessScreen request={success} onDone={onClose} onViewHistory={onViewHistory} />
          ) : (
            <VStack spacing={3}>
              <FormControl isRequired><FormLabel>{t('support.subject')}</FormLabel><Input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value.slice(0, 200) })} /><Text fontSize="xs">{f.subject.length}/200</Text></FormControl>
              <FormControl isRequired><FormLabel>{t('support.message')}</FormLabel><Textarea minH="150px" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value.slice(0, 3000) })} /><Text fontSize="xs">{f.description.length}/3000</Text></FormControl>
              <FormControl isRequired><FormLabel>{t('support.urgency')}</FormLabel><RadioGroup value={f.priority} onChange={(v) => setF({ ...f, priority: v })}><VStack align="start"><Radio value="low">{t('support.priority_low')}</Radio><Radio value="medium">{t('support.priority_medium')}</Radio><Radio value="high">{t('support.priority_high')}</Radio></VStack></RadioGroup></FormControl>
            </VStack>
          )}
        </ModalBody>
        {!success && <ModalFooter><Button mr={3} variant="ghost" onClick={onClose}>{t('support.cancel')}</Button><Button colorScheme="cyan" isLoading={loading} onClick={submit} isDisabled={!valid}>{t('support.sendMessage')}</Button></ModalFooter>}
      </ModalContent>
    </Modal>
  );
};

export default ContactSupportForm;

