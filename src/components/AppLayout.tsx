'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatbotPopup from '@/components/ChatbotPopup';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <>
      <Sidebar onChatbotClick={() => setIsChatbotOpen(true)} />
      {children}
      <ChatbotPopup
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />
    </>
  );
}
