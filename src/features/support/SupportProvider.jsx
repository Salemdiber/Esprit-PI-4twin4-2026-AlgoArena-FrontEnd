import React, { createContext, useContext, useMemo, useState } from 'react';
import SupportHub from './SupportHub';
import ScheduleMeetingForm from './ScheduleMeetingForm';
import ContactSupportForm from './ContactSupportForm';
import ReportBugForm from './ReportBugForm';
import SupportRequestHistory from './SupportRequestHistory';

const SupportContext = createContext(null);

export const SupportProvider = ({ children }) => {
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [lastSubmittedRequest, setLastSubmittedRequest] = useState(null);

  const api = useMemo(() => ({
    isHubOpen,
    isFormOpen,
    activeCategory,
    isHistoryOpen,
    lastSubmittedRequest,
    openHub: () => setIsHubOpen(true),
    closeHub: () => setIsHubOpen(false),
    openCategory: (c) => {
      setIsHubOpen(false);
      setActiveCategory(c);
      setIsFormOpen(true);
    },
    closeForm: () => {
      setIsFormOpen(false);
      setActiveCategory(null);
      setLastSubmittedRequest(null);
    },
    openHistory: () => setIsHistoryOpen(true),
    closeHistory: () => setIsHistoryOpen(false),
    setLastSubmittedRequest,
  }), [activeCategory, isFormOpen, isHistoryOpen, isHubOpen, lastSubmittedRequest]);

  return (
    <SupportContext.Provider value={api}>
      {children}
      <SupportHub />
      <ScheduleMeetingForm isOpen={isFormOpen && activeCategory === 'schedule_meeting'} onClose={api.closeForm} onViewHistory={() => { api.closeForm(); api.openHistory(); }} />
      <ContactSupportForm isOpen={isFormOpen && activeCategory === 'contact_support'} onClose={api.closeForm} onViewHistory={() => { api.closeForm(); api.openHistory(); }} />
      <ReportBugForm isOpen={isFormOpen && activeCategory === 'report_bug'} onClose={api.closeForm} onViewHistory={() => { api.closeForm(); api.openHistory(); }} />
      <SupportRequestHistory isOpen={isHistoryOpen} onClose={api.closeHistory} />
    </SupportContext.Provider>
  );
};

export const useSupport = () => {
  const ctx = useContext(SupportContext);
  if (!ctx) throw new Error('useSupport must be used within SupportProvider');
  return ctx;
};

