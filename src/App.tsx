import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { ThreeHeroScene } from './components/ThreeHeroScene.tsx';
import { HumanizerWorkspace } from './components/HumanizerWorkspace.tsx';
import { PlagiarismWorkspace } from './components/PlagiarismWorkspace.tsx';
import { DocumentsView } from './components/DocumentsView.tsx';
import { MobileApiDocsView } from './components/MobileApiDocsView.tsx';
import { AdminView } from './components/AdminView.tsx';
import { BillingModal } from './components/BillingModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { Footer } from './components/Footer.tsx';
import type { User, SavedDocument, WritingStyle } from './types/index.ts';
import { CheckCircle2, Sparkles, Shield, Smartphone, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'workspace' | 'plagiarism' | 'documents' | 'mobile' | 'admin'>('workspace');
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'user_student_1',
    name: 'Ayesha Khan',
    email: 'ayesha@university.edu',
    role: 'student',
    plan: 'free',
    credits: 35,
    totalWordsProcessed: 1420,
    createdAt: new Date().toISOString(),
  });
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync user profile on mount
  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch((err) => console.log('Auth check fallback to demo user:', err));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreditsUpdated = (newCredits: number) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, credits: newCredits });
      showToast(`Credit balance updated: ${newCredits} credits`);
    }
  };

  const handleSaveDocument = async (docData: {
    title: string;
    originalText: string;
    rewrittenText: string;
    style: WritingStyle;
  }) => {
    try {
      const res = await fetch('/api/v1/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docData),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Document saved to your personal library!');
      }
    } catch (e) {
      console.error('Error saving document:', e);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Signed out successfully.');
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] text-[#0A192F] flex flex-col font-sans selection:bg-[#FF6B35]/20 selection:text-[#0A192F]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0A192F] text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 border border-orange-500/30 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#FF6B35]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenBilling={() => setIsBillingOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Hero 3D Scene (Shown on Workspace tab) */}
      {activeTab === 'workspace' && (
        <>
          <ThreeHeroScene onExploreClick={() => setActiveTab('workspace')} />

          {/* Feature Highlights Grid */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E8D8C5] rounded-xl p-4 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[#FFF9F0] border border-[#E8D8C5] flex items-center justify-center text-[#FF6B35] mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-[#0A192F]">Rhythmic Human Flow</h3>
                <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                  Breaks repetitive AI sentence structures with natural human cadence and active voice.
                </p>
              </div>

              <div className="bg-white border border-[#E8D8C5] rounded-xl p-4 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[#FFF9F0] border border-[#E8D8C5] flex items-center justify-center text-[#FF6B35] mb-2">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-[#0A192F]">Citation Integrity</h3>
                <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                  Preserves bracketed indices `[1]`, author dates `(Smith, 2024)`, and statistics.
                </p>
              </div>

              <div className="bg-white border border-[#E8D8C5] rounded-xl p-4 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[#FFF9F0] border border-[#E8D8C5] flex items-center justify-center text-[#FF6B35] mb-2">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-[#0A192F]">Android / Mobile Ready</h3>
                <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                  Full REST API designed for immediate React Native and Android mobile app integration.
                </p>
              </div>

              <div className="bg-white border border-[#E8D8C5] rounded-xl p-4 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[#FFF9F0] border border-[#E8D8C5] flex items-center justify-center text-[#FF6B35] mb-2">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-[#0A192F]">Fair Credit Ledger</h3>
                <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                  Transparent word metering with voucher redemption and instant balance replenishment.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'workspace' && (
          <HumanizerWorkspace
            currentUser={currentUser}
            onCreditsUpdated={handleCreditsUpdated}
            onSaveDocument={handleSaveDocument}
          />
        )}

        {activeTab === 'plagiarism' && (
          <PlagiarismWorkspace
            currentUser={currentUser}
            onCreditsUpdated={handleCreditsUpdated}
          />
        )}

        {activeTab === 'documents' && <DocumentsView />}

        {activeTab === 'mobile' && <MobileApiDocsView />}

        {activeTab === 'admin' && <AdminView />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <BillingModal
        isOpen={isBillingOpen}
        onClose={() => setIsBillingOpen(false)}
        currentUser={currentUser}
        onCreditsUpdated={handleCreditsUpdated}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
