import React from 'react';
import {
  Sparkles,
  FileSearch,
  BookOpen,
  Smartphone,
  ShieldCheck,
  Zap,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import type { User } from '../types/index.ts';

interface NavbarProps {
  activeTab: 'workspace' | 'plagiarism' | 'documents' | 'mobile' | 'admin';
  setActiveTab: (tab: 'workspace' | 'plagiarism' | 'documents' | 'mobile' | 'admin') => void;
  currentUser: User | null;
  onOpenBilling: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenBilling,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFF9F0]/95 border-b border-[#E8D8C5] transition-all">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          onClick={() => setActiveTab('workspace')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#FF6B35] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-[#0A192F] flex items-center gap-1.5">
              <span>Aura</span>
              <span className="text-[#FF6B35]">Humanize</span>
            </div>
            <div className="text-[10px] text-[#64748B] font-medium tracking-wide uppercase">
              NLP &amp; Similarity SaaS
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-white/80 p-1 border border-[#E8D8C5] rounded-xl shadow-xs">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'workspace'
                ? 'bg-[#FF6B35] text-white shadow-xs'
                : 'text-[#0A192F] hover:bg-[#FFF9F0]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Humanizer
          </button>

          <button
            onClick={() => setActiveTab('plagiarism')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'plagiarism'
                ? 'bg-[#FF6B35] text-white shadow-xs'
                : 'text-[#0A192F] hover:bg-[#FFF9F0]'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" />
            Plagiarism Check
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-[#FF6B35] text-white shadow-xs'
                : 'text-[#0A192F] hover:bg-[#FFF9F0]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            My Documents
          </button>

          <button
            onClick={() => setActiveTab('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'mobile'
                ? 'bg-[#FF6B35] text-white shadow-xs'
                : 'text-[#0A192F] hover:bg-[#FFF9F0]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            React Native / Android API
          </button>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-[#0A192F] text-white shadow-xs'
                  : 'text-[#0A192F] hover:bg-[#FFF9F0]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          )}
        </nav>

        {/* User / Credit Actions */}
        <div className="flex items-center gap-2.5">
          {/* Credit Counter Pill */}
          <button
            onClick={onOpenBilling}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E8D8C5] hover:border-[#FF6B35] text-xs font-bold text-[#0A192F] shadow-xs transition-colors cursor-pointer"
            title="Click to view plans or redeem credits"
          >
            <Zap className="w-3.5 h-3.5 text-[#FF6B35] fill-[#FF6B35]" />
            <span>{currentUser?.credits ?? 35}</span>
            <span className="hidden sm:inline text-[11px] font-medium text-[#64748B]">Credits</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-[#0A192F] leading-tight">{currentUser.name}</span>
                <span className="text-[10px] text-[#FF6B35] uppercase font-semibold">{currentUser.role}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 border border-[#E8D8C5] bg-white hover:bg-[#FFF9F0] text-[#0A192F] rounded-lg cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5 text-[#64748B]" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 bg-[#FF6B35] hover:bg-[#E8551E] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Submenu Bar */}
      <div className="md:hidden flex items-center justify-around bg-white border-t border-[#E8D8C5] py-2 px-1 text-[11px] text-[#0A192F]">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeTab === 'workspace' ? 'text-[#FF6B35] font-bold' : 'text-[#64748B]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Humanize</span>
        </button>
        <button
          onClick={() => setActiveTab('plagiarism')}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeTab === 'plagiarism' ? 'text-[#FF6B35] font-bold' : 'text-[#64748B]'
          }`}
        >
          <FileSearch className="w-4 h-4" />
          <span>Plagiarism</span>
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeTab === 'documents' ? 'text-[#FF6B35] font-bold' : 'text-[#64748B]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Documents</span>
        </button>
        <button
          onClick={() => setActiveTab('mobile')}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeTab === 'mobile' ? 'text-[#FF6B35] font-bold' : 'text-[#64748B]'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Mobile API</span>
        </button>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'admin' ? 'text-[#FF6B35] font-bold' : 'text-[#64748B]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
