import React, { useMemo, useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Switch, Text, Textarea, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { BUG_SEVERITIES } from './supportConstants';
import { supportService } from './supportService';
import SupportSuccessScreen from './SupportSuccessScreen';
import { useDeviceInfo } from './useDeviceInfo';
import { useReproductionBundle } from './useReproductionBundle';

const ReportBugForm = ({ isOpen, onClose, onViewHistory }) => {
  const { t } = useTranslation();
  const device = useDeviceInfo();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const { getBundle } = useReproductionBundle();
  const [f, setF] = useState({
    subject: '',
    description: '',
    severity: 'medium',
    pageUrl: device.currentUrl,
    browserInfo: device.browser,
    operatingSystem: device.operatingSystem,
    reproducible: true,
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    priority: 'medium',
  });
  const valid = useMemo(() => f.subject && f.pageUrl && f.stepsToReproduce && f.description, [f]);

  const submit = async () => {
    setLoading(true);
    try {
      const payload = includeDiagnostics ? { ...f, reproductionBundle: getBundle() } : { ...f };
      setSuccess(await supportService.reportBug(payload));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('support.reportBug')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {success ? (
            <SupportSuccessScreen request={success} onDone={onClose} onViewHistory={onViewHistory} />
          ) : (
            <VStack spacing={3}>
              <FormControl isRequired><FormLabel>{t('support.bugTitle')}</FormLabel><Input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value.slice(0, 200) })} /></FormControl>
              <FormControl isRequired><FormLabel>{t('support.severity')}</FormLabel><Select value={f.severity} onChange={(e) => setF({ ...f, severity: e.target.value })}>{BUG_SEVERITIES.map((v) => <option key={v} value={v}>{t(`support.severity_${v}`)}</option>)}</Select></FormControl>
              <FormControl isRequired><FormLabel>{t('support.whereHappened')}</FormLabel><Input value={f.pageUrl} onChange={(e) => setF({ ...f, pageUrl: e.target.value })} /></FormControl>
              <FormControl isRequired><FormLabel>{t('support.stepsToReproduce')}</FormLabel><Textarea value={f.stepsToReproduce} onChange={(e) => setF({ ...f, stepsToReproduce: e.target.value.slice(0, 2000) })} /></FormControl>
              <FormControl><FormLabel>{t('support.expectedBehavior')}</FormLabel><Textarea value={f.expectedBehavior} onChange={(e) => setF({ ...f, expectedBehavior: e.target.value.slice(0, 1000) })} /></FormControl>
              <FormControl><FormLabel>{t('support.actualBehavior')}</FormLabel><Textarea value={f.actualBehavior} onChange={(e) => setF({ ...f, actualBehavior: e.target.value.slice(0, 1000) })} /></FormControl>
              <FormControl><FormLabel>{t('support.reproducible')}</FormLabel><Switch isChecked={f.reproducible} onChange={(e) => setF({ ...f, reproducible: e.target.checked })} /></FormControl>
              <FormControl><FormLabel>{t('support.includeDiagnostics')}</FormLabel><Switch isChecked={includeDiagnostics} onChange={(e) => setIncludeDiagnostics(e.target.checked)} /></FormControl>
              <FormControl><FormLabel>{t('support.additionalInfo')}</FormLabel><Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value.slice(0, 3000) })} /></FormControl>
              <FormControl><FormLabel>{t('support.priority')}</FormLabel><Select value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}><option value="low">{t('support.priority_low')}</option><option value="medium">{t('support.priority_medium')}</option><option value="high">{t('support.priority_high')}</option></Select></FormControl>
              <Box w="full" p={3} borderRadius="md" borderWidth="1px" borderColor="whiteAlpha.200">
                <Text fontWeight="600">{t('support.systemInfo')}</Text>
                <Text fontSize="sm">Browser: {f.browserInfo}</Text>
                <Text fontSize="sm">OS: {f.operatingSystem}</Text>
              </Box>
            </VStack>
          )}
        </ModalBody>
        {!success && <ModalFooter><Button mr={3} variant="ghost" onClick={onClose}>{t('support.cancel')}</Button><Button colorScheme="cyan" isLoading={loading} onClick={submit} isDisabled={!valid}>{t('support.submitBug')}</Button></ModalFooter>}
      </ModalContent>
    </Modal>
  );
};

export default ReportBugForm;

