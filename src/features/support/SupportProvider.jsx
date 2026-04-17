import React, { Suspense, createContext, lazy, useContext, useMemo, useState } from 'react';

const SupportHub = lazy(() => import('./SupportHub'));
const ScheduleMeetingForm = lazy(() => import('./ScheduleMeetingForm'));
const ContactSupportForm = lazy(() => import('./ContactSupportForm'));
const ReportBugForm = lazy(() => import('./ReportBugForm'));
const SupportRequestHistory = lazy(() => import('./SupportRequestHistory'));

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
      <Suspense fallback={null}>
        {isHubOpen && <SupportHub />}
        {isFormOpen && activeCategory === 'schedule_meeting' && (
          <ScheduleMeetingForm isOpen onClose={api.closeForm} onViewHistory={() => { api.closeForm(); api.openHistory(); }} />
        )}
        {isFormOpen && activeCategory === 'contact_support' && (
          <ContactSupportForm isOpen onClose={api.closeForm} onViewHistory={() => { api.closeForm(); api.openHistory(); }} />
        )}
        {isFormOpen && activeCategory === 'report_bug' && (
          <ReportBugForm isOpen onClose={api.closeForm} onViewHistory={() => { api.closeForm(); api.openHistory(); }} />
        )}
        {isHistoryOpen && <SupportRequestHistory isOpen onClose={api.closeHistory} />}
      </Suspense>
    </SupportContext.Provider>
  );
};

export const useSupport = () => {
  const ctx = useContext(SupportContext);
  if (!ctx) throw new Error('useSupport must be used within SupportProvider');
  return ctx;
};

